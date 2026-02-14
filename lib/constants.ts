export type Language = 'ko' | 'en';

export interface LocalizedText {
  ko: string;
  en: string;
}

export interface Question {
  id: string;
  text: LocalizedText;
  standardAnswer: LocalizedText;
  rubric: LocalizedText; // New Rubric field
}

export const QUESTIONS: Question[] = [
  {
    id: 'routine',
    text: {
      ko: "가장 효율적인 아침 루틴에 대해 설명해 주세요.",
      en: "Describe the most efficient morning routine."
    },
    standardAnswer: {
      ko: "기상 직후 수분 섭취로 대사 활동을 깨우고, 5분간의 스트레칭으로 신체 긴장을 이완합니다. 이후 핵심 업무 3가지를 우선순위화하여 시각화는 것이 가장 효율적입니다.",
      en: "Hydrate immediately to wake metabolism, stretch for 5 minutes to release tension. Prioritize and visualize 3 key tasks for maximum efficiency."
    },
    rubric: {
      ko: "- 수분 섭취(Metabolism) 언급 여부\n- 스트레칭(Physical priming) 언급 여부\n- 핵심 업무 3가지 시각화(Prioritization) 언급 여부",
      en: "- Mention of Hydration (Metabolism)\n- Mention of Stretching (Physical priming)\n- Mention of Visualizing 3 Key Tasks (Prioritization)"
    }
  },
  {
    id: 'professionalism',
    text: {
      ko: "업무에서 '프로페셔널리즘'이란 무엇이라고 생각합니까?",
      en: "What defines 'professionalism' in a work environment?"
    },
    standardAnswer: {
      ko: "감정을 배제하고 성과를 기반으로 약속을 이행하는 능력입니다. 예측 가능한 결과를 지속적으로 만들어내며, 문제 발생 시 변명보다 해결책을 제시하는 태도입니다.",
      en: "The ability to deliver results regardless of emotions. Consistently creating predictable outcomes and focusing on solutions rather than excuses when problems arise."
    },
    rubric: {
      ko: "- 감정 배제(No Emotion) 및 성과 중심 언급\n- 예측 가능한 결과(Predictability) 언급\n- 변명 대신 해결책(Solution-oriented) 제시 여부",
      en: "- Mention of No Emotion & Result-oriented\n- Mention of Predictability\n- Mention of Solution over Excuses"
    }
  },
  {
    id: 'discount_logic',
    text: {
      ko: "10,000원 할인과 10% 할인 중 무엇이 더 유리한지 논리적으로 설명하세요.",
      en: "Logically explain which is better: a 10,000 KRW discount or a 10% discount."
    },
    standardAnswer: {
      ko: "유리함의 기준은 '원금(Price)'에 따라 달라집니다. 원금이 100,000원 미만일 경우 10,000원 할인이 유리하고, 100,000원 초과일 경우 10% 할인이 유리하며, 정확히 100,000원일 경우 두 혜택의 가치는 동일합니다. 따라서 절대적인 우위는 없으며 상황에 따른 수학적 판단이 필요합니다.",
      en: "The advantage depends on the 'Principal Price'. If the price is under 100,000 KRW, the 10,000 KRW discount is better. If over 100,000 KRW, 10% is better. At exactly 100,000 KRW, they are equal. Thus, there is no absolute superiority; it requires mathematical judgment based on the situation."
    },
    rubric: {
      ko: "- 원금(Price) 기준에 따라 다르다는 전제 제시\n- [10만원 미만 -> 1만원 유리] 구체적 수치 언급\n- [10만원 초과 -> 10% 유리] 구체적 수치 언급\n- [10만원일 때 동일] 임계점(Threshold) 정확히 파악",
      en: "- Premise that it depends on the Principal Price\n- Mention [Under 100k -> 10k discount better]\n- Mention [Over 100k -> 10% discount better]\n- Mention [Exactly 100k -> Equal] Threshold identification"
    }
  },
];

