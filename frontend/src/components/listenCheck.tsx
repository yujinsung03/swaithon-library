import { mockListenResult } from '../data/mockVoiceData';

interface SwaithonPage3Props {
  onNo: () => void;
  onYes: () => void;
}

function SpeakCheck({ onNo, onYes }: SwaithonPage3Props) {
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
          <p className="confirmation-label">이게 맞나요?</p>
          <div className="confirmation-sentence-card">
            <h1>&quot;{mockListenResult.koreanSentence}&quot;</h1>
          </div>
        </section>

        <div className="confirmation-actions">
          <button type="button" className="confirmation-no-button" onClick={onNo}>
            <span className="confirmation-no-main">
              <span aria-hidden="true">×</span>
              <span>아니요</span>
            </span>
            <span className="confirmation-no-sub">다시 말하기</span>
          </button>
          <button type="button" className="confirmation-yes-button" onClick={onYes}>
            <span aria-hidden="true">✓</span>
            네
          </button>
        </div>
      </main>

      <footer className="confirmation-footer">Confirm to proceed</footer>
    </div>
  );
}

export default SpeakCheck;
