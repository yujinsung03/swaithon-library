// Shared request/response shapes between the frontend and the (future) backend.
// The FastAPI server should return exactly these JSON shapes.

export type Relationship = 'friend_younger' | 'older';
export type Closeness = 'stranger' | 'a_little' | 'close';

/** POST /speak/intent — what did the user mean? (shown back in English) */
export interface SpeakIntentRequest {
  sourceText: string;
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
