"""Thin wrapper around the AI APIs that returns validated Pydantic objects.

Two providers:
  - "gateway": an OpenAI-compatible API (AI_GATEWAY_* in .env), e.g. gpt-6.1-sol.
  - "gemini": the Gemini API (GEMINI_* in .env). Either Google's own (free AI Studio key, ~20
    requests/day per model) or a gateway that speaks the Gemini API (set GEMINI_BASE_URL).
Text tasks try the gateway first, then Gemini. Voice recordings try Gemini first (it handles
mixed-language speech best), then the gateway. Either provider can be left out of .env.
When a model fails (rate limit, outage, bad key), the next one answers.
"""

import base64
import json
import logging
import os
import time
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Any, TypeVar

import openai
from google import genai
from google.genai import errors, types
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)
# A plain prompt, or parts such as audio + text.
Contents = str | list[types.Part]
log = logging.getLogger("uvicorn.error")

DEFAULT_GATEWAY_MODELS = "gpt-6.1-sol"
# gpt-6.1-sol does not accept audio, so recordings go to a gateway model that does.
DEFAULT_GATEWAY_AUDIO_MODELS = "gemini-3.8-flash"
# Free-tier limits are per model (gemini-3.8-flash: 20 requests/day).
DEFAULT_GEMINI_MODELS = "gemini-3.8-flash,gemini-3.5-flash,gemini-3.5-flash-lite"
# "low" keeps Gemini answers fast (~3s) without hurting quality for these short tasks.
DEFAULT_THINKING_LEVEL = "low"


class LLMError(Exception):
    """Raised when the model call fails. `status` is the HTTP status the API should return."""

    def __init__(self, message: str, status: int = 502):
        super().__init__(message)
        self.status = status


@dataclass(frozen=True)
class Candidate:
    provider: str  # "gateway" or "gemini"
    model: str

    def __str__(self) -> str:
        return f"{self.provider}:{self.model}"


def _split(raw: str) -> list[str]:
    return [name.strip() for name in raw.split(",") if name.strip()]


def _has_audio(user: Contents) -> bool:
    return not isinstance(user, str) and any(part.inline_data for part in user)


def candidates(with_audio: bool = False) -> list[Candidate]:
    gateway: list[Candidate] = []
    gemini: list[Candidate] = []
    if os.getenv("AI_GATEWAY_API_KEY"):
        if with_audio:
            names = os.getenv("AI_GATEWAY_AUDIO_MODELS") or DEFAULT_GATEWAY_AUDIO_MODELS
        else:
            names = os.getenv("AI_GATEWAY_MODELS") or DEFAULT_GATEWAY_MODELS
        gateway = [Candidate("gateway", name) for name in _split(names)]
    if os.getenv("GEMINI_API_KEY"):
        names = os.getenv("GEMINI_MODELS") or DEFAULT_GEMINI_MODELS
        if with_audio:
            names = os.getenv("GEMINI_AUDIO_MODELS") or names
        gemini = [Candidate("gemini", name) for name in _split(names)]
    found = gemini + gateway if with_audio else gateway + gemini
    if not found:
        raise LLMError("No AI key is set. Add AI_GATEWAY_API_KEY or GEMINI_API_KEY to backend/.env.", 500)
    return found


def model_names() -> list[str]:
    try:
        return [str(candidate) for candidate in candidates()]
    except LLMError:
        return []


# ---------- Gemini ----------

_gemini_client: genai.Client | None = None


def _gemini() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        base_url = os.getenv("GEMINI_BASE_URL")
        # Gemini-compatible gateways serve the v1beta API under their own base URL.
        http_options = types.HttpOptions(base_url=base_url, api_version="v1beta") if base_url else None
        _gemini_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"], http_options=http_options)
    return _gemini_client


def _thinking_config() -> types.ThinkingConfig | None:
    # Set GEMINI_THINKING_LEVEL=none to send no thinking setting.
    level = os.getenv("GEMINI_THINKING_LEVEL") or DEFAULT_THINKING_LEVEL
    return None if level == "none" else types.ThinkingConfig(thinking_level=level)


def _gemini_config(system: str, schema: type[BaseModel], thinking: types.ThinkingConfig | None) -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        system_instruction=system,
        response_mime_type="application/json",
        response_schema=schema,
        temperature=0.3,
        thinking_config=thinking,
    )


