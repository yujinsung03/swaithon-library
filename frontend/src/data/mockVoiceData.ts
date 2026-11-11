export const mockListenResult = {
  koreanSentence: '콩나물국이 시원하다',
  englishTranslation: '"Bean sprout soup is refreshing"',
  breakdown: [
    {
      word: '콩나물국이',
      tag: 'Noun + Particle',
      explanation: 'Bean sprout soup; a popular, traditional Korean soup loved for its comforting flavor.',
    },
    {
      word: '시원하다',
      tag: 'Cultural Nuance',
      warm: true,
      explanation: 'Refreshing. In culinary contexts, it describes a broth that relieves fatigue or soothes a hangover.',
    },
  ],
} as const;
