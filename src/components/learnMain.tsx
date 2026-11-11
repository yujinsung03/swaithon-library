import type { VocabularyItem } from '../data/mockVoiceData';

function LearnMain({ words }: { words: VocabularyItem[] }) {
  return (
    <div className="learn-page">
      <header className="learn-header">
        <div className="learn-brand"><span className="learn-status-dot" />MY VOCABULARY</div>
        <p>Words saved from your translations</p>
      </header>
      <main className="learn-content">
        {words.length === 0 ? (
          <div className="learn-empty">
            <strong>No saved words yet</strong>
            <span>Translate a sentence and confirm it to start learning.</span>
          </div>
        ) : (
          words.map((item, index) => (
            <article className="learn-card" key={`${item.word}-${index}`}>
              <div className="learn-card-heading">
                <h2>{item.word}</h2>
                <span>{item.tag}</span>
              </div>
              <strong>{item.meaning}</strong>
              <p>{item.explanation}</p>
            </article>
          ))
        )}
      </main>
    </div>
  );
}

export default LearnMain;
