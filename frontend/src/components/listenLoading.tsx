interface ListenLoadingProps {
  title?: string;
  subtitle?: string;
}

function ListenLoading({
  title = '번역하는 중...',
  subtitle = '들은 말을 자연스럽게 번역하고 문화적 의미를 찾고 있어요',
}: ListenLoadingProps) {
  return (
    <div className="loading-page">
      <header className="loading-header">
        <div className="loading-brand">
          <span className="loading-status-dot" />
          <span>처리 중</span>
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
      <footer className="loading-footer">보통 몇 초면 끝나요</footer>
    </div>
  );
}

export default ListenLoading;
