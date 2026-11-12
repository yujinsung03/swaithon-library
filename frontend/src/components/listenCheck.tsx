import { useI18n } from '../i18n/useI18n';

interface ListenCheckProps {
  text: string;
  error: string | null;
  onNo: () => void;
  onYes: () => void;
}

function ListenCheck({ text, error, onNo, onYes }: ListenCheckProps) {
  const { t } = useI18n();
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
          <p className="confirmation-label">이게 맞나요? · {t.listen.isThisWhatTheySaid}</p>
          <div className="confirmation-sentence-card">
            <h1>&quot;{text}&quot;</h1>
          </div>
          {error && <p className="speak-error" role="alert">{error}</p>}
        </section>

        <div className="confirmation-actions">
          <button type="button" className="confirmation-no-button" onClick={onNo}>
            <span className="confirmation-no-main">
              <span aria-hidden="true">×</span>
              <span>아니요</span>
            </span>
            <span className="confirmation-no-sub">다시 듣기</span>
          </button>
          <button type="button" className="confirmation-yes-button" onClick={onYes}>
            <span aria-hidden="true">✓</span>
            네
          </button>
        </div>
      </main>

      <footer className="confirmation-footer">{t.listen.checkFooter}</footer>
    </div>
  );
}

export default ListenCheck;
