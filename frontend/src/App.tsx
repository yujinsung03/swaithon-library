import ListenMain from './components/listenMain';
import SpeakMain from './components/speakMain';
import LearnMain from './components/learnMain';
import WritingMain from './components/writingMain';
import { useState } from 'react';
import LanguageDialog from './components/languageDialog';
import { languages } from './i18n/strings';
import { useI18n } from './i18n/useI18n';
import { useFeedbackBook } from './store/feedbackBook';

function App() {
  const [activeMenu, setActiveMenu] = useState<'speak' | 'listen' | 'learn' | 'writing'>('speak');
  const feedbackBook = useFeedbackBook();
  const { t, language } = useI18n();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const currentLanguage = languages.find((option) => option.code === language);

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
          {t.nav.speak}
        </button>
        <button
          className={activeMenu === 'listen' ? 'is-active' : ''}
          type="button"
          onClick={() => setActiveMenu('listen')}
        >
          <span aria-hidden="true">◉</span>
          {t.nav.listen}
        </button>
        <button
          className="language-nav-button"
          type="button"
          onClick={() => setIsLanguageOpen(true)}
          aria-haspopup="dialog"
          aria-label={`${t.nav.language}: ${currentLanguage?.native ?? ''}`}
        >
          <span className="language-nav-icon" aria-hidden="true">🌐</span>
          {language.toUpperCase()}
        </button>
        <button
          className={activeMenu === 'learn' ? 'is-active' : ''}
          type="button"
          onClick={() => setActiveMenu('learn')}
          aria-current={activeMenu === 'learn' ? 'page' : undefined}
        >
          <span aria-hidden="true">◆</span>
          {t.nav.learn}
        </button>
        <button
          className={activeMenu === 'writing' ? 'is-active' : ''}
          type="button"
          onClick={() => setActiveMenu('writing')}
        >
          <span aria-hidden="true">▤</span>
          {t.nav.writing}
        </button>
      </nav>
      {isLanguageOpen && <LanguageDialog onClose={() => setIsLanguageOpen(false)} />}
    </>
  );
}

export default App;
