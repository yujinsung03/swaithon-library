import { useState } from 'react';
import type { FeedbackEntry, StorageMode } from '../store/feedbackBook';
import { useI18n } from '../i18n/useI18n';
import { speakKorean } from '../utils/speakKorean';

interface LearnMainProps {
  entries: FeedbackEntry[];
  isLoading: boolean;
  error: string | null;
  mode: StorageMode;
  onRemove: (id: string) => void;
  onUpdateMemo: (id: string, memo: string) => Promise<boolean>;
}

type Filter = 'all' | 'speak' | 'listen';

function LearnMain({ entries, isLoading, error, mode, onRemove, onUpdateMemo }: LearnMainProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const counts = {
    all: entries.length,
    speak: entries.filter((entry) => entry.kind === 'speak').length,
    listen: entries.filter((entry) => entry.kind === 'listen').length,
  };
  const visible = filter === 'all' ? entries : entries.filter((entry) => entry.kind === filter);
  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: t.learn.all },
    { value: 'speak', label: t.learn.speak },
    { value: 'listen', label: t.learn.listen },
  ];

  return (
    <div className="learn-page">
      <header className="learn-header">
        <div className="learn-brand"><span className="learn-status-dot" />{t.nav.learn}</div>
        <span className={`fb-mode fb-mode-${mode}`}>
          {mode === 'supabase' ? t.learn.synced : t.learn.deviceOnly}
        </span>
      </header>

      <div className="learn-intro">
        <h1>{t.learn.title}</h1>
        <p>{t.learn.intro}</p>
      </div>

      {entries.length > 0 && (
        <div className="learn-filters" role="group" aria-label="Show entries">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`learn-filter${filter === item.value ? ' is-selected' : ''}`}
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label} <span>{counts[item.value]}</span>
            </button>
          ))}
        </div>
      )}

      <main className="learn-content">
        {error && <p className="fb-error" role="alert">{t.errors.generic}</p>}
        {isLoading ? (
          <div className="learn-empty"><span>{t.learn.loading}</span></div>
        ) : entries.length === 0 ? (
          <div className="learn-empty">
            <strong>{t.learn.emptyTitle}</strong>
            <span>{t.learn.emptyBody}</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="learn-empty"><span>{t.learn.noneOfKind}</span></div>
        ) : (
          visible.map((entry) => (
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
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [memo, setMemo] = useState(entry.memo);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSavingMemo, setIsSavingMemo] = useState(false);

  const saveMemo = async () => {
    setIsSavingMemo(true);
    await onSaveMemo(memo);
    setIsSavingMemo(false);
  };
  const isMemoDirty = memo !== entry.memo;
  const date = new Date(entry.createdAt).toLocaleDateString(language, { month: 'short', day: 'numeric' });
  const meaning = entry.kind === 'speak' ? entry.intentEnglish : entry.english;
  const detailCount = entry.kind === 'speak' ? entry.corrections.length : entry.expressions.length;
  const detailText = entry.kind === 'speak' ? t.learn.corrections(detailCount) : t.learn.expressions(detailCount);
  const detailsId = `fb-details-${entry.id}`;

  return (
    <article className={`fb-card fb-card-${entry.kind}${isOpen ? ' is-open' : ''}`}>
      <div className="fb-summary-row">
        <button
          className="fb-summary"
          type="button"
          aria-expanded={isOpen}
          aria-controls={detailsId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="fb-meta">
            <span className={`fb-kind fb-kind-${entry.kind}`}>{entry.kind === 'speak' ? 'SPEAK' : 'LISTEN'}</span>
            <time className="fb-date">{date}</time>
            <span className="fb-chevron" aria-hidden="true">▾</span>
          </span>
          <span className="fb-korean">{entry.korean}</span>
          <span className="fb-meaning">{meaning}</span>
          {!isOpen && (
            <span className="fb-peek">
              {detailCount > 0 && detailText}
              {detailCount > 0 && entry.memo && ' · '}
              {entry.memo && `📝 ${entry.memo}`}
            </span>
          )}
        </button>
        <button
          className="fb-play"
          type="button"
          onClick={() => speakKorean(entry.korean)}
          aria-label={`${t.result.playAria}: ${entry.korean}`}
          title={t.result.playAria}
        >
          🔊
        </button>
      </div>

      {isOpen && (
        <div className="fb-details" id={detailsId}>
          {entry.kind === 'speak' ? (
            <>
              <p className="fb-said">
                <span>{t.learn.youSaid}</span>“{entry.sourceText}”
              </p>
              {entry.tone && <span className="fb-tone">{entry.tone}</span>}
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
            entry.expressions.length > 0 && (
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
            )
          )}

          <label className="fb-memo">
            <span>{t.learn.memo}</span>
            <textarea
              id={`fb-memo-${entry.id}`}
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder={t.learn.memoPlaceholder}
              rows={2}
            />
          </label>

          <div className="fb-actions">
            {isConfirmingDelete ? (
              <>
                <span className="fb-confirm-text">{t.learn.deleteConfirm}</span>
                <button className="fb-button" type="button" onClick={() => setIsConfirmingDelete(false)}>{t.learn.cancel}</button>
                <button className="fb-button fb-button-danger" type="button" onClick={onRemove}>{t.learn.delete}</button>
              </>
            ) : (
              <>
                <button className="fb-button fb-button-quiet" type="button" onClick={() => setIsConfirmingDelete(true)}>{t.learn.delete}</button>
                {isMemoDirty && (
                  <button className="fb-button fb-button-primary" type="button" onClick={() => void saveMemo()} disabled={isSavingMemo}>
                    {isSavingMemo ? t.learn.saving : t.learn.saveMemo}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export default LearnMain;
