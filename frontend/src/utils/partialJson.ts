// Reads a string field out of JSON that is still being written, e.g. while streaming
// `{"subject": "...", "message": "안녕하세요, 교수님.\n[과목`  ->  "안녕하세요, 교수님.\n[과목"
// Returns null until the field has started.

const simpleEscapes: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
};

export function extractPartialString(json: string, key: string): string | null {
  const match = new RegExp(`"${key}"\\s*:\\s*"`).exec(json);
  if (!match) return null;

  let value = '';
  for (let i = match.index + match[0].length; i < json.length; i += 1) {
    const char = json[i];
    if (char === '"') return value; // field finished
    if (char !== '\\') {
      value += char;
      continue;
    }
    const next = json[i + 1];
    if (next === undefined) break; // escape cut off mid-stream
    if (next === 'u') {
      const hex = json.slice(i + 2, i + 6);
      if (hex.length < 4) break;
      value += String.fromCharCode(parseInt(hex, 16));
      i += 5;
    } else {
      value += simpleEscapes[next] ?? next;
      i += 1;
    }
  }
  return value;
}
