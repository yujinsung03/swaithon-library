"""Request/response shapes. These mirror frontend/src/api/types.ts exactly (camelCase JSON)."""

from typing import Literal

from pydantic import BaseModel, Field, model_validator

Relationship = Literal["friend_younger", "older"]
Closeness = Literal["stranger", "a_little", "close"]


# ---- /speak/intent ----

class AudioInput(BaseModel):
    # Base64-encoded audio. The frontend sends 16 kHz mono WAV (about 1.3 MB per 30 s once encoded).
    data: str = Field(min_length=1, max_length=8_000_000)
    mimeType: str = Field(default="audio/wav", max_length=50)


class SpeakIntentRequest(BaseModel):
    # What the browser heard (can be empty or wrong for mixed-language speech).
    sourceText: str = Field(default="", max_length=500)
    # The recording itself. When present, Gemini transcribes it and that transcript wins.
    audio: AudioInput | None = None

    @model_validator(mode="after")
    def needs_text_or_audio(self) -> "SpeakIntentRequest":
        if not self.sourceText.strip() and self.audio is None:
            raise ValueError("Send sourceText, audio, or both.")
        return self


class SpeakIntentResponse(BaseModel):
    sourceText: str
    intentEnglish: str


# ---- /speak/rewrite ----

class SpeakRewriteRequest(BaseModel):
    sourceText: str = Field(min_length=1, max_length=500)
    intentEnglish: str = Field(min_length=1, max_length=500)
    relationship: Relationship
    closeness: Closeness


class Correction(BaseModel):
    before: str
    after: str
    reason: str


class SpeakRewriteResponse(BaseModel):
    korean: str
    tone: str
    corrections: list[Correction]
    note: str | None = None


# ---- /listen/explain ----

class ListenExplainRequest(BaseModel):
    koreanText: str = Field(min_length=1, max_length=500)


class ListenExpression(BaseModel):
    word: str
    tag: str
    explanation: str
    isCultural: bool


class ListenExplainResponse(BaseModel):
    korean: str
    english: str
    expressions: list[ListenExpression]


# ---- /writing/compose ----

Situation = Literal["professor_email", "coworker_message", "restaurant_inquiry", "decline_reschedule", "other"]


class WritingComposeRequest(BaseModel):
    situation: Situation
    recipient: str = Field(default="", max_length=100)
    intent: str = Field(min_length=1, max_length=1000)


class WritingNote(BaseModel):
    phrase: str
    explanation: str


class WritingComposeResponse(BaseModel):
    # Empty unless the message is an email.
    subject: str
    message: str
    tone: str
    englishMeaning: str
    notes: list[WritingNote]


# ---- What we ask Gemini to return (kept separate from the API shapes) ----

class IntentLLMOutput(BaseModel):
    intentEnglish: str


class AudioIntentLLMOutput(BaseModel):
    transcript: str
    intentEnglish: str


class RewriteLLMOutput(BaseModel):
    korean: str
    tone: str
    corrections: list[Correction]
