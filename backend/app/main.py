"""FastAPI server. Run from the backend/ folder:  uvicorn app.main:app --reload --port 8000 --timeout-graceful-shutdown 2"""

import base64
import binascii
import json
import logging
import os
import time
from collections.abc import AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from google.genai import types
from pydantic import ValidationError

load_dotenv()  # reads backend/.env

from . import prompts  # noqa: E402
from .llm import LLMError, generate_json, model_names, stream_json_text  # noqa: E402
from .schemas import (  # noqa: E402
    AudioInput,
    AudioIntentLLMOutput,
    IntentLLMOutput,
    ListenExplainRequest,
    ListenExplainResponse,
    ListenTranscribeRequest,
    ListenTranscribeResponse,
    RewriteLLMOutput,
    SpeakIntentRequest,
    SpeakIntentResponse,
    SpeakRewriteRequest,
    SpeakRewriteResponse,
    WritingComposeRequest,
    WritingComposeResponse,
)

app = FastAPI(title="SWAITHON backend")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


log = logging.getLogger("uvicorn.error")


@app.middleware("http")
async def log_duration(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    # Streaming endpoints log their own finish time (here the response has only just started).
    if request.method == "POST" and not request.url.path.endswith("/stream"):
        log.info("%s %s -> %s in %.1fs", request.method, request.url.path, response.status_code, time.perf_counter() - started)
    return response


@app.exception_handler(LLMError)
async def handle_llm_error(_: Request, err: LLMError) -> JSONResponse:
    return JSONResponse(status_code=err.status, content={"detail": str(err)})


@app.get("/health")
async def health() -> dict[str, object]:
    return {
        "status": "ok",
        "models": model_names(),
        "hasGatewayKey": bool(os.getenv("AI_GATEWAY_API_KEY")),
        "hasGeminiKey": bool(os.getenv("GEMINI_API_KEY")),
    }


def _audio_contents(audio: AudioInput, browser_text: str) -> list[types.Part]:
    """The recording plus the browser's live transcript as a hint."""
    try:
        audio_bytes = base64.b64decode(audio.data, validate=True)
    except (binascii.Error, ValueError):
        raise LLMError("The recording could not be read. Try again.", 400) from None
    hint = f"Browser transcript (may be wrong): {browser_text}" if browser_text else "No browser transcript."
    return [types.Part.from_bytes(data=audio_bytes, mime_type=audio.mimeType), types.Part.from_text(text=hint)]


@app.post("/speak/intent", response_model=SpeakIntentResponse)
async def speak_intent(body: SpeakIntentRequest) -> SpeakIntentResponse:
    browser_text = body.sourceText.strip()

    if body.audio is None:
        user_message = prompts.intent_user_message(browser_text, body.language)
        result = await generate_json(prompts.INTENT_SYSTEM, user_message, IntentLLMOutput)
        return SpeakIntentResponse(sourceText=browser_text, intentEnglish=result.intentEnglish.strip())

    contents = _audio_contents(body.audio, browser_text)
    contents.append(types.Part.from_text(text=prompts.app_language_line(body.language)))
    result = await generate_json(prompts.AUDIO_INTENT_SYSTEM, contents, AudioIntentLLMOutput)

    transcript = result.transcript.strip() or browser_text
    if not transcript:
        raise LLMError("I couldn't hear any speech in the recording. Tap the mic and try again.", 422)
    return SpeakIntentResponse(sourceText=transcript, intentEnglish=result.intentEnglish.strip())


@app.post("/speak/rewrite", response_model=SpeakRewriteResponse)
async def speak_rewrite(body: SpeakRewriteRequest) -> SpeakRewriteResponse:
    user_message = prompts.rewrite_user_message(
        body.sourceText, body.intentEnglish, body.relationship, body.closeness, body.language
    )
    result = await generate_json(prompts.REWRITE_SYSTEM, user_message, RewriteLLMOutput)
    return SpeakRewriteResponse(korean=result.korean.strip(), tone=result.tone, corrections=result.corrections)


@app.post("/listen/transcribe", response_model=ListenTranscribeResponse)
async def listen_transcribe(body: ListenTranscribeRequest) -> ListenTranscribeResponse:
    hint = body.hint.strip()
    result = await generate_json(prompts.LISTEN_TRANSCRIBE_SYSTEM, _audio_contents(body.audio, hint), ListenTranscribeResponse)
    korean = result.korean.strip() or hint
    if not korean:
        raise LLMError("I couldn't hear any speech in the recording. Tap the mic and try again.", 422)
    return ListenTranscribeResponse(korean=korean)


@app.post("/listen/explain", response_model=ListenExplainResponse)
async def listen_explain(body: ListenExplainRequest) -> ListenExplainResponse:
    user_message = prompts.listen_user_message(body.koreanText, body.language)
    return await generate_json(prompts.LISTEN_SYSTEM, user_message, ListenExplainResponse)


@app.post("/writing/compose", response_model=WritingComposeResponse)
async def writing_compose(body: WritingComposeRequest) -> WritingComposeResponse:
    user_message = prompts.writing_user_message(body.situation, body.recipient.strip(), body.intent.strip(), body.language)
    return await generate_json(prompts.WRITING_SYSTEM, user_message, WritingComposeResponse)


@app.post("/writing/compose/stream")
async def writing_compose_stream(body: WritingComposeRequest) -> StreamingResponse:
    """Same as /writing/compose, but streams the answer as it is written.

    Sends newline-delimited JSON events:
      {"type": "delta", "text": "..."}   a piece of the raw JSON answer
      {"type": "done", "result": {...}}  the validated WritingComposeResponse
      {"type": "error", "detail": "..."} something went wrong
    """
    user_message = prompts.writing_user_message(body.situation, body.recipient.strip(), body.intent.strip(), body.language)

    def event(payload: dict) -> str:
        return json.dumps(payload, ensure_ascii=False) + "\n"

    async def events() -> AsyncIterator[str]:
        started = time.perf_counter()
        pieces: list[str] = []
        try:
            async for piece in stream_json_text(prompts.WRITING_SYSTEM, user_message, WritingComposeResponse):
                pieces.append(piece)
                yield event({"type": "delta", "text": piece})
            result = WritingComposeResponse.model_validate_json("".join(pieces))
            yield event({"type": "done", "result": result.model_dump()})
            log.info("POST /writing/compose/stream finished in %.1fs", time.perf_counter() - started)
        except LLMError as err:
            yield event({"type": "error", "detail": str(err)})
        except ValidationError:
            yield event({"type": "error", "detail": "The AI returned an answer in an unexpected format. Try again."})

    return StreamingResponse(events(), media_type="application/x-ndjson")
