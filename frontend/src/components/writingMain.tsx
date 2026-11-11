import { useState, type FormEvent } from 'react';
import { composeWritingStream } from '../api/client';
import type { WritingComposeResponse, WritingSituation } from '../api/types';
import { extractPartialString } from '../utils/partialJson';

interface SituationOption {
  value: WritingSituation;
  label: string;
  korean: string;
  defaultRecipient: string;
  example: string;
}

const situations: SituationOption[] = [
  {
    value: 'professor_email',
    label: 'Email to professor',
    korean: '교수님께 이메일',
    defaultRecipient: '교수님',
    example: 'I am sick, I want to ask for more time for the homework',
  },
  {
    value: 'coworker_message',
    label: 'Message to coworker',
    korean: '동료에게 메시지',
    defaultRecipient: '회사 동료',
    example: '내일 회의 10시 → 11시 바꿔도 돼요? I have hospital',
  },
  {
    value: 'restaurant_inquiry',
    label: 'Ask a restaurant',
    korean: '식당 문의',
    defaultRecipient: '식당',
    example: 'Reservation Saturday 7pm, 4 people, is there parking?',
  },
  {
    value: 'decline_reschedule',
    label: 'Decline or reschedule',
    korean: '약속 거절·변경',
    defaultRecipient: '친구',
    example: 'Sorry I cannot come Friday dinner, maybe next week?',
  },
  {
    value: 'other',
    label: 'Something else',
    korean: '기타',
    defaultRecipient: '',
    example: 'Tell my landlord the bathroom light is broken',
  },
];

type Page = 'input' | 'loading' | 'result';

