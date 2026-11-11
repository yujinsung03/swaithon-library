import { useState } from 'react';
import SpeakCheck from './speakCheck';
import SpeakLoading from './speakLoading';
import SpeakConfirm from './speakConfirm';
import {
  mockTranslate,
  type Closeness,
  type Relationship,
  type TranslationResult,
} from '../data/mockVoiceData';

function SpeakMain({
  onAnswer,
}: {
  onAnswer: () => void;
}) {
  const [page, setPage] = useState<'recording' | 'confirmation' | 'loading' | 'context'>('recording');
  const [relationship, setRelationship] = useState<Relationship>('friend_younger');
  const [closeness, setCloseness] = useState<Closeness>('close');
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);

  const toggleRecording = () => {
    const next = !isRecording;
    setIsRecording(next);
    if (!next) {
      void mockTranslate({
        sourceText: '피자를 먹고 싶어요',
        relationship,
        closeness,
      }).then(setResult);
      setPage('loading');
    }
  };

  const currentResult = result ?? {
    originalText: '피자를 먹고 싶어요',
    translatedText: 'I want to eat pizza!',
    tone: 'Friendly casual',
    words: [],
  };

  if (page === 'confirmation') {
    return (
      <SpeakCheck
        onNo={() => setPage('recording')}
        onYes={() => setPage('context')}
        result={currentResult}
      />
    );
  }

  if (page === 'context') {
    return (
      <SpeakConfirm
        onAnswer={onAnswer}
        onSayMore={() => {
          setIsRecording(false);
          setPage('recording');
        }}
        result={currentResult}
      />
    );
  }

  if (page === 'loading') {
    return <SpeakLoading onComplete={() => setPage('confirmation')} />;
  }

  return (
    <div className="assistant-page">
      <header className="assistant-header">
        <div className="assistant-brand"><span className="status-dot" />Voice Assistant</div>
      </header>
      <main className="assistant-content">
        <section className="microphone-section">
          <div className="status-area">
            {isRecording ? <div className="audio-wave">{[1, 2, 3, 4, 5].map((bar) => <span className={`wave-bar wave-bar-${bar}`} key={bar} />)}</div> : <p>Tap microphone to start speaking</p>}
          </div>
          <div className="microphone-wrap">
            {isRecording && <><span className="pulse-ring pulse-ring-outer" /><span className="pulse-ring pulse-ring-inner" /></>}
            <button className={`microphone-button${isRecording ? ' is-recording' : ''}`} type="button" onClick={toggleRecording}>
              <span className="microphone-icon">{isRecording ? '■' : '●'}</span>
              <span>{isRecording ? 'STOP' : 'SPEAK'}</span>
            </button>
          </div>
          <p className="hint">Selected settings will tailor the voice tone and vocabulary automatically.</p>
        </section>
        <div className="speak-options">
          <ChoiceSection
            label="Who is it?"
            selectedLabel={relationship === 'friend_younger' ? 'Friend / Younger' : 'Older'}
            options={[
              { label: 'Friend / Younger', value: 'friend_younger' },
              { label: 'Older', value: 'older' },
            ]}
            selected={relationship}
            onSelect={setRelationship}
          />
          <ChoiceSection
            label="How well do you know each other?"
            selectedLabel={closeness === 'a_little' ? 'A little' : closeness[0].toUpperCase() + closeness.slice(1)}
            options={[
              { label: 'Stranger', value: 'stranger' },
              { label: 'A little', value: 'a_little' },
              { label: 'Close', value: 'close' },
            ]}
            selected={closeness}
            onSelect={setCloseness}
          />
        </div>
      </main>
    </div>
  );
}

interface Choice<T extends string> {
  label: string;
  value: T;
}

interface ChoiceSectionProps<T extends string> {
  label: string;
  selectedLabel: string;
  options: readonly Choice<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

function ChoiceSection<T extends string>({ label, selectedLabel, options, selected, onSelect }: ChoiceSectionProps<T>) {
  return (
    <section className="choice-section">
      <div className="choice-heading"><span>{label}</span><strong>{selectedLabel}</strong></div>
      <div className={`choice-grid choice-grid-${options.length}`}>
        {options.map((option) => (
          <button className={`choice-button${selected === option.value ? ' is-selected' : ''}`} key={option.value} type="button" onClick={() => onSelect(option.value)}>
            <span className="choice-icon">{options.length === 2 ? '●' : '♥'}</span>{option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default SpeakMain;
