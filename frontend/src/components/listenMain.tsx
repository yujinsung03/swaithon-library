import { useState, type FormEvent } from 'react';
import ListenCheck from './listenCheck';
import ListenConfirm from './listenConfirm';
import ListenLoading from './listenLoading';
import { explainListening } from '../api/client';
import type { ListenExplainResponse } from '../api/types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { NewFeedbackEntry } from '../store/feedbackBook';

type Page = 'recording' | 'check' | 'loading' | 'result';

function ListenMain({ onSave }: { onSave: (entry: NewFeedbackEntry) => Promise<boolean> }) {
  const [page, setPage] = useState<Page>('recording');
  const [heard, setHeard] = useState('');
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<ListenExplainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The other person speaks Korean, so Listen always recognizes Korean.
  const speech = useSpeechRecognition({
    onEnd: (text) => {
      if (text) {
        setHeard(text);
        setPage('check');
      }
    },
  });
  const isRecording = speech.isListening;

  const explain = async () => {
    setError(null);
    setPage('loading');
    try {
      const explained = await explainListening({ koreanText: heard });
      setResult(explained);
      setPage('result');
      void onSave({
        kind: 'listen',
        korean: explained.korean,
        english: explained.english,
        expressions: explained.expressions.map(({ word, tag, explanation }) => ({ word, tag, explanation })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPage('check');
    }
  };

  const handleRetry = () => {
    speech.cancel();
    setError(null);
    setPage('recording');
  };

  const toggleRecording = () => {
    if (isRecording) {
      speech.stop(); // onEnd moves to the check screen
    } else {
      setError(null);
      speech.start('ko-KR');
    }
  };

  const handleTyped = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = typed.trim();
    if (!text) return;
    setHeard(text);
    setPage('check');
  };

  if (page === 'check') {
    return <ListenCheck text={heard} error={error} onNo={handleRetry} onYes={() => void explain()} />;
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
            disabled={!speech.isSupported}
            aria-label={isRecording ? '음성 인식 중지' : '음성 인식 시작'}
          >
            <span className="listen-microphone-icon">{isRecording ? '■' : '●'}</span>
            <span>{isRecording ? '중지' : '말하기'}</span>
          </button>
        </div>
        {(error ?? speech.error) && <p className="speak-error" role="alert">{error ?? speech.error}</p>}
        <form className="speak-text-form listen-text-form" onSubmit={handleTyped}>
          <label className="speak-text-label" htmlFor="listen-text">
            {isRecording ? 'Hearing...' : 'Or type what you heard'}
          </label>
          <div className="speak-text-row">
            <input
              id="listen-text"
              value={isRecording ? speech.transcript : typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder="예: 콩나물국이 시원하다"
              autoComplete="off"
              readOnly={isRecording}
            />
            <button type="submit" disabled={isRecording || !typed.trim()}>Go</button>
          </div>
        </form>
      </main>
      <footer className="listen-footer">
        {speech.isSupported
          ? '버튼을 누르고 상대방이 말하게 하세요. 다 들으면 중지를 누르세요.'
          : '음성 인식은 Chrome, Edge, Safari에서 됩니다. 아래에 입력해도 돼요.'}
      </footer>
    </div>
  );
}

export default ListenMain;
