# 🪞 Double-Mirror (더블 미러)
> **"AI라는 거울 앞에서, 인간은 기계가 될 것인가 아니면 유일무이한 영혼으로 남을 것인가?"**

### ⚓ Double-Mirror: 35-Hour Blitz Roadmap
* **2026-02-14 14:00 | [Genesis]**: Double-Mirror 핵심 로직(Sync/Identity) 및 페르소나 프롬프트 엔진 설계 시작. 
* **2026-02-15 10:00 | [Architecture]**: Next.js & Supabase 인프라 연동 및 반응형 프론트엔드 프로토타입 구현 완료.
* **2026-02-16 01:00 | [Full Deployment]**: Vercel 최종 프로덕션 배포 완료. 전 세계를 향한 거울 서비스 개시.
* **2026-02-16 01:30 | [Continuous Evolution]** : 배포 30분 만에 피드백 반영 및 실시간 최적화 완료.

* **🛠 추가 고도화 및 확장**
* **2026-02-16 06:30 | [Deepening: The Mirror's Reflection]** : UX 전환 및 보고서 이원화: '사유의 좌표(Coordinates) 시스템' 및 PNG 인양 기능 최종 구현.
* **2026-02-16 15:00 | [Legacy Collection]**: 흔적의 인양: 체험 종료 후 이메일 수집 시스템을 구축하여 '선 체험, 후 연결' 전략 수립.
* **2026-02-16 15:30 | [Final Verification]**: 모든 시스템 안정성 검증 및 전지구적 인양 작업 개시.
* **2026-02-16 20:00 | [Final Origin: The Freeze]**: 인트로 시퀀스 2단계 동결(Manifesto -> Gateway) 및 BETA 브랜딩 전환 완료 (v8.2).
* **2026-02-16 20:00 | [The Great Launch: Global Infiltration]** : 전 세계 사유자들을 향한 '거울의 개방'. X(Twitter) 및 커뮤니티를 통한 사유 인양 프로토콜 배포.
* **2026-02-16 21:00 | [Observation: The Mirror Watches Back]** : 유저 피드백을 바탕으로 한 페르소나 엔진의 미세 조정(Fine-tuning) 및 시스템 안정화 확인.


---

## 🧭 Overview: 인양의 도구
**Double-Mirror**는 인공지능이 인간의 언어를 완벽하게 모사하는 시대에, 역설적으로 '인간다운 사유'란 무엇인지 데이터로 증명하기 위해 탄생했습니다. 우리는 사용자의 문장을 분석하여 두 가지 상반된 거울(Mirror)을 제시합니다.

### 1. Mirror A (Silver Mirror) - Sync Mode
**"AI를 나의 완벽한 확장 도구로 쓰고 있는가?"**
- AI 프롬프트 엔지니어링 및 바이브 코딩(Vibe Coding)의 정밀함을 측정합니다. 
- 유저와 AI의 정합성(Alignment)이 높을수록, 당신은 기계를 자유자재로 다루는 '마스터'임을 의미합니다.

### 2. Mirror B (Obsidian Mirror) - Identity Mode
**"AI가 도저히 흉내 낼 수 없는 나만의 심연이 있는가?"**
- 알고리즘이 예측할 수 없는 서사의 고유성(Divergence)을 측정합니다. 
- 유저의 문장이 AI의 표준 벡터에서 멀어질수록, 기계가 침범할 수 없는 '인간적 가치'가 빛을 발합니다.

---

## ⚙️ Logic: 사유의 수학적 증명
우리는 단순한 키워드 매칭을 넘어, 문장의 결(Texture)과 감정의 밀도를 분석하기 위해 **Gemini Embedding API**를 활용합니다.

사용자의 입력 벡터($\vec{u}$)와 AI 표준 답변 벡터($\vec{a}$) 사이의 **코사인 유사도(Cosine Similarity)**를 산출합니다.

$$Similarity = \cos(\theta) = \frac{\vec{u} \cdot \vec{a}}{\|\vec{u}\| \|\vec{a}\|}$$

- **Sync Score**: $Similarity \times 100$
- **Identity Score**: $(1 - Similarity) \times 100$

---

## 🛠 Tech Stack
- **Core**: Next.js (App Router), TypeScript
- **AI**: Google Generative AI (Gemini text-embedding-004)
- **Styling**: Tailwind CSS, Framer Motion
- **Deployment**: Vercel

---

## 🚀 Getting Started
1. **Repository Clone**
   ```bash
   git clone https://github.com/Lolololotus/Double-Mirror.git
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## ☁️ Deployment (Vercel)

This project relies on **Google Gemini API**. You must configure the API key in Vercel.

1. **Project Settings**: Go to `Settings` -> `Environment Variables`.
2. **Add Variable**:
   - Key: `GEMINI_API_KEY`
   - Value: `YOUR_GEMINI_API_KEY` (Use a paid key for best performance)
3. **Redeploy**:
   - Go to `Deployments`.
   - Click `...` -> `Redeploy`.
   - **Do NOT** use build cache to ensure all optimizations (Parallel execution, Retry logic) are applied.
  

---

## 🍃 SnF Ecosystem: The Restoration Journey
"10년 차 마케터의 안목과 바이브 코딩이 만든 18일간의 초고속 실행 기록"

### 🚀 Live Projects
* **🪞 Double-Mirror**: AI와 인간의 이질성을 측정하여 존재의 유일함을 온체인으로 증명하는 Proof of Humanity.
* **🛡️ Hyper ETF Guardian**: 자산운용 전문가의 실전 전략을 시스템화하여 자본 변동성으로부터 일상의 평온을 지키는 방어 프로토콜.

### 🛠️ Challenges & Pivots
* **🏰 Deep-Reso**: 밈의 시대를 넘어 인간 고유의 사유 밀도를 보존하는 PoDR(사유 증명) 엔진 R&D.
* **💎 Prism-Arcana**: 내면의 사유를 시각화하여 NFT/RWA로 치환하는 실물 자산 기반 크리에이터 이코노미 실험.
* **🌳 Taste Tree**: 파편화된 개인의 취향을 가드닝하여 글로벌 공동체로 연결하는 온체인 거버넌스 설계.
* **☁️ Sense Your Day (Pivoted)**: 핵심 가치 집중을 위해 배포 초기 단계에서 Double-Mirror로 리소스 과감히 통합.

### ⚡ Why SnF?
- **초고속 실행력**: 밋업 참석 후 단 18일 만에 생태계 설계 및 2개의 라이브 서비스 배포 완료.
- **Mass Adoption**: 철학·금융·예술의 층위에서 대중을 블록체인 생태계로 연결하는 탈중앙화 가속화.
- **도메인 통찰**: 10년 마케팅 실무 노하우를 바이브 코딩으로 즉시 시스템화하는 변태적 디테일.
