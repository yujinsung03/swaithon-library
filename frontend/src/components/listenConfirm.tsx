import type { ReactNode } from 'react';
import type { ListenExplainResponse } from '../api/types';
import { useI18n } from '../i18n/useI18n';
import { speakKorean } from '../utils/speakKorean';

interface ListenConfirmProps {
  result: ListenExplainResponse;
  onBack: () => void;
}

function ListenConfirm({ result, onBack }: ListenConfirmProps) {
  const { t } = useI18n();
  const playAudio = () => speakKorean(result.korean);

  return (
    <div className="result-page">
      <header className="result-header">
        <div className="result-header-left">
          <button className="result-back-button" type="button" onClick={onBack} aria-label={t.listen.backAria}>
            ←
          </button>
          <span>{t.listen.header}</span>
        </div>
        <div className="live-status"><span />{t.listen.savedToBook}</div>
      </header>

      <main className="result-content">
        <article className="translation-card">
          <div className="context-label">◌ <span>{t.listen.whatTheyMean}</span></div>
          <div className="sentence-block">
            <div className="sentence-row">
              <h1>{result.korean}</h1>
              <button type="button" onClick={playAudio} aria-label={t.result.playAria}>🔊</button>
            </div>
            <p className="translation">&quot;{result.english}&quot;</p>
          </div>
          {result.expressions.length > 0 && (
            <>
              <hr />
              <div className="breakdown">
                <div className="breakdown-heading">
                  <span>{t.listen.breakdown}</span><span>▣</span>
                </div>
                {result.expressions.map((expression) => (
                  <BreakdownCard
                    key={expression.word}
                    word={expression.word}
                    tag={expression.tag}
                    warm={expression.isCultural}
                    text={expression.explanation}
                  />
                ))}
              </div>
            </>
          )}
        </article>
      </main>

      <footer className="result-footer">
        <button type="button" onClick={() => window.alert('천천히 말씀해 주세요')}>
          ◉ <span>{t.listen.askSlower} (천천히 말씀해 주세요)</span>
        </button>
      </footer>
    </div>
  );
}

interface BreakdownCardProps {
  word: string;
  tag: string;
  text: ReactNode;
  warm?: boolean;
}

function BreakdownCard({ word, tag, text, warm = false }: BreakdownCardProps) {
  return (
    <div className="breakdown-card">
      <div className="breakdown-card-heading">
        <strong>{word}</strong>
        <span className={warm ? 'warm-tag' : ''}>{tag}</span>
      </div>
      <p>{text}</p>
    </div>
  );
}

export default ListenConfirm;
