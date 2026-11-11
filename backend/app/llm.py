"""Thin wrapper around the Gemini API that returns validated Pydantic objects."""

import logging
import os
from typing import TypeVar

from google import genai
from google.genai import errors, types
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)
# A plain prompt, or parts such as audio + text.
Contents = str | list[types.Part]
log = logging.getLogger("uvicorn.error")

# Tried in order. Free-tier limits are per model (gemini-3.8-flash: 20 requests/day),
# so when one model hits its limit (429) the next one answers instead.
DEFAULT_MODELS = "gemini-3.8-flash,gemini-3.5-flash,gemini-3.5-flash-lite"
# "low" keeps answers fast (~3s) without hurting quality for these short tasks.
DEFAULT_THINKING_LEVEL = "low"


class LLMError(Exception):
    """Raised when the model call fails. `status` is the HTTP status the API should return."""

    def __init__(self, message: str, status: int = 502):
        super().__init__(message)
        self.status = status


_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise LLMError("GEMINI_API_KEY is not set. Add it to backend/.env.", status=500)
        _client = genai.Client(api_key=api_key)
    return _client


def model_names() -> list[str]:
    raw = os.getenv("GEMINI_MODELS") or DEFAULT_MODELS
    return [name.strip() for name in raw.split(",") if name.strip()]


def _thinking_config() -> types.ThinkingConfig | None:
    # Set GEMINI_THINKING_LEVEL=none to send no thinking setting.
    level = os.getenv("GEMINI_THINKING_LEVEL") or DEFAULT_THINKING_LEVEL
    return None if level == "none" else types.ThinkingConfig(thinking_level=level)


def _config(system: str, schema: type[BaseModel], thinking: types.ThinkingConfig | None) -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        system_instruction=system,
        response_mime_type="application/json",
        response_schema=schema,
        temperature=0.3,
        thinking_config=thinking,
    )


async def _call_model(model: str, system: str, user: Contents, schema: type[T]) -> types.GenerateContentResponse:
    client = _get_client()
    thinking = _thinking_config()
    try:
        return await client.aio.models.generate_content(
            model=model, contents=user, config=_config(system, schema, thinking)
        )
    except errors.ClientError as err:
        # Some models don't accept a thinking level; retry once without it.
        if err.code == 400 and thinking is not None and "thinking" in str(err).lower():
            return await client.aio.models.generate_content(
                model=model, contents=user, config=_config(system, schema, None)
            )
        raise


async def generate_json(system: str, user: Contents, schema: type[T]) -> T:
    """Ask Gemini for a JSON answer that matches `schema`, falling back across models on rate limits."""
    last_error: errors.APIError | None = None
    response: types.GenerateContentResponse | None = None

    for model in model_names():
        try:
            response = await _call_model(model, system, user, schema)
            break
        except errors.APIError as err:
            last_error = err
            if err.code in (401, 403):
                raise LLMError("The Gemini API key was rejected. Check GEMINI_API_KEY in backend/.env.", 500) from err
            if err.code in (429, 404):
                # Rate limit or model not available on this key: try the next model.
                log.warning("Gemini model %s unavailable (%s), trying next model", model, err.code)
                continue
            raise LLMError(f"The AI request failed ({err.code}). Try again.", 502) from err

    if response is None:
        if last_error is not None and last_error.code == 429:
            raise LLMError(
                "The free AI quota is used up for now. Try again later, or add another Gemini API key.", 429
            ) from last_error
        raise LLMError("No Gemini model is available. Check GEMINI_MODELS in backend/.env.", 502) from last_error

    parsed = response.parsed
    if isinstance(parsed, schema):
        return parsed
    # Fall back to validating the raw text if the SDK did not parse it.
    if response.text:
        try:
            return schema.model_validate_json(response.text)
        except ValueError as err:
            raise LLMError("The AI returned an answer in an unexpected format. Try again.") from err
    raise LLMError("The AI returned an empty answer. Try again.")
