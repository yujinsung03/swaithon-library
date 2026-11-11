import type { TranslationResult } from '../data/mockVoiceData';

interface SpeakConfirmProps {
  onAnswer: () => void;
  onSayMore: () => void;
  result: TranslationResult;
}

function SpeakConfirm({ onAnswer, onSayMore, result }: SpeakConfirmProps) {
  return (
    <div className="translation-page">
      <header className="translation-header">
        <div className="translation-brand">
          <span className="translation-status-dot" />
          <span>Translation Result</span>
        </div>
      </header>

      <main className="translation-content">
        <section className="translation-section">
          <p>It translates to...</p>
          <div className="translation-card">
            <h1>{result.translatedText}</h1>
            <span>{result.tone}</span>
          </div>
        </section>

        <div className="translation-actions">
          <button className="answer-button" type="button" onClick={onAnswer}>
            <span className="answer-main">
              <span aria-hidden="true">●</span>
              <strong>답하기</strong>
            </span>
            <small>Answer</small>
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

      <footer className="translation-footer">
        Tap the button to start your response
      </footer>
    </div>
  );
}

export default SpeakConfirm;