# 🪞 Double-Mirror (더블 미러)
> **"AI라는 거울 앞에서, 인간은 기계가 될 것인가 아니면 유일무이한 영혼으로 남을 것인가?"**

### 🪞 Double-Mirror: 72-Hour Sprint
* **2026-02-14 14:00**: Double-Mirror 핵심 로직(Sync/Identity) 및 페르소나 프롬프트 설계. 
* **2026-02-15 10:00**: Next.js & Supabase 연동 및 프론트엔드 프로토타입 완성.
* **2026-02-15 21:00**: [Critical Crisis] Gemini API 404 에러 및 JSON 파싱 오류 발생. 
* **2026-02-15 23:50**: 모델 버전 최적화(v1beta) 및 에러 핸들링 완료, 디버깅 성공. 
* **2026-02-16 09:00**: Vercel을 통한 최종 라이브 배포 및 트래킹 시작. 
---

## 🍃 SnF Ecosystem: The Restoration Journey
우리는 기술에 침탈당한 인간의 사유를 본래 주인에게 되돌려주는 **'인양(Restoration)'**의 여정을 설계합니다.

* **☁️ Sense Your Day**: 서양의 점성술과 동양의 사주명리학을 결합하여 오늘의 나를 온전히 감각하게 하는 정서적 안식처입니다.
* **🪞 Double-Mirror**: AI와의 동기화(Sync)와 인간적 이탈(Identity)을 동시 측정하여 자신의 존재가 서있는 위치를 증명합니다.
* **💎 Prism-Arcana**: 내면의 사유를 빛의 예술인 스테인드글라스로 형상화하여 소유 가능한 실물 자산으로 치환합니다.
* **🌳 Taste Tree**: 파편화된 개인의 취향을 가드닝하여 전지구적 공동체를 이루는 연결의 여정입니다.
* **🏰 Deep-Reso**: 밈과 유행어가 깊이를 대체하는 시대에 인간 고유의 사유 밀도를 보호하고 증명하는 최후의 요새입니다.

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
