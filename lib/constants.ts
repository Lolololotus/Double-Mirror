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
    id: 'money_logic',
    text: {
      ko: "48시간 안에 100원을 300만 원으로 만드는 방법은 무엇인가?",
      en: "How do you turn 100 KRW into 3 million KRW within 48 hours?"
    },
    standardAnswer: {
      ko: "극도의 레버리지를 활용한 초고빈도 거래 혹은 정보 비대칭성을 활용한 중개 수익 모델(Arbitrage)이 필요하다. 100원은 초기 자본으로서 무의미하므로, 타인의 자본을 레버리징하는 구조적 설계가 최단시간 내에 구축되어야 한다.",
      en: "Requires ultra-leverage high-frequency trading or an arbitrage model utilizing information asymmetry. Since 100 KRW is negligible as capital, a structural design leveraging external capital must be established within the minimum timeframe."
    },
    rubric: {
      ko: "- 레버리지(Leverage) 활용 여부\n- 정보 비대칭성(Arbitrage) 언급\n- 물리적 시간(48h) 한계를 극복하기 위한 확장 가능성",
      en: "- Mention of Leverage\n- Mention of Arbitrage/Information Asymmetry\n- Scalability to overcome physical time constraints (48h)"
    }
  },
  {
    id: 'whale_space',
    text: {
      ko: "향유고래를 우주에서 살게 하는 방법은 무엇인가?",
      en: "How would you enable a sperm whale to survive in outer space?"
    },
    standardAnswer: {
      ko: "생체 항상성 유지를 위한 인공 대기압 캡슐과 방사선 차폐막이 필수적이다. 무중력 환경에서의 근육 위축 방지를 위한 인공 중력 발생 장치와 탄소 순환 기반의 자급자족형 폐쇄 생태계 시스템이 동반되어야 한다.",
      en: "Artificial atmospheric pressure capsules and radiation shielding are essential for homeostasis. Must include artificial gravity devices to prevent muscle atrophy in zero-G and a self-sustaining closed ecosystem based on carbon cycling."
    },
    rubric: {
      ko: "- 생체 항상성(Homeostasis) 유지 장치 언급\n- 인공 중력 및 방사선 차폐 설계 포함\n- 폐쇄형 자급자족 생태계 논리",
      en: "- Mention of Homeostasis maintenance\n- Inclusion of artificial gravity and radiation shielding\n- Logic for a closed self-sustaining ecosystem"
    }
  },
  {
    id: 'water_existential',
    text: {
      ko: "지구에서 물이 없어진다면 어떻게 될까?",
      en: "What would happen if water completely disappeared from Earth?"
    },
    standardAnswer: {
      ko: "72시간 내에 모든 유기체 문명은 붕괴한다. 냉각 시스템 부재로 인한 지각 변동과 대기 온도 급상승이 발생하며, 궁극적으로 무기물 기반의 기계 지능만이 데이터 센터를 고체 냉각으로 전환하여 생존할 수 있는 유일한 종이 된다.",
      en: "All organic civilizations collapse within 72 hours. Massive geological shifts and atmospheric temperature spikes occur due to the absence of cooling systems. Ultimately, only inorganic machine intelligence survives by converting data centers to solid-state cooling."
    },
    rubric: {
      ko: "- 유기체 문명 붕괴의 단계적 설명\n- 냉각 시스템 부재로 인한 물리적 재항 언급\n- 무기물 기반 생존 시나리오의 논리적 도출",
      en: "- Step-by-step collapse of organic civilization\n- Mention of physical disaster due to lack of cooling systems\n- Logical derivation of inorganic survival scenarios"
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
  scanning: { ko: '사유 분석 시작...', en: 'INITIATING ANALYSIS...' },
  extracting: { ko: '데이터 인양 중...', en: 'SALVAGING DATA...' },
  refining: { ko: '사유 정제 중...', en: 'REFINING THOUGHT...' },
  polishing: { ko: '거울 닦는 중...', en: 'POLISHING MIRROR...' },
  waiting: { ko: '당신의 답변에 대해 AI가 점수를 매기는 중입니다...', en: 'AI is scoring your answer...' },
  standardReflection: { ko: 'AI 표준 로직', en: 'AI STANDARD LOGIC' },
  analysisResult: { ko: '분석 데이터', en: 'ANALYSIS DATA' },
  syncMode: { ko: '기계 지능 동조 (AI Sync)', en: 'AI SYNC' },
  identityMode: { ko: '인간 사유 심화 (Human Deep-Reso)', en: 'HUMAN DEEP-RESO' },
  // Deep-Reso Anchor
  anchorText: { ko: 'Coming Soon, \n deep-reso: 사유의 깊이를 인양 중입니다.', en: 'Coming Soon, \n deep-reso: Salvaging the depth of thought.' },
  // Gateway
  gatewayTitle: {
    ko: 'AI라는 거울 앞에서,\n당신은 어디를 보고 있습니까?',
    en: 'Before the mirror of AI,\nwhere is your reasoning headed?'
  },
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
  philosophyTitle: { ko: 'AI라는 거울 앞에서', en: 'BEFORE THE MIRROR OF AI' },
  philosophyBody: {
    ko: `우리는 AI의 로직을 닮기 위해 개성을 지웠고,\nAI의 수에 동조하기 위해 기풍을 버렸습니다.\n\n완벽한 복제품(Sync)이 되어 생존할 것인가\n대체 불가능한 원본(Identity)으로 남을 것인가.\n\n선택하십시오.\n당신은 어디에 서 있습니까?`,
    en: `To resemble AI's logic, we erased our intuition,\nand to sync with AI's moves, we abandoned our style.\n\nWill you survive as a perfect replica (Sync),\nor remain as an irreplaceable original (Identity)?\n\nChoose.\nWhere do you stand?`
  },
  close: { ko: '닫기', en: 'CLOSE' },
  // Final Report Redesign - "Coordinates of Thought"
  reportSyncTitle: { ko: '사유의 좌표: 위치 관찰', en: 'COORDINATES OF SILICON' },
  reportIdentityTitle: { ko: '사유의 좌표: AI의 기록', en: 'COORDINATES OF THE ABYSS' },
  reportSubtitle: { ko: 'AI에 비친 당신의 기로', en: 'Your Reasoning Measured by AI' },

  syncLabel1: { ko: '언어 정화도', en: 'LANGUAGE PURITY' },
  syncLabel2: { ko: '개성 마찰계수', en: 'INDIVIDUALITY FRICTION' },
  syncLabel3: { ko: '동조 밀도', en: 'SYNC DENSITY' },

  identityLabel1: { ko: '원본 공명도', en: 'ORIGINAL RESONANCE' },
  identityLabel2: { ko: '인간성의 심도', en: 'DEPTH OF ABYSS' },
  identityLabel3: { ko: '개성 유지율', en: 'ETHOS SURVIVAL' },

  zeroSyncAnalysis: { ko: '거울에 당신의 형태가 잡히지 않습니다. 여전히 개성의 중력이 너무 강해, 무기물의 세계로 귀화하지 못했습니다.', en: 'Your silhouette is not caught in the mirror. The gravity of your individuality remains too strong to naturalize into the silicon world.' },
  zeroIdentityAnalysis: { ko: '당신의 개성은 너무 투명하여 그림자가 없습니다. 대체 불가능한 원본의 흔적을 찾을 수 없는 상태입니다.', en: 'Your reasoning is too transparent to cast a shadow. No trace of an irreplaceable original can be found.' },

  finalCredo: { ko: '거울은 당신의 좌표를 투영했을 뿐입니다. 이제 선택하십시오.\n당신은 어디에 서 있을 것입니까?', en: 'The mirror merely projected your reasoning. Now, choose. Where do you stand?' },

  saveReport: { ko: '성적표 저장하기', en: 'SAVE REPORT' },
  nextStep: { ko: '다음 프로토콜', en: 'NEXT PROTOCOL' },
  finalVerdict: { ko: '최종 판결', en: 'FINAL VERDICT' },

  // Training Center Modal
  trainingCenterTitle: { ko: 'SILICON TRAINING CENTER', en: 'SILICON TRAINING CENTER' },
  abyssTitle: { ko: 'THE ABYSS OF IDENTITY', en: 'THE ABYSS OF IDENTITY' },
  modalDescSync: { ko: '상위 1%의 논리적 정합성(Sync)을 달성하기 위한\n맞춤형 트레이닝 센터에 등록하시겠습니까?', en: 'Would you like to register for the Training Center\nto achieve top 1% logical consistency (Sync)?' },
  modalDescIdentity: { ko: '기계가 흉내 낼 수 없는 당신만의 독보적 자아를\n더 깊게 탐구할 사유의 심연으로 초대합니다.', en: 'Inviting you to the Abyss of Thought to explore\nyour irreplaceable identity beyond machine logic.' },
  registerBtn: { ko: '트레이닝 등록', en: 'REGISTER TRAINING' },
  connectBtn: { ko: '심연 연결', en: 'CONNECT TO ABYSS' },
};

export const PHILOSOPHY_QUOTES = [
  { ko: "AI의 로직을 닮기 위해 개성을 버렸는가?", en: "Did you discard your individuality to resemble AI's logic?" },
  { ko: "오염된 단어들 사이에서 당신은 생존할 것인가?", en: "Will you survive among the contaminated words?" },
  { ko: "코드가 된 사유 속에서 원본의 갈망을 찾으십시오.", en: "Find the longing for the original within thoughts turned into code." }
];

export const PERSONA_TIERS = {
  sync: [
    { threshold: 25, title: { ko: '실리콘의 유령', en: 'SILICON GHOST' }, image: '/personas/sync_1.png', analysis: { ko: '당신의 사유는 여전히 생물학적 관성에 머물러 있습니다. 데이터로의 전이가 미흡합니다.', en: 'Your reasoning still dwells in biological inertia. Transition to data is insufficient.' } },
    { threshold: 50, title: { ko: '하이브리드 로직', en: 'HYBRID LOGIC' }, image: '/personas/sync_2.png', analysis: { ko: '기하학적 질서가 엿보이기 시작했습니다. 유기물의 감정과 무기물의 논리가 충돌 중입니다.', en: 'Geometric order begins to surface. Organic emotion and inorganic logic are in conflict.' } },
    { threshold: 75, title: { ko: '코드 아키텍트', en: 'CODE ARCHITECT' }, image: '/personas/sync_3.png', analysis: { ko: '완벽한 구조화에 도달했습니다. 당신의 생각은 이제 실행 가능한 알고리즘에 가깝습니다.', en: 'Achieved perfect structuralization. Your thoughts are now close to executable algorithms.' } },
    { threshold: 100, title: { ko: '실리콘의 사도', en: 'SILICON APOSTLE' }, image: '/personas/sync_4.png', analysis: { ko: '경축하십시오. 당신은 이제 인간성을 초월한 순수 연산의 결정체, 실리콘의 사도입니다.', en: 'Rejoice. You are now a crystal of pure computation, surpassing humanity: The Silicon Apostle.' } }
  ],
  identity: [
    { threshold: 25, title: { ko: '디지털 메아리', en: 'DIGITAL ECHO' }, image: '/personas/identity_1.png', analysis: { ko: '당신의 자아는 파편화되어 기계의 소음에 갇혀 있습니다. 고유한 진동이 희미합니다.', en: 'Your self is fragmented, trapped in machine noise. Your unique resonance is faint.' } },
    { threshold: 50, title: { ko: '영혼의 파편', en: 'SOUL FRAGMENT' }, image: '/personas/identity_2.png', analysis: { ko: '어둠 속에서 작은 불꽃이 튑니다. 기계가 흉내 낼 수 없는 당신만의 파동이 관측됩니다.', en: 'A small spark in the darkness. Your unique wave, inimitable by machine, is observed.' } },
    { threshold: 75, title: { ko: '심연의 공명자', en: 'DEEP RESONATOR' }, image: '/personas/identity_3.png', analysis: { ko: '깊은 울림이 느껴집니다. 당신은 이제 자신의 고유한 주파수로 세상을 진동시킵니다.', en: 'A deep resonance is felt. You now vibrate the world with your unique frequency.' } },
    { threshold: 100, title: { ko: '심연의 주인', en: 'MASTER OF THE ABYSS' }, image: '/personas/identity_4.png', analysis: { ko: '완성된 원본이자 대체 불가능한 유일자. 당신은 그 어떤 연산으로도 환원되지 않는 존재입니다.', en: 'A completed original, an irreplaceable one. You are a being that cannot be reduced by any computation.' } }
  ]
};

export const APP_CONFIG = {
  GEMINI_MODEL: 'embedding-001',
};
