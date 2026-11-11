import { useState, type FormEvent } from 'react';
import SpeakCheck from './speakCheck';
import SpeakLoading from './speakLoading';
import SpeakConfirm from './speakConfirm';
import { checkSpeakIntent, rewriteSpeech } from '../api/client';
import { demoSentences } from '../api/mock';
import type {
  Closeness,
  Relationship,
  SpeakIntentResponse,
  SpeakRewriteResponse,
} from '../api/types';
import type { NewFeedbackEntry } from '../store/feedbackBook';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type Page = 'input' | 'loading-intent' | 'check' | 'loading-rewrite' | 'result';

const relationshipLabels: Record<Relationship, string> = {
  friend_younger: 'Friend / Younger',
  older: 'Older',
};

const closenessLabels: Record<Closeness, string> = {
  stranger: 'Stranger',
  a_little: 'A little',
  close: 'Close',
};

interface SpeakMainProps {
  onAnswer: () => void;
  onSave: (entry: NewFeedbackEntry) => Promise<boolean>;
}

function SpeakMain({ onAnswer, onSave }: SpeakMainProps) {
  const [page, setPage] = useState<Page>('input');
  const [relationship, setRelationship] = useState<Relationship>('friend_younger');
  const [closeness, setCloseness] = useState<Closeness>('close');
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  const [demoIndex, setDemoIndex] = useState(0);
  const [intent, setIntent] = useState<SpeakIntentResponse | null>(null);
  const [rewrite, setRewrite] = useState<SpeakRewriteResponse | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  const requestIntent = async (sourceText: string) => {
    const trimmed = sourceText.trim();
    if (!trimmed) return;
    setError(null);
    setPage('loading-intent');
    try {
      setIntent(await checkSpeakIntent({ sourceText: trimmed }));
      setPage('check');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPage('input');
    }
  };

  const requestRewrite = async () => {
    if (!intent) return;
    setError(null);
    setSaveState('idle');
    setPage('loading-rewrite');
    try {
      setRewrite(await rewriteSpeech({ ...intent, relationship, closeness }));
      setPage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPage('check');
    }
  };

  // No speech recognition yet: stopping the mic "hears" one of the demo sentences.
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      return;
    }
    setIsRecording(false);
    const heard = demoSentences[demoIndex % demoSentences.length];
    setDemoIndex((index) => index + 1);
    setText(heard);
    void requestIntent(heard);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void requestIntent(text);
  };

  const saveToFeedbackBook = async () => {
    if (!intent || !rewrite || saveState === 'saving' || saveState === 'saved') return;
    setSaveState('saving');
    const ok = await onSave({
      kind: 'speak',
      sourceText: intent.sourceText,
      intentEnglish: intent.intentEnglish,
      korean: rewrite.korean,
      tone: rewrite.tone,
      corrections: rewrite.corrections,
    });
    setSaveState(ok ? 'saved' : 'error');
  };

  const backToInput = () => {
    setIsRecording(false);
    setPage('input');
  };

  if (page === 'loading-intent') {
    return <SpeakLoading title="Understanding you..." subtitle="Figuring out what you want to say" />;
  }

  if (page === 'loading-rewrite') {
    return <SpeakLoading title="Finding natural Korean..." subtitle="Matching the tone to who you are talking to" />;
  }

  if (page === 'check' && intent) {
    return (
      <SpeakCheck
        intent={intent}
        error={error}
        onNo={backToInput}
        onYes={() => void requestRewrite()}
      />
    );
  }

  if (page === 'result' && rewrite) {
    return (
      <SpeakConfirm
        result={rewrite}
        settingsLabel={`${relationshipLabels[relationship]} · ${closenessLabels[closeness]}`}
        saveState={saveState}
        onSave={() => void saveToFeedbackBook()}
        onAnswer={onAnswer}
        onSayMore={() => {
          setText('');
          backToInput();
        }}
      />
    );
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
          <form className="speak-text-form" onSubmit={handleSubmit}>
            <label className="speak-text-label" htmlFor="speak-text">Or type what you want to say</label>
            <div className="speak-text-row">
              <input
                id="speak-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="e.g. 나는 하고 싶어요 study"
                autoComplete="off"
              />
              <button type="submit" disabled={!text.trim()}>Go</button>
            </div>
          </form>
          {error && <p className="speak-error" role="alert">{error}</p>}
        </section>
        <div className="speak-options">
          <ChoiceSection
            label="Who is it?"
            selectedLabel={relationshipLabels[relationship]}
            options={[
              { label: relationshipLabels.friend_younger, value: 'friend_younger' },
              { label: relationshipLabels.older, value: 'older' },
            ]}
            selected={relationship}
            onSelect={setRelationship}
          />
          <ChoiceSection
            label="How well do you know each other?"
            selectedLabel={closenessLabels[closeness]}
            options={[
              { label: closenessLabels.stranger, value: 'stranger' },
              { label: closenessLabels.a_little, value: 'a_little' },
              { label: closenessLabels.close, value: 'close' },
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
