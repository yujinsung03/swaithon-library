import { useI18n } from '../i18n/useI18n';

interface SpeakLoadingProps {
  title: string;
  subtitle: string;
}

function SpeakLoading({ title, subtitle }: SpeakLoadingProps) {
  const { t } = useI18n();
  return (
    <div className="loading-page">
      <header className="loading-header">
        <div className="loading-brand">
          <span className="loading-status-dot" />
          <span>{t.common.processing}</span>
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

      <footer className="loading-footer">{t.common.fewSeconds}</footer>
    </div>
  );
}

export default SpeakLoading;
