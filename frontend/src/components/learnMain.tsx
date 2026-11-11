import { useState } from 'react';
import type { FeedbackEntry, StorageMode } from '../store/feedbackBook';

interface LearnMainProps {
  entries: FeedbackEntry[];
  isLoading: boolean;
  error: string | null;
  mode: StorageMode;
  onRemove: (id: string) => void;
  onUpdateMemo: (id: string, memo: string) => Promise<boolean>;
}

function LearnMain({ entries, isLoading, error, mode, onRemove, onUpdateMemo }: LearnMainProps) {
  return (
    <div className="learn-page">
      <header className="learn-header">
        <div className="learn-brand"><span className="learn-status-dot" />FEEDBACK BOOK</div>
        <p>
          Corrections and expressions saved from Speak and Listen
          {entries.length > 0 && ` · ${entries.length}`}
        </p>
        <span className={`fb-mode fb-mode-${mode}`}>
          {mode === 'supabase' ? '☁ Synced to your account' : '● Saved on this device only'}
        </span>
      </header>
      <main className="learn-content">
        {error && <p className="fb-error" role="alert">{error}</p>}
        {isLoading ? (
          <div className="learn-empty"><span>Loading your Feedback Book...</span></div>
        ) : entries.length === 0 ? (
          <div className="learn-empty">
            <strong>Nothing saved yet</strong>
            <span>Save a correction in Speak, or confirm a sentence in Listen, to start your Feedback Book.</span>
          </div>
        ) : (
          entries.map((entry) => (
            <FeedbackCard
              entry={entry}
              key={entry.id}
              onRemove={() => onRemove(entry.id)}
              onSaveMemo={(memo) => onUpdateMemo(entry.id, memo)}
            />
          ))
        )}
      </main>
    </div>
  );
}

interface FeedbackCardProps {
  entry: FeedbackEntry;
  onRemove: () => void;
  onSaveMemo: (memo: string) => Promise<boolean>;
}

function FeedbackCard({ entry, onRemove, onSaveMemo }: FeedbackCardProps) {
  const [memo, setMemo] = useState(entry.memo);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSavingMemo, setIsSavingMemo] = useState(false);

  const saveMemo = async () => {
    setIsSavingMemo(true);
    await onSaveMemo(memo);
    setIsSavingMemo(false);
  };
  const isMemoDirty = memo !== entry.memo;
  const date = new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <article className="learn-card fb-card">
      <div className="learn-card-heading">
        <span className={`fb-kind fb-kind-${entry.kind}`}>{entry.kind === 'speak' ? 'SPEAK' : 'LISTEN'}</span>
        <time className="fb-date">{date}</time>
      </div>

      <h2>{entry.korean}</h2>

      {entry.kind === 'speak' ? (
        <>
          <p className="fb-sub">
            You said “{entry.sourceText}” · <em>{entry.intentEnglish}</em>
          </p>
          <span className="fb-tone">{entry.tone}</span>
          {entry.corrections.length > 0 && (
            <ul className="fb-list">
              {entry.corrections.map((correction, index) => (
                <li key={index}>
                  <div className="speak-correction-change">
                    <s>{correction.before}</s>
                    <span aria-hidden="true">→</span>
                    <strong>{correction.after}</strong>
                  </div>
                  <p>{correction.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <p className="fb-sub"><em>{entry.english}</em></p>
          <ul className="fb-list">
            {entry.expressions.map((expression) => (
              <li key={expression.word}>
                <div className="speak-correction-change">
                  <strong>{expression.word}</strong>
                  <span className="fb-tag">{expression.tag}</span>
                </div>
                <p>{expression.explanation}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <label className="fb-memo">
        <span>My memo</span>
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="Add a note to remember this..."
          rows={2}
        />
      </label>

      <div className="fb-actions">
        {isMemoDirty && (
          <button className="fb-button fb-button-primary" type="button" onClick={() => void saveMemo()} disabled={isSavingMemo}>
            {isSavingMemo ? 'Saving...' : 'Save memo'}
          </button>
        )}
        {isConfirmingDelete ? (
          <>
            <span className="fb-confirm-text">Delete this entry?</span>
            <button className="fb-button" type="button" onClick={() => setIsConfirmingDelete(false)}>Cancel</button>
            <button className="fb-button fb-button-danger" type="button" onClick={onRemove}>Delete</button>
          </>
        ) : (
          <button className="fb-button" type="button" onClick={() => setIsConfirmingDelete(true)}>Delete</button>
        )}
      </div>
    </article>
  );
}

export default LearnMain;