def _is_thinking_rejection(err: errors.APIError, thinking: types.ThinkingConfig | None) -> bool:
    # Some models don't accept a thinking level; those calls are retried once without it.
    return err.code == 400 and thinking is not None and "thinking" in str(err).lower()


async def _gemini_text(model: str, system: str, user: Contents, schema: type[BaseModel]) -> str:
    thinking = _thinking_config()
    try:
        response = await _gemini().aio.models.generate_content(
            model=model, contents=user, config=_gemini_config(system, schema, thinking)
        )
    except errors.ClientError as err:
        if not _is_thinking_rejection(err, thinking):
            raise
        response = await _gemini().aio.models.generate_content(
            model=model, contents=user, config=_gemini_config(system, schema, None)
        )
    return response.text or ""


async def _gemini_stream(model: str, system: str, user: Contents, schema: type[BaseModel]) -> AsyncIterator[str]:
    thinking = _thinking_config()
    try:
        stream = await _gemini().aio.models.generate_content_stream(
            model=model, contents=user, config=_gemini_config(system, schema, thinking)
        )
    except errors.ClientError as err:
        if not _is_thinking_rejection(err, thinking):
            raise
        stream = await _gemini().aio.models.generate_content_stream(
            model=model, contents=user, config=_gemini_config(system, schema, None)
        )
    async for chunk in stream:
        if chunk.text:
            yield chunk.text


# ---------- OpenAI-compatible gateway ----------

_gateway_client: openai.AsyncOpenAI | None = None


def _gateway() -> openai.AsyncOpenAI:
    global _gateway_client
    if _gateway_client is None:
        base_url = os.getenv("AI_GATEWAY_BASE_URL") or "https://factchat-cloud.mindlogic.ai/v1/gateway"
        _gateway_client = openai.AsyncOpenAI(api_key=os.environ["AI_GATEWAY_API_KEY"], base_url=base_url, timeout=60, max_retries=0)
    return _gateway_client


def _gateway_messages(system: str, user: Contents) -> list[dict[str, Any]]:
    if isinstance(user, str):
        content: str | list[dict[str, Any]] = user
    else:
        content = []
        for part in user:
            if part.text:
                content.append({"type": "text", "text": part.text})
            elif part.inline_data and part.inline_data.data:
                audio_format = (part.inline_data.mime_type or "audio/wav").split("/")[-1]
                encoded = base64.b64encode(part.inline_data.data).decode()
                content.append({"type": "input_audio", "input_audio": {"data": encoded, "format": audio_format}})
    return [{"role": "system", "content": system}, {"role": "user", "content": content}]


# Models that refused response_format=json_schema (e.g. gpt-audio-1.5). They get the schema in the prompt instead.
_no_json_schema: set[str] = set()


def _gateway_request(model: str, system: str, user: Contents, schema: type[BaseModel]) -> dict[str, Any]:
    json_schema = schema.model_json_schema()
    request: dict[str, Any] = {"model": model}
    if model in _no_json_schema:
        system += (
            "\n\nReply with only a JSON object (no code fences) that matches this JSON Schema:\n"
            + json.dumps(json_schema, ensure_ascii=False)
        )
    else:
        request["response_format"] = {"type": "json_schema", "json_schema": {"name": schema.__name__, "schema": json_schema}}
    request["messages"] = _gateway_messages(system, user)
    if _has_audio(user):
        request["modalities"] = ["text"]
    effort = os.getenv("AI_GATEWAY_REASONING_EFFORT")
    if effort:
        request["reasoning_effort"] = effort
    return request


def _is_json_schema_rejection(err: Exception, model: str) -> bool:
    if isinstance(err, openai.BadRequestError) and model not in _no_json_schema and "response_format" in str(err):
        log.info("gateway:%s does not support json_schema; putting the schema in the prompt", model)
        _no_json_schema.add(model)
        return True
    return False


async def _gateway_text(model: str, system: str, user: Contents, schema: type[BaseModel]) -> str:
    try:
        response = await _gateway().chat.completions.create(**_gateway_request(model, system, user, schema))
    except openai.BadRequestError as err:
        if not _is_json_schema_rejection(err, model):
            raise
        response = await _gateway().chat.completions.create(**_gateway_request(model, system, user, schema))
    if not response.choices:
        return ""
    return response.choices[0].message.content or ""


