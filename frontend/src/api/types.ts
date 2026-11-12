import type { LanguageCode } from '../i18n/strings';

// Shared request/response shapes between the frontend and the (future) backend.
// The FastAPI server should return exactly these JSON shapes.

export type Relationship = 'friend_younger' | 'older';
export type Closeness = 'stranger' | 'a_little' | 'close';

/** POST /speak/intent — what did the user mean? (shown back in English) */
export interface SpeakIntentRequest {
  /** What the browser heard. Can be empty or wrong for mixed-language speech. */
  sourceText: string;
  /** The recording (base64 WAV). When sent, the AI's own transcript replaces sourceText. */
  audio?: { data: string; mimeType: string };
  /** App language: explanations come back in it. */
  language: LanguageCode;
}

export interface SpeakIntentResponse {
  sourceText: string;
  intentEnglish: string;
}

/** POST /speak/rewrite — natural Korean for the confirmed intent */
export interface SpeakRewriteRequest {
  sourceText: string;
  intentEnglish: string;
  relationship: Relationship;
  closeness: Closeness;
  /** App language: explanations come back in it. */
  language: LanguageCode;
}

export interface Correction {
  before: string;
  after: string;
  reason: string;
}

export interface SpeakRewriteResponse {
  korean: string;
  tone: string;
  corrections: Correction[];
  /** Optional extra message, e.g. when running in demo mode. */
  note?: string;
}

/** POST /listen/explain — what did the Korean speaker mean? */
export interface ListenTranscribeRequest {
  audio: { data: string; mimeType: string };
  /** What the browser heard live (may be wrong). */
  hint: string;
}

export interface ListenTranscribeResponse {
  korean: string;
}

export interface ListenExplainRequest {
  koreanText: string;
  /** App language: explanations come back in it. */
  language: LanguageCode;
}

export interface ListenExpression {
  word: string;
  tag: string;
  explanation: string;
  /** True when the meaning needs cultural context or differs from the literal words. */
  isCultural: boolean;
}

export interface ListenExplainResponse {
  korean: string;
  english: string;
  expressions: ListenExpression[];
}

/** POST /writing/compose — a ready-to-send Korean message for a situation */
export type WritingSituation =
  | 'professor_email'
  | 'coworker_message'
  | 'restaurant_inquiry'
  | 'decline_reschedule'
  | 'other';

export interface WritingComposeRequest {
  situation: WritingSituation;
  recipient: string;
  intent: string;
  /** App language: explanations come back in it. */
  language: LanguageCode;
}

export interface WritingNote {
  phrase: string;
  explanation: string;
}

export interface WritingComposeResponse {
  /** Empty unless the message is an email. */
  subject: string;
  message: string;
  tone: string;
  englishMeaning: string;
  notes: WritingNote[];
}

export interface LearnSearchTermsRequest {
  query: string;
  language: LanguageCode;
}

export interface LearnSearchTermsResponse {
  /** The query plus words that mean the same in Korean, English, and the app language. */
  terms: string[];
}
