import { useEffect, useRef } from 'react';
import { languages } from '../i18n/strings';
import { useI18n } from '../i18n/useI18n';

interface LanguageDialogProps {
  onClose: () => void;
}

function LanguageDialog({ onClose }: LanguageDialogProps) {
  const { t, language, setLanguage } = useI18n();
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="language-backdrop" onClick={onClose}>
      <div
        className="language-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="language-dialog-heading">
          <h2 id="language-dialog-title">{t.languageDialog.title}</h2>
          <button className="language-close" type="button" onClick={onClose} aria-label={t.languageDialog.close}>
            ×
          </button>
        </div>
        <p className="language-dialog-description">{t.languageDialog.description}</p>
        <ul className="language-list">
          {languages.map((option) => {
            const isSelected = option.code === language;
            return (
              <li key={option.code}>
                <button
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  className={`language-option${isSelected ? ' is-selected' : ''}`}
                  aria-pressed={isSelected}
                  lang={option.code}
                  onClick={() => {
                    setLanguage(option.code);
                    onClose();
                  }}
                >
                  <span className="language-native">{option.native}</span>
                  {option.native !== option.name && <span className="language-english">{option.name}</span>}
                  {isSelected && <span className="language-check" aria-hidden="true">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default LanguageDialog;
