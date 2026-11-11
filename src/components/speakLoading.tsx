interface SpeakLoadingProps {
  title: string;
  subtitle: string;
}

function SpeakLoading({ title, subtitle }: SpeakLoadingProps) {
  return (
    <div className="loading-page">
      <header className="loading-header">
        <div className="loading-brand">
          <span className="loading-status-dot" />
          <span>Processing</span>
        </div>
      </header>

      <main className="loading-content">
        <div className="loading-spinner" aria-label={title}>
          <span className="loading-microphone" aria-hidden="true">●</span>
        </div>
        <div className="loading-message">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </main>

      <footer className="loading-footer">This usually takes a few seconds</footer>
    </div>
  );
}

export default SpeakLoading;
