"""FastAPI server. Run from the backend/ folder:  uvicorn app.main:app --reload --port 8000"""

import base64
import binascii
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google.genai import types

load_dotenv()  # reads backend/.env

from . import prompts  # noqa: E402
from .llm import LLMError, generate_json, model_names  # noqa: E402
from .schemas import (  # noqa: E402
    AudioIntentLLMOutput,
    IntentLLMOutput,
    ListenExplainRequest,
    ListenExplainResponse,
    RewriteLLMOutput,
    SpeakIntentRequest,
    SpeakIntentResponse,
    SpeakRewriteRequest,
    SpeakRewriteResponse,
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


@app.exception_handler(LLMError)
async def handle_llm_error(_: Request, err: LLMError) -> JSONResponse:
    return JSONResponse(status_code=err.status, content={"detail": str(err)})


@app.get("/health")
async def health() -> dict[str, object]:
    return {"status": "ok", "models": model_names(), "hasApiKey": bool(os.getenv("GEMINI_API_KEY"))}


@app.post("/speak/intent", response_model=SpeakIntentResponse)
async def speak_intent(body: SpeakIntentRequest) -> SpeakIntentResponse:
    browser_text = body.sourceText.strip()

    if body.audio is None:
        result = await generate_json(prompts.INTENT_SYSTEM, browser_text, IntentLLMOutput)
        return SpeakIntentResponse(sourceText=browser_text, intentEnglish=result.intentEnglish.strip())

    try:
        audio_bytes = base64.b64decode(body.audio.data, validate=True)
    except (binascii.Error, ValueError):
        raise LLMError("The recording could not be read. Try again.", 400) from None

    hint = f"Browser transcript (may be wrong): {browser_text}" if browser_text else "No browser transcript."
    contents = [types.Part.from_bytes(data=audio_bytes, mime_type=body.audio.mimeType), types.Part.from_text(text=hint)]
    result = await generate_json(prompts.AUDIO_INTENT_SYSTEM, contents, AudioIntentLLMOutput)

    transcript = result.transcript.strip() or browser_text
    if not transcript:
        raise LLMError("I couldn't hear any speech in the recording. Tap the mic and try again.", 422)
    return SpeakIntentResponse(sourceText=transcript, intentEnglish=result.intentEnglish.strip())


@app.post("/speak/rewrite", response_model=SpeakRewriteResponse)
async def speak_rewrite(body: SpeakRewriteRequest) -> SpeakRewriteResponse:
    user_message = prompts.rewrite_user_message(
        body.sourceText, body.intentEnglish, body.relationship, body.closeness
    )
    result = await generate_json(prompts.REWRITE_SYSTEM, user_message, RewriteLLMOutput)
    return SpeakRewriteResponse(korean=result.korean.strip(), tone=result.tone, corrections=result.corrections)


@app.post("/listen/explain", response_model=ListenExplainResponse)
async def listen_explain(body: ListenExplainRequest) -> ListenExplainResponse:
    return await generate_json(prompts.LISTEN_SYSTEM, body.koreanText, ListenExplainResponse)
