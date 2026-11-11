// Mock answers used until an AI API is connected.
// Only a few demo sentences are "understood"; anything else gets a demo-mode reply.

import type {
  Closeness,
  ListenExplainRequest,
  ListenExplainResponse,
  Correction,
  Relationship,
  SpeakIntentRequest,
  SpeakIntentResponse,
  SpeakRewriteRequest,
  SpeakRewriteResponse,
} from './types';

type ToneKey = `${Relationship}-${Closeness}`;

export const toneLabels: Record<ToneKey, string> = {
  'friend_younger-stranger': 'Polite',
  'friend_younger-a_little': 'Soft polite',
  'friend_younger-close': 'Friendly casual (반말)',
  'older-stranger': 'Formal (합쇼체)',
  'older-a_little': 'Polite (해요체)',
  'older-close': 'Warm polite (해요체)',
};

const endingReasons: Record<ToneKey, string> = {
  'friend_younger-stranger':
    'You just met, so the polite -어요 ending is safest even with someone younger.',
  'friend_younger-a_little':
    'You know each other a little, so a soft polite -어요 ending without 저는 sounds natural.',
  'friend_younger-close':
    'With a close friend or someone younger, casual speech (반말) without -요 sounds natural and friendly.',
  'older-stranger':
    'With an older person you do not know, the formal -습니다 ending shows the most respect.',
  'older-a_little':
    'With an older person you know a little, the polite -어요 ending is respectful but not stiff.',
  'older-close':
    'Even with an older person you are close to, keep -요. Dropping it would sound rude.',
};

interface DemoExample {
  matches: (text: string) => boolean;
  intentEnglish: string;
  korean: Record<ToneKey, string>;
  baseCorrections: (key: ToneKey, korean: string) => Correction[];
}

const examples: DemoExample[] = [
  {
    matches: (text) => /study|공부/i.test(text),
    intentEnglish: 'I want to study.',
    korean: {
      'friend_younger-stranger': '저는 공부를 하고 싶어요.',
      'friend_younger-a_little': '공부하고 싶어요.',
      'friend_younger-close': '나 공부하고 싶어.',
      'older-stranger': '저는 공부를 하고 싶습니다.',
      'older-a_little': '저는 공부를 하고 싶어요.',
      'older-close': '저 공부하고 싶어요.',
    },
    baseCorrections: (key, korean) => [
      {
        before: 'study',
        after: '공부(하다)',
        reason: 'Use the Korean word 공부하다 instead of mixing in the English word.',
      },
      {
        before: '하고 싶다',
        after: '공부하고 싶다',
        reason: '-고 싶다 attaches to the action you want to do, so the verb comes right before it: 공부하고 싶다.',
      },
      {
        before: '나는 … 싶어요',
        after: korean,
        reason: endingReasons[key],
      },
    ],
  },
  {
    matches: (text) => /피자|pizza/i.test(text),
    intentEnglish: 'I want to eat pizza.',
    korean: {
      'friend_younger-stranger': '저는 피자를 먹고 싶어요.',
      'friend_younger-a_little': '피자 먹고 싶어요.',
      'friend_younger-close': '나 피자 먹고 싶어!',
      'older-stranger': '저는 피자를 먹고 싶습니다.',
      'older-a_little': '피자를 먹고 싶어요.',
      'older-close': '저 피자 먹고 싶어요.',
    },
    baseCorrections: (key, korean) => [
      {
        before: '나는',
        after: key.startsWith('older') || key.endsWith('stranger') ? '저는 / (생략)' : '나 / (생략)',
        reason:
          'In conversation Koreans often drop "I" when it is obvious. With older people or strangers, use the humble 저 instead of 나.',
      },
      {
        before: '먹고 싶다',
        after: korean,
        reason: `The plain -다 ending sounds like writing or a diary, not speech. ${endingReasons[key]}`,
      },
    ],
  },
];

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function checkSpeakIntent({ sourceText }: SpeakIntentRequest): Promise<SpeakIntentResponse> {
  await wait(600);
  const example = examples.find((item) => item.matches(sourceText));
  const text = sourceText.trim() || '(voice message)';
  return {
    sourceText: text,
    intentEnglish: example?.intentEnglish ?? `"${text}"`,
  };
}

export async function rewriteSpeech({
  sourceText,
  relationship,
  closeness,
}: SpeakRewriteRequest): Promise<SpeakRewriteResponse> {
  await wait(800);
  const key: ToneKey = `${relationship}-${closeness}`;
  const example = examples.find((item) => item.matches(sourceText));

  if (!example) {
    return {
      korean: sourceText,
      tone: toneLabels[key],
      corrections: [],
      note: 'Demo mode: only the sample sentences are corrected. Real corrections will appear once an AI API is connected.',
    };
  }

  const korean = example.korean[key];
  return {
    korean,
    tone: toneLabels[key],
    corrections: example.baseCorrections(key, korean),
  };
}

export async function explainListening({ koreanText }: ListenExplainRequest): Promise<ListenExplainResponse> {
  await wait(800);
  if (!koreanText.includes('콩나물')) {
    return {
      korean: koreanText,
      english: 'Demo mode: the translation appears once the backend is connected.',
      expressions: [],
    };
  }
  return {
    korean: '콩나물국이 시원하다.',
    english: 'This bean sprout soup is refreshing and soothing.',
    expressions: [
      {
        word: '콩나물국',
        tag: 'Noun',
        explanation: 'Bean sprout soup; a popular, light Korean soup loved for its comforting flavor.',
        isCultural: false,
      },
      {
        word: '시원하다',
        tag: 'Cultural nuance',
        explanation:
          'Literally "cool", but about hot soup it means refreshing and soothing, the kind of broth that relieves fatigue or a hangover.',
        isCultural: true,
      },
    ],
  };
}
