import * as mock from './mock';
import type {
  ListenExplainRequest,
  ListenExplainResponse,
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

function postRequest(path: string, body: unknown): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Turns a failed response into an Error with the backend's readable { detail } message. */
async function errorFrom(response: Response, path: string): Promise<Error> {
  let detail = '';
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string') {
      detail = body.detail;
    }
  } catch {
    // Not JSON; fall back to the status code.
  }
  return new Error(detail || `Request to ${path} failed (${response.status})`);
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
        throw new Error(event.detail);
      }
    }
  }
  throw new Error('The connection closed before the message was finished. Try again.');
}