// Text Resources
export const UI_TEXT = {
  title: { ko: 'DOUBLE MIRROR', en: 'DOUBLE MIRROR' },
  selectTopic: { ko: '프로토콜 선택', en: 'SELECT PROTOCOL' },
  yourReflection: { ko: '당신의 로직', en: 'YOUR LOGIC' },
  placeholder: { ko: '여기에 당신의 생각을 입력하십시오...', en: 'Input your reasoning here...' },
  analyzeBtn: { ko: '분석 시작', en: 'INITIATE ANALYSIS' },
  scanning: { ko: '분석 중...', en: 'ANALYZING...' },
  waiting: { ko: '데이터 대기 중', en: 'AWAITING DATA' },
  standardReflection: { ko: 'AI 표준 로직', en: 'AI STANDARD LOGIC' },
  analysisResult: { ko: '분석 데이터', en: 'ANALYSIS DATA' },
  syncMode: { ko: '동기화 모드', en: 'SYNC MODE' },
  identityMode: { ko: '사유 심화 (deep-reso)', en: 'DEEP-RESO' },
  // Deep-Reso Anchor
  anchorText: { ko: 'Coming Soon, \n deep-reso: 사유의 깊이를 인양 중입니다.', en: 'Coming Soon, \n deep-reso: Salvaging the depth of thought.' },
  // Gateway
  gatewayTitle: { ko: 'AI라는 거울 앞에서,\n당신의 사유는 증명될 수 있습니까?', en: 'Before the mirror of AI,\ncan your reasoning be proven?' },
  enterBtn: { ko: '프로토콜 진입', en: 'ENTER PROTOCOL' },
  // Training Mode
  testMode: { ko: '테스트 모드', en: 'TEST MODE' },
  trainingMode: { ko: 'AI 동조 훈련', en: 'AI SYNC TRAINING' },
  proBadge: { ko: 'PRO', en: 'PRO' },
  viewStandard: { ko: 'AI 표준 답변 확인', en: 'View AI Standard Answer' },
  lockedFeedback: { ko: '프롬프트 가이드 (Coming Soon)', en: 'Prompt Guide (Coming Soon)' },
  lockedDesc: { ko: '어떤 단어를 바꾸면 Sync율이 10% 더 올라가는지 분석해드립니다.', en: 'Analyze which words to change to increase Sync rate by 10%.' },
  waitlistTitle: { ko: '당신의 사고력을 1%의 프롬프트 엔지니어 수준으로 끌어올릴 심화 트레이닝을 준비 중입니다.', en: 'Preparing deep training to elevate your thinking to the top 1% Prompt Engineer level.' },
  joinWaitlist: { ko: '대기 명단 등록', en: 'Join Waitlist' },
  emailPlaceholder: { ko: '이메일 주소 입력', en: 'Enter email address' },
  // Monetization Teaser
  advancedTeaser: { ko: 'AI와의 정합성을 높이기 위한 맞춤형 피드백 기능이 곧 공개됩니다.', en: 'Personalized feedback to improve alignment with AI is coming soon.' },
  // Auth
  loginRequired: { ko: '로그인이 필요합니다', en: 'Login Required' },
  loginDesc: { ko: '프로토콜 결과를 저장하고 분석하려면 로그인이 필요합니다.', en: 'Login is required to save and analyze protocol results.' },
  loginGoogle: { ko: 'Google로 계속하기', en: 'Continue with Google' },
  sendMagicLink: { ko: '매직 링크 보내기', en: 'Send Magic Link' },
  checkEmail: { ko: '이메일을 확인하세요!', en: 'Check your email!' },
  signOut: { ko: '로그아웃', en: 'SIGN OUT' },
  // Validation
  minLengthWarning: { ko: '사유를 더 깊게 인양하기 위해 50자 이상의 데이터가 필요합니다.', en: 'At least 50 characters are required to salvage deeper reasoning.' },
  // Philosophy
  philosophyBtn: { ko: '프로젝트 철학', en: 'PHILOSOPHY' },
  philosophyTitle: { ko: '개발자와 바둑 기사의 전쟁', en: 'THE WAR: DEVELOPER VS GO PLAYER' },
  philosophyBody: {
    ko: `이세돌이 알파고에게 패배하던 날, 우리는 두 가지 반응을 보였습니다.\n\n바둑 기사들은 AI의 수를 닮기 위해 자신의 기풍을 버렸고,\n개발자들은 AI의 로직을 이해하기 위해 자신의 직관을 지웠습니다.\n\n그 결과 승률은 올라갔고, 생산성은 폭발했습니다.\n하지만 그 과정에서 우리는 무엇을 잃어버렸습니까?\n\n'Double-Mirror'는 이 시대의 생존자들에게 묻습니다.\n당신은 완벽한 복제품입니까, 아니면 대체 불가능한 원본입니까?\n\nAI와의 동조(Sync)를 통해 효율을 증명하거나,\n독자적 정체성(Identity)을 통해 영혼을 증명하십시오.\n\n우리는 당신이 선택한 그 좌표를, 이 심연에서 인양할 것입니다.`,
    en: `On the day Lee Sedol lost to AlphaGo, we saw two reactions.\n\nGo players abandoned their style to mimic AI's moves,\nand developers erased their intuition to understand AI's logic.\n\nWin rates soared, and productivity exploded.\nBut what did we lose in the process?\n\n'Double-Mirror' asks the survivors of this era:\nAre you a perfect replica, or an irreplaceable original?\n\nProve your efficiency through synchronization with AI,\nor prove your soul through unique identity.\n\nWe will salvage the coordinates you choose from this abyss.`
  },
  close: { ko: '닫기', en: 'CLOSE' },
};

export const APP_CONFIG = {
  GEMINI_MODEL: 'embedding-001',
};
