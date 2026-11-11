import type { SpeakRewriteResponse } from '../api/types';
import type { SaveState } from './speakMain';

const saveLabels: Record<SaveState, string> = {
  idle: '◆ Save to Feedback Book',
  saving: 'Saving...',
  saved: '✓ Saved to Feedback Book',
  error: '⚠ Could not save. Tap to retry',
};

interface SpeakConfirmProps {
  result: SpeakRewriteResponse;
  settingsLabel: string;
  saveState: SaveState;
  onSave: () => void;
  onAnswer: () => void;
  onSayMore: () => void;
}

function SpeakConfirm({ result, settingsLabel, saveState, onSave, onAnswer, onSayMore }: SpeakConfirmProps) {
  const playAudio = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.korean);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="translation-page">
      <header className="translation-header">
        <div className="translation-brand">
          <span className="translation-status-dot" />
          <span>Say it like this</span>
        </div>
      </header>

      <main className="translation-content speak-result-content">
        <section className="translation-section">
          <p>Natural Korean for you</p>
          <div className="translation-card">
            <h1>{result.korean}</h1>
            <span>{result.tone} · {settingsLabel}</span>
            <button className="speak-play-button" type="button" onClick={playAudio} aria-label="Play pronunciation">
              🔊 Listen
            </button>
          </div>
        </section>

        {result.corrections.length > 0 && (
          <section className="speak-corrections">
            <h2>What changed &amp; why</h2>
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
              <strong>답하기</strong>
            </span>
            <small>Listen to reply</small>
          </button>
          <button className="say-more-button" type="button" onClick={onSayMore}>
            <span className="answer-main">
              <span aria-hidden="true">↻</span>
              <strong>Say more</strong>
            </span>
            <small>Speak again</small>
          </button>
        </div>
      </main>
    </div>
  );
}

export default SpeakConfirm;
