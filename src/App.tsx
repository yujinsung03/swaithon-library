import ListenMain from './components/listenMain';
import SpeakMain from './components/speakMain';
import LearnMain from './components/learnMain';
import { useState } from 'react';
import type { VocabularyItem } from './data/mockVoiceData';

function App() {
  const [activeMenu, setActiveMenu] = useState<'speak' | 'listen' | 'learn'>('listen');
  const [learnWords, setLearnWords] = useState<VocabularyItem[]>(() => {
    const saved = window.localStorage.getItem('voice-assistant-vocabulary');
    if (!saved) return [];
    try {
      return JSON.parse(saved) as VocabularyItem[];
    } catch {
      return [];
    }
  });

  const saveWords = (words: VocabularyItem[]) => {
    setLearnWords((current) => {
      const next = [...words, ...current.filter((old) => !words.some((item) => item.word === old.word))];
      window.localStorage.setItem('voice-assistant-vocabulary', JSON.stringify(next));
      return next;
    });
  };

  return (
    <>
      {activeMenu === 'listen' ? (
        <ListenMain onSaveWords={saveWords} />
      ) : activeMenu === 'speak' ? (
        <SpeakMain
          onAnswer={() => setActiveMenu('listen')}
        />
      ) : (
        <LearnMain words={learnWords} />
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
