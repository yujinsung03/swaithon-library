import ListenMain from './components/listenMain';
import SpeakMain from './components/speakMain';
import LearnMain from './components/learnMain';
import { useState } from 'react';
import { useFeedbackBook } from './store/feedbackBook';

function App() {
  const [activeMenu, setActiveMenu] = useState<'speak' | 'listen' | 'learn'>('listen');
  const feedbackBook = useFeedbackBook();

  return (
    <>
      {activeMenu === 'listen' ? (
        <ListenMain onSave={feedbackBook.addEntry} />
      ) : activeMenu === 'speak' ? (
        <SpeakMain
          onAnswer={() => setActiveMenu('listen')}
          onSave={feedbackBook.addEntry}
        />
      ) : (
        <LearnMain
          entries={feedbackBook.entries}
          isLoading={feedbackBook.isLoading}
          error={feedbackBook.error}
          mode={feedbackBook.mode}
          onRemove={(id) => void feedbackBook.removeEntry(id)}
          onUpdateMemo={feedbackBook.updateMemo}
        />
      )}
      <nav className="bottom-navigation" aria-label="Main navigation">
        <button
          className={activeMenu === 'speak' ? 'is-active' : ''}
          type="button"
          onClick={() => setActiveMenu('speak')}
        >
          <span aria-hidden="true">●</span>
          SPEAK
        </button>
        <button
          className={activeMenu === 'listen' ? 'is-active' : ''}
          type="button"
          onClick={() => setActiveMenu('listen')}
        >
          <span aria-hidden="true">◉</span>
          LISTEN
        </button>
        <button
          className={activeMenu === 'learn' ? 'is-active' : ''}
          type="button"
          onClick={() => setActiveMenu('learn')}
          aria-current={activeMenu === 'learn' ? 'page' : undefined}
        >
          <span aria-hidden="true">◆</span>
          LEARN
        </button>
        <button className="is-disabled" type="button" disabled>
          <span aria-hidden="true">▤</span>
          WRITING
        </button>
      </nav>
    </>
  );
}

export default App;
