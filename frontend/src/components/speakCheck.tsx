import type { SpeakIntentResponse } from '../api/types';
import { useI18n } from '../i18n/useI18n';

interface SpeakCheckProps {
  intent: SpeakIntentResponse;
  error: string | null;
  onNo: () => void;
  onYes: () => void;
}

function SpeakCheck({ intent, error, onNo, onYes }: SpeakCheckProps) {
  const { t } = useI18n();
  return (
    <div className="confirmation-page">
      <header className="confirmation-header">
        <div className="confirmation-brand">
          <span className="confirmation-status-dot" />
          <span>{t.check.brand}</span>
        </div>
      </header>

      <main className="confirmation-content">
        <section>
          <p className="confirmation-label">{t.check.question}</p>
          <div className="confirmation-sentence-card">
            <h1>{intent.intentEnglish}</h1>
          </div>
          <p className="confirmation-source">{t.check.youSaid}: “{intent.sourceText}”</p>
          {error && <p className="speak-error" role="alert">{error}</p>}
        </section>

        <div className="confirmation-actions">
          <button type="button" className="confirmation-no-button" onClick={onNo}>
            <span className="confirmation-no-main">
              <span aria-hidden="true">×</span>
              <span>{t.check.no}</span>
            </span>
            <span className="confirmation-no-sub">{t.check.noSub}</span>
          </button>
          <button type="button" className="confirmation-yes-button" onClick={onYes}>
            <span aria-hidden="true">✓</span>
            {t.check.yes}
          </button>
        </div>
      </main>

      <footer className="confirmation-footer">{t.check.footer}</footer>
    </div>
  );
}

export default SpeakCheck;
