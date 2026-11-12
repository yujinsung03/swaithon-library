import * as mock from './mock';
import { AppError } from '../i18n/useI18n';
import type {
  ListenExplainRequest,
  ListenExplainResponse,
  ListenTranscribeRequest,
  ListenTranscribeResponse,
  SpeakIntentRequest,
  SpeakIntentResponse,
  SpeakRewriteRequest,
  SpeakRewriteResponse,
  WritingComposeRequest,
  WritingComposeResponse,
} from './types';

// Set VITE_API_BASE_URL (e.g. in .env.local: VITE_API_BASE_URL=http://localhost:8000)
// to call the real backend. When it is empty, the mock implementation answers.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');

export const isMockMode = !BASE_URL;

async function postRequest(path: string, body: unknown): Promise<Response> {
  try {
    return await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AppError('connection'); // server not running or no internet
  }
}

/** Turns a failed response into an error the screen can show in the app language. */
async function errorFrom(response: Response, path: string): Promise<AppError> {
  let detail: unknown = null;
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'detail' in body) detail = body.detail;
  } catch {
    // Not JSON.
  }
  console.warn(`${path} failed (${response.status}):`, detail);
  if (response.status === 429) return new AppError('quota');
  // Our own 422 ("no speech in the recording") has a text detail; request validation errors are lists.
  if (response.status === 422 && typeof detail === 'string') return new AppError('noSpeech');
  if (response.status >= 500) return new AppError('busy');
  return new AppError('generic');
}

async function post<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await postRequest(path, body);
  if (!response.ok) throw await errorFrom(response, path);
  return (await response.json()) as TResponse;
}

export function checkSpeakIntent(request: SpeakIntentRequest): Promise<SpeakIntentResponse> {
  return isMockMode ? mock.checkSpeakIntent(request) : post('/speak/intent', request);
}

export function rewriteSpeech(request: SpeakRewriteRequest): Promise<SpeakRewriteResponse> {
  return isMockMode ? mock.rewriteSpeech(request) : post('/speak/rewrite', request);
}

export function transcribeListening(request: ListenTranscribeRequest): Promise<ListenTranscribeResponse> {
  return isMockMode ? mock.transcribeListening(request) : post('/listen/transcribe', request);
}

export function explainListening(request: ListenExplainRequest): Promise<ListenExplainResponse> {
  return isMockMode ? mock.explainListening(request) : post('/listen/explain', request);
}

type StreamEvent =
  | { type: 'delta'; text: string }
  | { type: 'done'; result: WritingComposeResponse }
  | { type: 'error'; detail: string };

/**
 * Writes the message while streaming: `onText` gets the raw JSON written so far
 * (use extractPartialString to show the message as it appears). Resolves with the final result.
 */
export async function composeWritingStream(
  request: WritingComposeRequest,
  onText: (jsonSoFar: string) => void,
): Promise<WritingComposeResponse> {
  if (isMockMode) {
    const result = await mock.composeWriting(request);
    onText(JSON.stringify(result));
    return result;
  }

  const path = '/writing/compose/stream';
  const response = await postRequest(path, request);
  if (!response.ok || !response.body) throw await errorFrom(response, path);

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let jsonSoFar = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let newline = buffer.indexOf('\n');
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      newline = buffer.indexOf('\n');
      if (!line) continue;
      const event = JSON.parse(line) as StreamEvent;
      if (event.type === 'delta') {
        jsonSoFar += event.text;
        onText(jsonSoFar);
      } else if (event.type === 'done') {
        return event.result;
      } else {
        console.warn(`${path} failed:`, event.detail);
        throw new AppError('generic');
      }
    }
  }
  throw new AppError('connection');
}
