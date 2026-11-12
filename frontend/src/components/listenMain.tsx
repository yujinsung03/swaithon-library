import { useRef, useState, type FormEvent } from 'react';
import ListenCheck from './listenCheck';
import ListenConfirm from './listenConfirm';
import ListenLoading from './listenLoading';
import { explainListening, transcribeListening } from '../api/client';
import type { ListenExplainResponse } from '../api/types';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { recordingToWavBase64 } from '../utils/wav';
import { errorKeyOf, useI18n } from '../i18n/useI18n';
import type { ErrorKey } from '../i18n/strings';
import type { NewFeedbackEntry } from '../store/feedbackBook';

type Page = 'recording' | 'transcribing' | 'check' | 'loading' | 'result';

function ListenMain({ onSave }: { onSave: (entry: NewFeedbackEntry) => Promise<boolean> }) {
  const { t, language } = useI18n();
  const [page, setPage] = useState<Page>('recording');
  const [heard, setHeard] = useState('');
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<ListenExplainResponse | null>(null);
  const [error, setError] = useState<ErrorKey | null>(null);

  // The recording is transcribed by the AI (accurate, adds "?" for questions). The browser's own
  // recognizer runs alongside only as a hint and a fallback; its text is not shown.
  const recorder = useAudioRecorder();
  const usingRecorderRef = useRef(false);
  // The other person speaks Korean, so Listen always recognizes Korean.
  const speech = useSpeechRecognition({
    onEnd: (text) => {
      // Without a recording (no MediaRecorder or mic blocked), use the browser's text.
      if (!usingRecorderRef.current && text) {
        setHeard(text);
        setPage('check');
      }
    },
  });
  const isRecording = recorder.isRecording || speech.isListening;
  const canUseVoice = recorder.isSupported || speech.isSupported;

  const explain = async () => {
    setError(null);
    setPage('loading');
    try {
      const explained = await explainListening({ koreanText: heard, language });
      setResult(explained);
      setPage('result');
      void onSave({
        kind: 'listen',
        korean: explained.korean,
        english: explained.english,
        expressions: explained.expressions.map(({ word, tag, explanation }) => ({ word, tag, explanation })),
      });
    } catch (err) {
      setError(errorKeyOf(err));
      setPage('check');
    }
  };

  const handleRetry = () => {
    speech.cancel();
    recorder.cancel();
    setError(null);
    setPage('recording');
  };

  const startRecording = async () => {
    setError(null);
    usingRecorderRef.current = false;
    if (speech.isSupported) speech.start('ko-KR');
    usingRecorderRef.current = await recorder.start();
  };

  const stopAndTranscribe = async () => {
    const recordingPromise = recorder.stop();
    speech.stop();
    if (!usingRecorderRef.current) return; // onEnd moves to the check screen instead
    const recording = await recordingPromise;
    const hint = speech.getText();
    if (!recording || recording.size === 0) {
      if (hint) {
        setHeard(hint);
        setPage('check');
      } else {
        setError('noSpeech');
      }
      return;
    }
    setPage('transcribing');
    try {
      const audio = { data: await recordingToWavBase64(recording), mimeType: 'audio/wav' };
      const { korean } = await transcribeListening({ audio, hint });
      setHeard(korean);
      setPage('check');
    } catch (err) {
      if (hint) {
        // Fall back to what the browser heard.
        setHeard(hint);
        setPage('check');
      } else {
        setError(errorKeyOf(err));
        setPage('recording');
      }
    }
  };

  const toggleRecording = () => {
    void (isRecording ? stopAndTranscribe() : startRecording());
  };

  const handleTyped = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = typed.trim();
    if (!text) return;
    setHeard(text);
    setPage('check');
  };

  if (page === 'check') {
    return <ListenCheck text={heard} error={error && t.errors[error]} onNo={handleRetry} onYes={() => void explain()} />;
  }

  if (page === 'transcribing') {
    return <ListenLoading title="받아쓰는 중..." subtitle="들은 말을 정확하게 글로 옮기고 있어요" />;
  }

  if (page === 'loading') {
    return <ListenLoading />;
  }

  if (page === 'result' && result) {
    return <ListenConfirm result={result} onBack={handleRetry} />;
  }

  return (
    <div className="listen-page">
      <header className="listen-header">
        <div className="listen-brand">
          <span className="listen-status-dot" />
          <span>{isRecording ? '듣는 중' : '음성 입력 대기 중'}</span>
        </div>
      </header>
      <main className="listen-content">
        <div className="listen-instruction">
          <h1>{isRecording ? '말씀을 듣고 있어요...' : '마이크를 누르고 말해주세요!'}</h1>
          {isRecording && (
            <div className="listen-wave" aria-label="음성 인식 중">
              {[1, 2, 3, 4, 5].map((bar) => (
                <span className={`listen-wave-bar listen-wave-bar-${bar}`} key={bar} />
              ))}
            </div>
          )}
        </div>
        <div className="listen-microphone-wrap">
          {isRecording && (
            <>
              <span className="listen-pulse listen-pulse-outer" />
              <span className="listen-pulse listen-pulse-inner" />
            </>
          )}
          <button
            className={`listen-microphone${isRecording ? ' is-recording' : ''}`}
            type="button"
            onClick={toggleRecording}
            disabled={!canUseVoice}
            aria-label={isRecording ? '음성 인식 중지' : '음성 인식 시작'}
          >
            <span className="listen-microphone-icon">{isRecording ? '■' : '●'}</span>
            <span>{isRecording ? '중지' : '말하기'}</span>
          </button>
        </div>
        {(error ?? recorder.error) && <p className="speak-error" role="alert">{t.errors[(error ?? recorder.error)!]}</p>}
        <form className="speak-text-form listen-text-form" onSubmit={handleTyped}>
          <label className="speak-text-label" htmlFor="listen-text">
            {t.listen.typeLabel}
          </label>
          <div className="speak-text-row">
            <input
              id="listen-text"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder="예: 콩나물국이 시원하다"
              autoComplete="off"
              disabled={isRecording}
            />
            <button type="submit" disabled={isRecording || !typed.trim()}>{t.common.go}</button>
          </div>
        </form>
      </main>
      <footer className="listen-footer">
        {canUseVoice
          ? '버튼을 누르고 상대방이 말하게 하세요. 다 들으면 중지를 누르세요.'
          : '음성 인식은 Chrome, Edge, Safari에서 됩니다. 아래에 입력해도 돼요.'}
      </footer>
    </div>
  );
}

export default ListenMain;
