import { useRef, useState, type FormEvent } from 'react';
import SpeakCheck from './speakCheck';
import SpeakLoading from './speakLoading';
import SpeakConfirm from './speakConfirm';
import { checkSpeakIntent, rewriteSpeech } from '../api/client';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { recordingToWavBase64 } from '../utils/wav';
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

// Speech recognition hears one language at a time. Korean is the default because
// mixed sentences ("나는 하고 싶어요 study") still come through, with English words in Hangul.
const speechLanguages = [
  { code: 'ko-KR', label: '한국어' },
  { code: 'en-US', label: 'English' },
  { code: 'vi-VN', label: 'Tiếng Việt' },
  { code: 'zh-CN', label: '中文' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'th-TH', label: 'ไทย' },
] as const;

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
  const [text, setText] = useState('');
  const [speechLang, setSpeechLang] = useState<string>('ko-KR');
  const [intent, setIntent] = useState<SpeakIntentResponse | null>(null);
  const [rewrite, setRewrite] = useState<SpeakRewriteResponse | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  const requestIntent = async (sourceText: string, audio?: { data: string; mimeType: string }) => {
    const trimmed = sourceText.trim();
    if (!trimmed && !audio) return;
    setError(null);
    setPage('loading-intent');
    try {
      setIntent(await checkSpeakIntent({ sourceText: trimmed, audio }));
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

  // Voice input uses two things at once:
  // - browser speech recognition shows the words live while the user talks (free, one language);
  // - the recording goes to the AI, which transcribes mixed-language speech accurately and
  //   works out the meaning in the same request.
  const recorder = useAudioRecorder();
  const usingRecorderRef = useRef(false); // read inside callbacks
  const [isUsingRecorder, setIsUsingRecorder] = useState(false); // same value, for rendering
  const speech = useSpeechRecognition({
    onEnd: (heard) => {
      // Without a recording (no MediaRecorder or mic blocked), send the browser's text.
      if (!usingRecorderRef.current && heard) {
        setText(heard);
        void requestIntent(heard);
      }
    },
  });
  const isRecording = recorder.isRecording || speech.isListening;
  const canUseVoice = recorder.isSupported || speech.isSupported;
  // While recording, the input shows the words as they are recognized.
  const inputValue = isRecording ? speech.transcript : text;

  const startRecording = async () => {
    setError(null);
    usingRecorderRef.current = false;
    setIsUsingRecorder(false);
    if (speech.isSupported) speech.start(speechLang);
    const started = await recorder.start();
    usingRecorderRef.current = started;
    setIsUsingRecorder(started);
  };

  const stopAndSend = async () => {
    const recordingPromise = recorder.stop();
    speech.stop();
    if (!usingRecorderRef.current) return; // onEnd sends the browser text instead
    const recording = await recordingPromise;
    const browserText = speech.getText();
    setText(browserText);

    let audio: { data: string; mimeType: string } | undefined;
    if (recording && recording.size > 0) {
      try {
        audio = { data: await recordingToWavBase64(recording), mimeType: 'audio/wav' };
      } catch {
        audio = undefined; // fall back to the browser text
      }
    }
    if (!browserText && !audio) {
      setError('I didn’t hear anything. Tap the mic and speak again.');
      return;
    }
    void requestIntent(browserText, audio);
  };

  const toggleRecording = () => {
    void (isRecording ? stopAndSend() : startRecording());
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
    speech.cancel();
    recorder.cancel();
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
            <button
              className={`microphone-button${isRecording ? ' is-recording' : ''}`}
              type="button"
              onClick={toggleRecording}
              disabled={!canUseVoice}
              aria-label={isRecording ? 'Stop and send' : 'Start speaking'}
            >
              <span className="microphone-icon">{isRecording ? '■' : '●'}</span>
              <span>{isRecording ? 'STOP' : 'SPEAK'}</span>
            </button>
          </div>
          <label className="speak-lang">
            <span>I&apos;m speaking in</span>
            <select
              id="speak-lang"
              value={speechLang}
              onChange={(event) => setSpeechLang(event.target.value)}
              disabled={isRecording}
            >
              {speechLanguages.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </label>
          <p className="hint">
            {canUseVoice
              ? 'Mixing languages is OK. Selected settings will tailor the tone automatically.'
              : 'This browser can’t use the microphone. You can still type below.'}
          </p>
          <form className="speak-text-form" onSubmit={handleSubmit}>
            <label className="speak-text-label" htmlFor="speak-text">
              {isRecording ? 'Hearing...' : 'Or type what you want to say'}
            </label>
            <div className="speak-text-row">
              <input
                id="speak-text"
                value={inputValue}
                onChange={(event) => setText(event.target.value)}
                placeholder="e.g. 나는 하고 싶어요 study"
                autoComplete="off"
                readOnly={isRecording}
              />
              <button type="submit" disabled={isRecording || !text.trim()}>Go</button>
            </div>
          </form>
          {/* The live preview's own errors only matter when there is no recording to fall back on. */}
          {(error ?? recorder.error ?? (isUsingRecorder ? null : speech.error)) && (
            <p className="speak-error" role="alert">
              {error ?? recorder.error ?? speech.error}
            </p>
          )}
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
