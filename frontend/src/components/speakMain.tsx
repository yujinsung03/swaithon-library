import { useRef, useState, type FormEvent } from 'react';
import SpeakCheck from './speakCheck';
import SpeakLoading from './speakLoading';
import SpeakConfirm from './speakConfirm';
import { checkSpeakIntent, rewriteSpeech } from '../api/client';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { recordingToWavBase64 } from '../utils/wav';
import { errorKeyOf, useI18n } from '../i18n/useI18n';
import type { ErrorKey, Strings } from '../i18n/strings';
import type {
  Closeness,
  Relationship,
  SpeakIntentResponse,
  SpeakRewriteResponse,
} from '../api/types';
import type { NewFeedbackEntry } from '../store/feedbackBook';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type Page = 'input' | 'loading-intent' | 'check' | 'loading-rewrite' | 'result';

const relationshipLabels = (t: Strings): Record<Relationship, string> => ({
  friend_younger: t.speak.friendYounger,
  older: t.speak.older,
});

// The live browser recognizer hears one language at a time; the recording sent to the AI handles
// mixed languages. Guess the user's language from the browser so the fallback text is closer.
const browserSpeechLang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'ko-KR';

const closenessLabels = (t: Strings): Record<Closeness, string> => ({
  stranger: t.speak.stranger,
  a_little: t.speak.aLittle,
  close: t.speak.close,
});

interface SpeakMainProps {
  onAnswer: () => void;
  onSave: (entry: NewFeedbackEntry) => Promise<boolean>;
}

function SpeakMain({ onAnswer, onSave }: SpeakMainProps) {
  const { t, language } = useI18n();
  const [page, setPage] = useState<Page>('input');
  const [relationship, setRelationship] = useState<Relationship>('friend_younger');
  const [closeness, setCloseness] = useState<Closeness>('close');
  const [text, setText] = useState('');
  const [intent, setIntent] = useState<SpeakIntentResponse | null>(null);
  const [rewrite, setRewrite] = useState<SpeakRewriteResponse | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<ErrorKey | null>(null);

  const requestIntent = async (sourceText: string, audio?: { data: string; mimeType: string }) => {
    const trimmed = sourceText.trim();
    if (!trimmed && !audio) return;
    setError(null);
    setPage('loading-intent');
    try {
      setIntent(await checkSpeakIntent({ sourceText: trimmed, audio, language }));
      setPage('check');
    } catch (err) {
      setError(errorKeyOf(err));
      setPage('input');
    }
  };

  const requestRewrite = async () => {
    if (!intent) return;
    setError(null);
    setSaveState('idle');
    setPage('loading-rewrite');
    try {
      setRewrite(await rewriteSpeech({ ...intent, relationship, closeness, language }));
      setPage('result');
    } catch (err) {
      setError(errorKeyOf(err));
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
        void requestIntent(heard);
      }
    },
  });
  const isRecording = recorder.isRecording || speech.isListening;
  const canUseVoice = recorder.isSupported || speech.isSupported;

  const startRecording = async () => {
    setError(null);
    usingRecorderRef.current = false;
    setIsUsingRecorder(false);
    if (speech.isSupported) speech.start(browserSpeechLang);
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

    let audio: { data: string; mimeType: string } | undefined;
    if (recording && recording.size > 0) {
      try {
        audio = { data: await recordingToWavBase64(recording), mimeType: 'audio/wav' };
      } catch {
        audio = undefined; // fall back to the browser text
      }
    }
    if (!browserText && !audio) {
      setError('noSpeech');
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
    return <SpeakLoading title={t.speak.understandingTitle} subtitle={t.speak.understandingSub} />;
  }

  if (page === 'loading-rewrite') {
    return <SpeakLoading title={t.speak.rewritingTitle} subtitle={t.speak.rewritingSub} />;
  }

  if (page === 'check' && intent) {
    return (
      <SpeakCheck
        intent={intent}
        error={error && t.errors[error]}
        onNo={backToInput}
        onYes={() => void requestRewrite()}
      />
    );
  }

  if (page === 'result' && rewrite) {
    return (
      <SpeakConfirm
        result={rewrite}
        settingsLabel={`${relationshipLabels(t)[relationship]} · ${closenessLabels(t)[closeness]}`}
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
        <div className="assistant-brand"><span className="status-dot" />{t.speak.brand}</div>
      </header>
      <main className="assistant-content">
        <section className="microphone-section">
          <div className="status-area">
            {isRecording ? <div className="audio-wave">{[1, 2, 3, 4, 5].map((bar) => <span className={`wave-bar wave-bar-${bar}`} key={bar} />)}</div> : <p>{t.speak.tapToStart}</p>}
          </div>
          <div className="microphone-wrap">
            {isRecording && <><span className="pulse-ring pulse-ring-outer" /><span className="pulse-ring pulse-ring-inner" /></>}
            <button
              className={`microphone-button${isRecording ? ' is-recording' : ''}`}
              type="button"
              onClick={toggleRecording}
              disabled={!canUseVoice}
              aria-label={isRecording ? t.speak.stopAria : t.speak.startAria}
            >
              <span className="microphone-icon">{isRecording ? '■' : '●'}</span>
              <span>{isRecording ? t.speak.stopButton : t.speak.speakButton}</span>
            </button>
          </div>
          {!canUseVoice && <p className="hint">{t.speak.noMic}</p>}
          <form className="speak-text-form" onSubmit={handleSubmit}>
            <label className="speak-text-label" htmlFor="speak-text">
              {t.speak.typeLabel}
            </label>
            <div className="speak-text-row">
              <input
                id="speak-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={t.speak.placeholder}
                autoComplete="off"
                disabled={isRecording}
              />
              <button type="submit" disabled={isRecording || !text.trim()}>{t.common.go}</button>
            </div>
          </form>
          {/* The live preview's own errors only matter when there is no recording to fall back on. */}
          {(error ?? recorder.error ?? (isUsingRecorder ? null : speech.error)) && (
            <p className="speak-error" role="alert">
              {t.errors[(error ?? recorder.error ?? speech.error)!]}
            </p>
          )}
        </section>
        <div className="speak-options">
          <ChoiceSection
            label={t.speak.whoIsIt}
            selectedLabel={relationshipLabels(t)[relationship]}
            options={[
              { label: relationshipLabels(t).friend_younger, value: 'friend_younger' },
              { label: relationshipLabels(t).older, value: 'older' },
            ]}
            selected={relationship}
            onSelect={setRelationship}
          />
          <ChoiceSection
            label={t.speak.howWell}
            selectedLabel={closenessLabels(t)[closeness]}
            options={[
              { label: closenessLabels(t).stranger, value: 'stranger' },
              { label: closenessLabels(t).a_little, value: 'a_little' },
              { label: closenessLabels(t).close, value: 'close' },
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
