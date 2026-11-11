import type { TranslationResult } from '../data/mockVoiceData';

interface SwaithonPage3Props {
  onNo: () => void;
  onYes: () => void;
  result: TranslationResult;
}

function SpeakCheck({ onNo, onYes, result }: SwaithonPage3Props) {
  return (
    <div className="confirmation-page">
      <header className="confirmation-header">
        <div className="confirmation-brand">
          <span className="confirmation-status-dot" />
          <span>Voice Recognition</span>
        </div>
      </header>

      <main className="confirmation-content">
        <section>
          <p className="confirmation-label">You&apos;re trying to say...</p>
          <div className="confirmation-sentence-card">
            <h1>&quot;{result.originalText}&quot;</h1>
          </div>
        </section>

        <div className="confirmation-actions">
          <button type="button" className="confirmation-no-button" onClick={onNo}>
            <span className="confirmation-no-main">
              <span aria-hidden="true">×</span>
              <span>NO</span>
            </span>
            <span className="confirmation-no-sub">Try again</span>
          </button>
          <button type="button" className="confirmation-yes-button" onClick={onYes}>
            <span aria-hidden="true">✓</span>
            YES
          </button>
        </div>
      </main>

      <footer className="confirmation-footer">Confirm to proceed</footer>
    </div>
  );
}

export default SpeakCheck;
