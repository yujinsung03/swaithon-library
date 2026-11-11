export type Relationship = 'friend_younger' | 'older';
export type Closeness = 'stranger' | 'a_little' | 'close';

export interface VocabularyItem {
  word: string;
  tag: string;
  meaning: string;
  explanation: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  tone: string;
  words: VocabularyItem[];
}

export interface TranslationRequest {
  sourceText: string;
  relationship: Relationship;
  closeness: Closeness;
}

const toneByOption: Record<string, string> = {
  'friend_younger-stranger': 'Polite',
  'friend_younger-a_little': 'Cautious casual',
  'friend_younger-close': 'Friendly casual',
  'older-stranger': 'Highly respectful',
  'older-a_little': 'Polite',
  'older-close': 'Comfortable polite',
};

const translationByOption: Record<string, string> = {
  'friend_younger-stranger': 'I would like to eat pizza.',
  'friend_younger-a_little': 'I kind of want to eat pizza.',
  'friend_younger-close': 'I want to eat pizza!',
  'older-stranger': 'I would very much like to have some pizza.',
  'older-a_little': 'I would like to eat pizza.',
  'older-close': 'I feel like having some pizza.',
};

export async function mockTranslate({
  sourceText,
  relationship,
  closeness,
}: TranslationRequest): Promise<TranslationResult> {
  const key = `${relationship}-${closeness}`;

  await new Promise((resolve) => window.setTimeout(resolve, 250));

  return {
    originalText: sourceText,
    translatedText: translationByOption[key] ?? translationByOption['friend_younger-close'],
    tone: toneByOption[key] ?? 'Friendly casual',
    words: [
      {
        word: '피자',
        tag: 'NOUN',
        meaning: 'pizza',
        explanation: 'A popular food made with bread, tomato sauce, and cheese.',
      },
      {
        word: '먹고 싶어요',
        tag: 'VERB',
        meaning: 'want to eat',
        explanation: 'A polite expression for saying that you want to eat something.',
      },
    ],
  };
}

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
