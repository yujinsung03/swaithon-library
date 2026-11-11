import { useEffect, useState } from 'react';

interface SwaithonLoadingProps {
  onComplete: () => void;
}

function SpeakLoading({ onComplete }: SwaithonLoadingProps) {
  const [secondsLeft, setSecondsLeft] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          onComplete();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="loading-page">
      <header className="loading-header">
        <div className="loading-brand">
          <span className="loading-status-dot" />
          <span>Processing Audio</span>
        </div>
      </header>

      <main className="loading-content">
        <div className="loading-spinner" aria-label="Processing speech">
          <span className="loading-microphone" aria-hidden="true">●</span>
        </div>
        <div className="loading-message">
          <h1>Processing speech...</h1>
          <p>Analyzing voice tone and translating context</p>
        </div>
      </main>

      <footer className="loading-footer">
        {secondsLeft > 0
          ? `Automatically moving to next screen in ${secondsLeft}s...`
          : 'Transitioning to next screen!'}
      </footer>
    </div>
  );
}

export default SpeakLoading;