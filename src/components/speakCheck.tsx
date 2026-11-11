import type { SpeakIntentResponse } from '../api/types';

interface SpeakCheckProps {
  intent: SpeakIntentResponse;
  error: string | null;
  onNo: () => void;
  onYes: () => void;
}

function SpeakCheck({ intent, error, onNo, onYes }: SpeakCheckProps) {
  return (
    <div className="confirmation-page">
      <header className="confirmation-header">
        <div className="confirmation-brand">
          <span className="confirmation-status-dot" />
          <span>Check your meaning</span>
        </div>
      </header>

      <main className="confirmation-content">
        <section>
          <p className="confirmation-label">Is this what you&apos;re trying to say?</p>
          <div className="confirmation-sentence-card">
            <h1>{intent.intentEnglish}</h1>
          </div>
          <p className="confirmation-source">You said: “{intent.sourceText}”</p>
          {error && <p className="speak-error" role="alert">{error}</p>}
        </section>

        <div className="confirmation-actions">
          <button type="button" className="confirmation-no-button" onClick={onNo}>
            <span className="confirmation-no-main">
              <span aria-hidden="true">×</span>
              <span>NO</span>
            </span>
            <span className="confirmation-no-sub">Edit or say again</span>
          </button>
          <button type="button" className="confirmation-yes-button" onClick={onYes}>
            <span aria-hidden="true">✓</span>
            YES
          </button>
        </div>
      </main>

      <footer className="confirmation-footer">Confirm to get natural Korean</footer>
    </div>
  );
}

export default SpeakCheck;
