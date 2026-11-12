import type { FeedbackEntry } from '../store/feedbackBook';

// Case-insensitive, width-insensitive (ｐｉｚｚａ = pizza), and also tried without spaces
// because Korean spacing varies (먹고싶어 / 먹고 싶어).
function normalize(text: string): string {
  return text.normalize('NFKC').toLowerCase();
}

function compact(text: string): string {
  return normalize(text).replace(/\s+/g, '');
}

/** The two lines shown on a card: the Korean sentence and its meaning. Details are not searched. */
function entryText(entry: FeedbackEntry): string {
  const meaning = entry.kind === 'speak' ? entry.intentEnglish : entry.english;
  return [entry.korean, meaning].filter(Boolean).join('\n');
}

/** True when the entry contains any of the terms. */
export function entryMatches(entry: FeedbackEntry, terms: string[]): boolean {
  const text = normalize(entryText(entry));
  const textCompact = compact(text);
  return terms.some((term) => {
    const needle = normalize(term.trim());
    return needle !== '' && (text.includes(needle) || textCompact.includes(compact(needle)));
  });
}
