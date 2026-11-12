import type { SpeakRewriteResponse } from '../api/types';
import type { SaveState } from './speakMain';
import { useI18n } from '../i18n/useI18n';
import { speakKorean } from '../utils/speakKorean';


interface SpeakConfirmProps {
  result: SpeakRewriteResponse;
  settingsLabel: string;
  saveState: SaveState;
  onSave: () => void;
  onAnswer: () => void;
  onSayMore: () => void;
}

function SpeakConfirm({ result, settingsLabel, saveState, onSave, onAnswer, onSayMore }: SpeakConfirmProps) {
  const { t } = useI18n();
  const saveLabels: Record<SaveState, string> = {
    idle: t.result.save,
    saving: t.result.saving,
    saved: t.result.saved,
    error: t.result.saveError,
  };
  const playAudio = () => speakKorean(result.korean);

  return (
    <div className="translation-page">
      <header className="translation-header">
        <div className="translation-brand">
          <span className="translation-status-dot" />
          <span>{t.result.brand}</span>
        </div>
      </header>

      <main className="translation-content speak-result-content">
        <section className="translation-section">
          <p>{t.result.naturalKorean}</p>
          <div className="translation-card">
            <h1>{result.korean}</h1>
            <span>{result.tone} · {settingsLabel}</span>
            <button className="speak-play-button" type="button" onClick={playAudio} aria-label={t.result.playAria}>
              {t.result.listenButton}
            </button>
          </div>
        </section>

        {result.corrections.length > 0 && (
          <section className="speak-corrections">
            <h2>{t.result.whatChanged}</h2>
            <ol>
              {result.corrections.map((correction, index) => (
                <li key={index}>
                  <div className="speak-correction-change">
                    <s>{correction.before}</s>
                    <span aria-hidden="true">→</span>
                    <strong>{correction.after}</strong>
                  </div>
                  <p>{correction.reason}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {result.note && <p className="speak-note">{result.note}</p>}

        <button
          className={`speak-save-button${saveState === 'error' ? ' is-error' : ''}`}
          type="button"
          onClick={onSave}
          disabled={saveState === 'saving' || saveState === 'saved'}
        >
          {saveLabels[saveState]}
        </button>

        <div className="translation-actions">
          <button className="answer-button" type="button" onClick={onAnswer}>
            <span className="answer-main">
              <span aria-hidden="true">●</span>
              <strong>{t.result.reply}</strong>
            </span>
            <small>{t.result.replySub}</small>
          </button>
          <button className="say-more-button" type="button" onClick={onSayMore}>
            <span className="answer-main">
              <span aria-hidden="true">↻</span>
              <strong>{t.result.sayMore}</strong>
            </span>
            <small>{t.result.sayMoreSub}</small>
          </button>
        </div>
      </main>
    </div>
  );
}

export default SpeakConfirm;
