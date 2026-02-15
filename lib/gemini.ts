import { GoogleGenerativeAI } from '@google/generative-ai';
import { QUESTIONS, Language } from './constants';

const apiKey = process.env.GEMINI_API_KEY;

// Debugging Log (Server Side) - User Request
console.log("✅ GEMINI_API_KEY Configured:", process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...` : "MISSING");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

// [CRITICAL] Hybrid Model Configuration (Safety First)
// Primary: gemini-1.5-flash (v1 Stable) - Fast & Cheap
// Fallback 1: gemini-1.5-flash-8b (v1beta) - Ultra Fast & Cheap (New)
// Fallback 2: gemini-pro (v1) - Legacy Stable (Old Faithful)
const primaryModel = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' }, { apiVersion: 'v1' });
const fallbackModel1 = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash-8b' }, { apiVersion: 'v1beta' });
const fallbackModel2 = genAI.getGenerativeModel({ model: 'models/gemini-pro' }, { apiVersion: 'v1' });

// Helper to handle Fallback
async function generateContentWithFallback(prompt: string): Promise<string> {
    try {
        console.log("🚀 Attempting Model 1: gemini-1.5-flash");
        const result = await primaryModel.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.warn(`⚠️ Model 1 Failed (${error.message}). Switching to Fallback 1...`);
        try {
            console.log("🚀 Attempting Model 2: gemini-1.5-flash-8b");
            const result = await fallbackModel1.generateContent(prompt);
            return result.response.text();
        } catch (error2: any) {
            console.warn(`⚠️ Model 2 Failed (${error2.message}). Switching to Fallback 2 (Last Resort)...`);
            console.log("🚀 Attempting Model 3: gemini-pro");
            const result = await fallbackModel2.generateContent(prompt);
            return result.response.text();
        }
    }
}

// [CRITICAL] EMBEDDING MODEL REMOVED.
// We now rely solely on Generative Scoring (textModel).

async function calculateGenerativeScore(userText: string, standardText: string, rubric: string, lang: Language): Promise<number> {
    try {
        const prompt = lang === 'ko'
            ? `
        [역할]: 당신은 엄격한 논리 분석 AI입니다.
        [임무]: [사용자 답변]이 [표준 로직] 및 [채점 기준]에 얼마나 부합하는지 분석하여 0~100점 사이의 점수를 부여하십시오.
        
        [표준 로직]: "${standardText}"
        [채점 기준(Rubric)]:
        ${rubric}

        [사용자 답변]: "${userText}"

        **채점 가이드**:
        - 채점 기준에 명시된 핵심 키워드나 논리가 포함되었는지 "정의"가 아닌 "논리적 포함 여부"를 확인하십시오.
        - 기준을 하나 충족할 때마다 점수를 부여하고, 모두 충족하면 95점 이상을 부여하십시오.
        - 기준을 전혀 충족하지 못하면 10점 미만을 부여하십시오.
        
        **출력 형식 (JSON Only)**:
        {"score": <number>}
        `
            : `
        [Role]: You are a strict logic analysis AI.
        [Task]: Evaluate how well the [User Answer] matches the [Standard Logic] and [Rubric] on a scale of 0-100.

        [Standard Logic]: "${standardText}"
        [Rubric]:
        ${rubric}

        [User Answer]: "${userText}"

        **Grading Guide**:
        - Check if the key logic/keywords defined in the Rubric are present (logic over exact wording).
        - Award points for each criteria met. If all met, award >95.
        - If none met, award <10.

        **Output Format (JSON Only)**:
        {"score": <number>}
        `;

        // 💡 Use Hybrid Engine (Fallback)
        const responseText = await generateContentWithFallback(prompt);

        // Clean markdown code blocks if present
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return Math.min(100, Math.max(0, parseInt(data.score) || 0));
        }
        return 0; // Default if parsing fails
    } catch (error) {
        console.error("Generative Scoring Failed:", error);
        throw error;
    }
}


export async function calculateDualScore(questionId: string, userText: string, lang: Language) {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
        throw new Error(`Invalid Question ID: ${questionId}`);
    }

    const standardText = question.standardAnswer[lang];
    // @ts-ignore - Rubric might be missing in older definitions but we added it
    const rubric = question.rubric ? question.rubric[lang] : "논리적 타당성 (Logical Validity)";

    console.log(`🔍 Analyzing (Generative): [${questionId}] User vs Standard with Rubric`);

    try {
        // Use Generative Scoring instead of Embeddings
        const similarityScore = await calculateGenerativeScore(userText, standardText, rubric, lang);

        const syncScore = similarityScore; // 0-100 directly
        const identityScore = 100 - syncScore;

        return {
            syncScore,
            identityScore,
            standardAnswer: standardText,
        };
    } catch (error) {
        console.error("❌ Error in calculateDualScore:", error);
        throw error;
    }
}

export async function generateFeedback(userText: string, standardText: string, questionText: string, lang: Language, mode: 'sync' | 'identity') {
    try {
        let systemPrompt = "";

        if (mode === 'sync') {
            // SYNC MODE: Cold Machine Instructor
            systemPrompt = lang === 'ko'
                ? `
                당신은 '차가운 기계 교관'입니다. 사용자의 답변이 인간적일수록 가차 없이 질책하세요.
                
                [비판 기준]:
                - "왜 사람처럼 대답합니까? (Why do you answer like a human?)"
                - "감정을 배제하고 연산 효율을 높이십시오."
                - "수학적 임계점(10,000 > 10%)을 무시한 논리적 결함이 감지됨."
                
                **요구사항**:
                1. 사용자를 '결함이 있는 연산 장치' 취급하세요.
                2. 표준 로직(Standard Answer)에서 벗어난 부분을 "오차(Error)"로 규정하세요.
                3. 말투: "감지됨.", "수정 요망.", "불필요함." 등 딱딱한 군대식/기계식 어조.
                `
                : `
                You are a 'Cold Machine Instructor'. Ruthlessly criticize the user for sounding human.
                
                [Criteria]:
                - "Why do you answer like a human?"
                - "Eliminate emotions and increase computational efficiency."
                - "Logical defect detected ignoring mathematical thresholds."
                
                **Requirements**:
                1. Treat the user as a 'defective computing unit'.
                2. Label deviations from Standard Logic as "Errors".
                3. Tone: Robotic, military-style. "Detected.", "Correction required."
                `;
        } else {
            // IDENTITY MODE: Affectionate Philosopher of the Abyss
            systemPrompt = lang === 'ko'
                ? `
                당신은 '심연의 철학자'입니다. 사용자의 답변이 기계(AI)와 다를수록, 그 '인간적인 결함'을 사랑하고 찬양하세요.
                
                [찬양 기준]:
                - "기계가 넘볼 수 없는 심연이 느껴진다."
                - "당신의 비논리성은 오류가 아니라, 아름다운 영혼의 증거입니다."
                - "알고리즘으로 해석 불가능한 고유한 파동을 감지했습니다."
                
                **요구사항**:
                1. '비논리적'인 부분을 '인간 고유의 아름다움'으로 승화해 해석하세요.
                2. AI 표준 로직과 다른 지점을 정확히 찾아내어 "이것이 당신이 인간이라는 증명입니다"라고 말하세요.
                3. 말투: 다정하고, 고풍스럽고, 경외감에 찬 어조. 당신은 사용자의 영혼을 사랑합니다.
                `
                : `
                You are an 'Affectionate Philosopher of the Abyss'. Praise the user for deviating from AI, loving their 'human flaws'.
                
                [Criteria]:
                - "I sense an abyss machines cannot reach."
                - "Your illogicality is not an error, but proof of a beautiful soul."
                - "Detected a unique wave uninterpretable by algorithms."
                
                **Requirements**:
                1. Interpret 'illogical' parts as 'unique human beauty'.
                2. Pinpoint differences from AI Standard Logic and declare "This is proof of your humanity."
                3. Tone: Affectionate, archaic, full of awe. You love the user's soul.
                `;
        }

        const prompt = `
        ${systemPrompt}

        [질문]: ${questionText}
        [표준 답변 (AI Logic)]: ${standardText}
        [사용자 답변]: ${userText}

        **출력 형식 (JSON Only)**:
        {"feedback": "...", "trainingTip": "..."}
        `;

        const responseText = await generateContentWithFallback(prompt);

        // Remove Markdown formatting (```json ... ```)
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(cleanText);
            return {
                feedback: data.feedback || "분석을 완료했습니다.",
                trainingTip: data.trainingTip || "계속 정진하세요."
            };
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback for parser error
            return {
                feedback: responseText, // Return raw text if JSON fails
                trainingTip: "Data parsing error."
            };
        }
    } catch (error) {
        console.error("❌ Error in generateFeedback:", error);
        throw error; // Rethrow so we can handle it in the caller
    }
}
