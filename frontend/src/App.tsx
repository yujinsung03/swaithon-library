import ListenMain from './components/listenMain';
import SpeakMain from './components/speakMain';
import LearnMain from './components/learnMain';
import WritingMain from './components/writingMain';
import { useState } from 'react';
import { useFeedbackBook } from './store/feedbackBook';

function App() {
  const [activeMenu, setActiveMenu] = useState<'speak' | 'listen' | 'learn' | 'writing'>('listen');
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
      ) : activeMenu === 'learn' ? (
        <LearnMain
          entries={feedbackBook.entries}
          isLoading={feedbackBook.isLoading}
          error={feedbackBook.error}
          mode={feedbackBook.mode}
          onRemove={(id) => void feedbackBook.removeEntry(id)}
          onUpdateMemo={feedbackBook.updateMemo}
        />
      ) : null}
      {/* Writing stays mounted while hidden, so a message being written (or already written)
          is still there after visiting another tab. */}
      <div hidden={activeMenu !== 'writing'}>
        <WritingMain />
      </div>
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
        <button
          className={activeMenu === 'writing' ? 'is-active' : ''}
          type="button"
          onClick={() => setActiveMenu('writing')}
        >
          <span aria-hidden="true">▤</span>
          WRITING
        </button>
      </nav>
    </>
  );
}

export default App;
