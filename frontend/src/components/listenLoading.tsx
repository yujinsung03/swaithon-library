import { useEffect, useState } from 'react';

interface ListenLoadingProps {
  onComplete: () => void;
}

function ListenLoading({ onComplete }: ListenLoadingProps) {
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
        <div className="loading-spinner" aria-label="Processing listening">
          <span className="loading-microphone" aria-hidden="true">●</span>
        </div>
        <div className="loading-message">
          <h1>번역하는 중...</h1>
          <p>들은 말은 자연스럽게 번역하고 있어요</p>
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

export default ListenLoading;
