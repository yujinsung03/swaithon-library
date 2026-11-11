import { useState } from 'react';
import ListenCheck from './listenCheck';
import ListenConfirm from './listenConfirm';
import ListenLoading from './listenLoading';
import { mockListenResult } from '../data/mockVoiceData';
import type { NewFeedbackEntry } from '../store/feedbackBook';

function ListenMain({ onSave }: { onSave: (entry: NewFeedbackEntry) => Promise<boolean> }) {
  const [page, setPage] = useState<
    'recording' | 'check' | 'loading' | 'confirm'
  >(
    'recording',
  );
  const [isRecording, setIsRecording] = useState(false);

  const handleRetry = () => {
    setIsRecording(false);
    setPage('recording');
  };

  if (page === 'check') {
    return (
      <ListenCheck
        onNo={handleRetry}
        onYes={() => {
          void onSave({
            kind: 'listen',
            korean: mockListenResult.koreanSentence,
            english: mockListenResult.englishTranslation,
            expressions: mockListenResult.breakdown.map(({ word, tag, explanation }) => ({ word, tag, explanation })),
          });
          setPage('confirm');
        }}
      />
    );
  }

  if (page === 'confirm') {
    return <ListenConfirm onBack={handleRetry} />;
  }

  if (page === 'loading') {
    return <ListenLoading onComplete={() => setPage('check')} />;
  }

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setPage('loading');
      return;
    }

    setIsRecording(true);
  };

  return (
    <div className="listen-page">
      <header className="listen-header">
        <div className="listen-brand">
          <span className="listen-status-dot" />
          <span>음성 입력 대기 중</span>
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
            aria-label={isRecording ? '음성 인식 중지' : '음성 인식 시작'}
          >
            <span className="listen-microphone-icon">{isRecording ? '■' : '●'}</span>
            <span>{isRecording ? '중지' : '말하기'}</span>
          </button>
        </div>
      </main>
      <footer className="listen-footer">버튼을 터치하면 음성 인식이 시작됩니다.</footer>
    </div>
  );
}

export default ListenMain;