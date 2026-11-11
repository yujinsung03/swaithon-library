import type { ReactNode } from 'react';
import type { ListenExplainResponse } from '../api/types';

interface ListenConfirmProps {
  result: ListenExplainResponse;
  onBack: () => void;
}

function ListenConfirm({ result, onBack }: ListenConfirmProps) {
  const playAudio = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.korean);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="result-page">
      <header className="result-header">
        <div className="result-header-left">
          <button className="result-back-button" type="button" onClick={onBack} aria-label="Listen again">
            ←
          </button>
          <span>LISTENING &amp; CONTEXT</span>
        </div>
        <div className="live-status"><span />Saved to Feedback Book</div>
      </header>

      <main className="result-content">
        <article className="translation-card">
          <div className="context-label">◌ <span>WHAT THEY MEAN</span></div>
          <div className="sentence-block">
            <div className="sentence-row">
              <h1>{result.korean}</h1>
              <button type="button" onClick={playAudio} aria-label="Play pronunciation">🔊</button>
            </div>
            <p className="translation">&quot;{result.english}&quot;</p>
          </div>
          {result.expressions.length > 0 && (
            <>
              <hr />
              <div className="breakdown">
                <div className="breakdown-heading">
                  <span>CULTURAL &amp; WORD BREAKDOWN</span><span>▣</span>
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
          ◉ <span>Ask speaker to speak slower (천천히 말씀해 주세요)</span>
        </button>
        <p>Tap any expression above to inspect deeper context</p>
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
