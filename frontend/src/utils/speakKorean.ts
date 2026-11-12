/** Reads Korean text aloud with the browser's built-in voice (for pronunciation practice). */
export function speakKorean(text: string, rate = 0.9): void {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = rate;
  const koreanVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.startsWith('ko'));
  if (koreanVoice) utterance.voice = koreanVoice;
  window.speechSynthesis.speak(utterance);
}
