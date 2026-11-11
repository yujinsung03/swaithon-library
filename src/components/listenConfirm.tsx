import type { ReactNode } from 'react';
import { mockListenResult } from '../data/mockVoiceData';

interface SwaithonPage2Props {
  onBack: () => void;
}

function ListenConfirm({ onBack }: SwaithonPage2Props) {
  const playAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance(mockListenResult.koreanSentence),
      );
    }
  };

  return (
    <div className="result-page">
      <header className="result-header">
        <div className="result-header-left">
          <button className="result-back-button" type="button" onClick={onBack} aria-label="Go back">
            ←
          </button>
          <span>LISTENING &amp; CONTEXT</span>
        </div>
        <div className="live-status"><span />Active Live</div>
      </header>

      <main className="result-content">
        <article className="translation-card">
          <div className="context-label">◌ <span>HE/SHE IS TRYING TO SAY</span></div>
          <div className="sentence-block">
            <div className="sentence-row">
              <h1>{mockListenResult.koreanSentence}</h1>
              <button type="button" onClick={playAudio} aria-label="Listen audio">🔊</button>
            </div>
            <p className="translation">{mockListenResult.englishTranslation}</p>
          </div>
          <hr />
          <div className="breakdown">
            <div className="breakdown-heading">
              <span>CULTURAL &amp; WORD BREAKDOWN</span><span>▣</span>
            </div>
            <BreakdownCard
              word={mockListenResult.breakdown[0].word}
              tag={mockListenResult.breakdown[0].tag}
              text={mockListenResult.breakdown[0].explanation}
            />
            <BreakdownCard
              word={mockListenResult.breakdown[1].word}
              tag={mockListenResult.breakdown[1].tag}
              warm={mockListenResult.breakdown[1].warm}
              text={mockListenResult.breakdown[1].explanation}
            />
          </div>
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
