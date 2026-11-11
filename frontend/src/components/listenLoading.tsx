function ListenLoading() {
  return (
    <div className="loading-page">
      <header className="loading-header">
        <div className="loading-brand">
          <span className="loading-status-dot" />
          <span>Processing</span>
        </div>
      </header>
      <main className="loading-content">
        <div className="loading-spinner" aria-label="번역하는 중">
          <span className="loading-microphone" aria-hidden="true">●</span>
        </div>
        <div className="loading-message">
          <h1>번역하는 중...</h1>
          <p>들은 말을 자연스럽게 번역하고 문화적 의미를 찾고 있어요</p>
        </div>
      </main>
      <footer className="loading-footer">This usually takes a few seconds</footer>
    </div>
  );
}

export default ListenLoading;