function WritingMain() {
  const [page, setPage] = useState<Page>('input');
  const [situation, setSituation] = useState<SituationOption>(situations[0]);
  const [recipient, setRecipient] = useState(situations[0].defaultRecipient);
  const [intent, setIntent] = useState('');
  const [result, setResult] = useState<WritingComposeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'message' | 'subject' | null>(null);
  // What the AI has written so far, shown while it is still writing.
  const [draft, setDraft] = useState({ subject: '', message: '' });

  const chooseSituation = (option: SituationOption) => {
    // Only replace the recipient if the user hasn't typed their own.
    if (situations.some((item) => item.defaultRecipient === recipient) || !recipient) {
      setRecipient(option.defaultRecipient);
    }
    setSituation(option);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!intent.trim()) return;
    setError(null);
    setCopied(null);
    setDraft({ subject: '', message: '' });
    setPage('loading');
    try {
      const final = await composeWritingStream(
        { situation: situation.value, recipient: recipient.trim(), intent: intent.trim() },
        (jsonSoFar) =>
          setDraft({
            subject: extractPartialString(jsonSoFar, 'subject') ?? '',
            message: extractPartialString(jsonSoFar, 'message') ?? '',
          }),
      );
      setResult(final);
      setPage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPage('input');
    }
  };

  const copy = async (what: 'message' | 'subject', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
    } catch {
      setError('Could not copy. Select the text and copy it manually.');
    }
  };

  if (page === 'loading' && (draft.subject || draft.message)) {
    return (
      <div className="writing-page">
        <header className="writing-header">
          <div>
            <div className="writing-brand"><span className="writing-status-dot is-live" />{situation.label}</div>
            <p>Writing your message...</p>
          </div>
        </header>
        <main className="writing-content" aria-live="polite">
          {draft.subject && (
            <section className="writing-block">
              <div className="writing-block-heading"><span>Subject</span></div>
              <p className="writing-subject">{draft.subject}</p>
            </section>
          )}
          <section className="writing-block writing-message-block">
            <div className="writing-block-heading"><span>Message</span></div>
            <p className="writing-message">
              {draft.message}
              <span className="writing-caret" aria-hidden="true" />
            </p>
          </section>
          <p className="writing-hint-muted">Translation and expression notes come next.</p>
        </main>
      </div>
    );
  }

  if (page === 'loading') {
    return (
      <div className="loading-page">
        <header className="loading-header">
          <div className="loading-brand"><span className="loading-status-dot" /><span>Writing</span></div>
        </header>
        <main className="loading-content">
          <div className="loading-spinner" aria-label="Writing your message">
            <span className="loading-microphone" aria-hidden="true">▤</span>
          </div>
          <div className="loading-message">
            <h1>Writing your message...</h1>
            <p>Following Korean conventions for {situation.label.toLowerCase()}</p>
          </div>
        </main>
        <footer className="loading-footer">This usually takes a few seconds</footer>
      </div>
    );
  }

  if (page === 'result' && result) {
    const hasPlaceholders = /\[[^\]]+\]/.test(result.subject + result.message);
    return (
      <div className="writing-page">
        <header className="writing-header">
          <button className="result-back-button" type="button" onClick={() => setPage('input')} aria-label="Edit request">
            ←
          </button>
          <div>
            <div className="writing-brand"><span className="writing-status-dot" />{situation.label}</div>
            <p>{result.tone}{recipient.trim() && ` · to ${recipient.trim()}`}</p>
          </div>
        </header>

        <main className="writing-content">
          {result.subject && (
            <section className="writing-block">
              <div className="writing-block-heading">
                <span>Subject</span>
                <button type="button" onClick={() => void copy('subject', result.subject)}>
                  {copied === 'subject' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="writing-subject">{result.subject}</p>
            </section>
          )}

          <section className="writing-block writing-message-block">
            <div className="writing-block-heading">
              <span>Message</span>
              <button type="button" onClick={() => void copy('message', result.message)}>
                {copied === 'message' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="writing-message">{result.message}</p>
            {hasPlaceholders && (
              <p className="writing-hint">Replace the parts in [brackets] with your own details before sending.</p>
            )}
          </section>

          <section className="writing-block">
            <div className="writing-block-heading"><span>What it says</span></div>
            <p className="writing-english">{result.englishMeaning}</p>
          </section>

          {result.notes.length > 0 && (
            <section className="speak-corrections">
              <h2>Useful expressions</h2>
              <ol>
                {result.notes.map((note) => (
                  <li key={note.phrase}>
                    <div className="speak-correction-change"><strong>{note.phrase}</strong></div>
                    <p>{note.explanation}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {error && <p className="speak-error" role="alert">{error}</p>}

          <button className="writing-new-button" type="button" onClick={() => { setIntent(''); setPage('input'); }}>
            ✎ Write another message
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="writing-page">
      <header className="writing-header">
        <div>
          <div className="writing-brand"><span className="writing-status-dot" />WRITING</div>
          <p>Tell me what you want to say. I&apos;ll write it the way a Korean would.</p>
        </div>
      </header>

      <form className="writing-content" onSubmit={(event) => void handleSubmit(event)}>
        <fieldset className="writing-situations">
          <legend>Situation</legend>
          <div className="writing-situation-grid">
            {situations.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`writing-situation${situation.value === option.value ? ' is-selected' : ''}`}
                onClick={() => chooseSituation(option)}
                aria-pressed={situation.value === option.value}
              >
                <strong>{option.label}</strong>
                <span>{option.korean}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="writing-field">
          <span>To</span>
          <input
            id="writing-recipient"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="e.g. 교수님, 팀장님, 집주인"
            autoComplete="off"
          />
        </label>

        <label className="writing-field">
          <span>What do you want to say?</span>
          <textarea
            id="writing-intent"
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
            placeholder={`Any language is OK.\ne.g. ${situation.example}`}
            rows={5}
          />
        </label>

        {error && <p className="speak-error" role="alert">{error}</p>}

        <button className="writing-submit" type="submit" disabled={!intent.trim()}>
          Write it in Korean
        </button>
      </form>
    </div>
  );
}

export default WritingMain;
