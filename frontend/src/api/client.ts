import * as mock from './mock';
import type {
  ListenExplainRequest,
  ListenExplainResponse,
  SpeakIntentRequest,
  SpeakIntentResponse,
  SpeakRewriteRequest,
  SpeakRewriteResponse,
} from './types';

// Set VITE_API_BASE_URL (e.g. in .env.local: VITE_API_BASE_URL=http://localhost:8000)
// to call the real backend. When it is empty, the mock implementation answers.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

export const isMockMode = !BASE_URL;

async function post<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    // The backend sends { detail: "..." } with a readable message.
    let detail = '';
    try {
      const body: unknown = await response.json();
      if (body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string') {
        detail = body.detail;
      }
    } catch {
      // Not JSON; fall back to the status code.
    }
    throw new Error(detail || `Request to ${path} failed (${response.status})`);
  }
  return (await response.json()) as TResponse;
}

export function checkSpeakIntent(request: SpeakIntentRequest): Promise<SpeakIntentResponse> {
  return isMockMode ? mock.checkSpeakIntent(request) : post('/speak/intent', request);
}

export function rewriteSpeech(request: SpeakRewriteRequest): Promise<SpeakRewriteResponse> {
  return isMockMode ? mock.rewriteSpeech(request) : post('/speak/rewrite', request);
}

export function explainListening(request: ListenExplainRequest): Promise<ListenExplainResponse> {
  return isMockMode ? mock.explainListening(request) : post('/listen/explain', request);
}