async def _gateway_stream(model: str, system: str, user: Contents, schema: type[BaseModel]) -> AsyncIterator[str]:
    try:
        stream = await _gateway().chat.completions.create(**_gateway_request(model, system, user, schema), stream=True)
    except openai.BadRequestError as err:
        if not _is_json_schema_rejection(err, model):
            raise
        stream = await _gateway().chat.completions.create(**_gateway_request(model, system, user, schema), stream=True)
    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


# ---------- shared fallback logic ----------


def _status(err: Exception) -> int | None:
    """HTTP-like status of a provider error, or None if it is not a provider error."""
    if isinstance(err, errors.APIError):
        return err.code
    if isinstance(err, openai.APIStatusError):
        return err.status_code
    if isinstance(err, openai.APIConnectionError):  # includes timeouts
        return 503
    return None


def _should_try_next(err: Exception, candidate: Candidate) -> bool:
    """True when another model might succeed; raises LLMError for errors no model will fix."""
    status = _status(err)
    if status is None:
        raise err
    # Bad key, no credit, rate limit, model not available, or a temporary outage.
    if status in (401, 402, 403, 404, 429) or status >= 500:
        log.warning("%s unavailable (%s), trying next model", candidate, status)
        return True
    log.warning("%s rejected the request (%s): %s", candidate, status, str(err)[:300])
    raise LLMError(f"The AI request failed ({status}). Try again.", 502) from err


def _all_failed(last_error: Exception | None) -> LLMError:
    status = _status(last_error) if last_error is not None else None
    if status in (401, 403):
        return LLMError("The AI API key was rejected. Check the keys in backend/.env.", 500)
    if status == 429:
        return LLMError("The AI quota is used up for now. Try again later, or add another API key.", 429)
    if status is not None and status >= 500:
        return LLMError("The AI service is busy right now. Try again in a moment.", 503)
    return LLMError("No AI model is available. Check the model names in backend/.env.", 502)


def _validate(text: str, schema: type[T]) -> T:
    if not text:
        raise LLMError("The AI returned an empty answer. Try again.")
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`").removeprefix("json").strip()
    try:
        return schema.model_validate_json(text)
    except ValueError as err:
        raise LLMError("The AI returned an answer in an unexpected format. Try again.") from err


async def generate_json(system: str, user: Contents, schema: type[T]) -> T:
    """Ask for a JSON answer that matches `schema`, falling back across models when one fails."""
    last_error: Exception | None = None
    for candidate in candidates(with_audio=_has_audio(user)):
        started = time.perf_counter()
        call = _gateway_text if candidate.provider == "gateway" else _gemini_text
        try:
            text = await call(candidate.model, system, user, schema)
        except Exception as err:  # noqa: BLE001 - _should_try_next re-raises unknown errors
            last_error = err
            if _should_try_next(err, candidate):
                continue
        log.info("%s answered %s in %.1fs", candidate, schema.__name__, time.perf_counter() - started)
        return _validate(text, schema)
    raise _all_failed(last_error) from last_error


async def stream_json_text(system: str, user: Contents, schema: type[BaseModel]) -> AsyncIterator[str]:
    """Yield the model's JSON answer piece by piece as it is written.

    Falls back to the next model if one fails before its first piece arrives.
    The caller joins the pieces and validates them against `schema` at the end.
    """
    last_error: Exception | None = None
    for candidate in candidates(with_audio=_has_audio(user)):
        started = time.perf_counter()
        open_stream = _gateway_stream if candidate.provider == "gateway" else _gemini_stream
        stream = open_stream(candidate.model, system, user, schema)
        try:
            first = await anext(stream, None)  # errors such as 429 surface here
        except Exception as err:  # noqa: BLE001
            last_error = err
            if _should_try_next(err, candidate):
                continue

        log.info("%s started %s after %.1fs", candidate, schema.__name__, time.perf_counter() - started)
        if first:
            yield first
        try:
            async for piece in stream:
                yield piece
        except Exception as err:
            if _status(err) is None:
                raise
            raise LLMError("The AI stopped in the middle of the answer. Try again.", 502) from err
        log.info("%s finished %s in %.1fs", candidate, schema.__name__, time.perf_counter() - started)
        return
    raise _all_failed(last_error) from last_error
