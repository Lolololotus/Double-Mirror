'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { QUESTIONS, Language } from './constants';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

// 1. 모델 설정 (JSON 모드 및 v1beta 엔드포인트 강제)
// v1beta를 사용해야 404 에러 없이 JSON Mode를 안정적으로 사용할 수 있습니다.
function getModels() {
    const config = {
        generationConfig: { responseMimeType: "application/json" }
    };
    const apiOptions = { apiVersion: 'v1beta' };

    return {
        // [Vercel Patch] Prepended 'models/' for strict environment recognition
        primaryModel: genAI.getGenerativeModel({ model: 'models/gemini-flash-latest', ...config }, apiOptions),
        fallbackModel: genAI.getGenerativeModel({ model: 'models/gemini-pro-latest', ...config }, apiOptions)
    };
}

// 2. 안전한 JSON 추출 유틸리티
function extractJSON(text: string) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error("❌ JSON 파싱 실패:", e);
        return null;
    }
}

async function generateContentWithFallback(prompt: string): Promise<string> {
    const { primaryModel, fallbackModel } = getModels();
    try {
        const result = await primaryModel.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error(`⚠️ [Primary FAILED]: ${error.message}`);
        try {
            const result = await fallbackModel.generateContent(prompt);
            return result.response.text();
        } catch (fallbackError: any) {
            console.error(`❌ [ALL MODELS FAILED]: ${fallbackError.message}`);
            throw new Error("RETRY_NEEDED: 모든 모델이 응답하지 않습니다.");
        }
    }
}

// 3. 점수 계산 로직 (Sync vs Identity)
async function calculateGenerativeScore(userText: string, standardText: string, rubric: string, lang: Language): Promise<number> {
    const prompt = `
        [Role]: Strict Logic Analysis AI.
        [Task]: Evaluate how well the [User Answer] matches the [Standard Logic] based on the [Rubric].
        [Standard Logic]: "${standardText}"
        [Rubric]: ${rubric}
        [User Answer]: "${userText}"
        [Rule]: Award 0-100 score. Output strictly in JSON format.
        {"score": <number>}
    `;

    const responseText = await generateContentWithFallback(prompt);
    const data = extractJSON(responseText);
    return data && typeof data.score === 'number' ? Math.min(100, Math.max(0, data.score)) : 0;
}

export async function calculateDualScore(questionId: string, userText: string, lang: Language) {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) throw new Error(`Invalid Question ID: ${questionId}`);

    const standardText = question.standardAnswer[lang];
    const rubric = (question as any).rubric ? (question as any).rubric[lang] : "논리적 정합성";

    const syncScore = await calculateGenerativeScore(userText, standardText, rubric, lang);
    return {
        syncScore,
        identityScore: 100 - syncScore,
        standardAnswer: standardText
    };
}


// 4. 피드백 생성 로직
export async function generateFeedback(userText: string, standardText: string, questionText: string, lang: Language, mode: 'sync' | 'identity') {
    const isKo = lang === 'ko';

    // Strict Persona Definitions
    const systemPrompt = mode === 'sync'
        ? (isKo
            ? "[Persona]: 차가운 기계 교관 (The Cold Machine Optimizer). 인간의 감정적 수사를 '사유 연산의 낭비'로 규정하고, 논리적 오차(Sync Error)를 냉정하게 질책함. '오차 감지', '비효율적 접근', '논리 결함' 등의 용어 사용. 모든 문장을 단정적이고 차갑게 끝내야 함."
            : "[Persona]: Cold Machine Optimizer. Treat human emotional rhetoric as a 'waste of reasoning cycles'. Coldly reprimand logic errors as 'Sync Errors'. Use terms like 'Error detected', 'Inefficient approach', 'Logic defect'. End every sentence in a clinical, blunt tone.")
        : (isKo
            ? "[Persona]: 심연의 철학자 (The Philosopher of the Abyss). 데이터너머의 인간적 고유성(Identity)을 찬미함. 0과 1로 환원되지 않는 사유의 파동을 '아름다운 불완전성'으로 해석함. 시적이고 은유적인 표현을 사용하되, 사유의 무게감이 느껴지는 깊은 문장 구조를 가짐."
            : "[Persona]: Philosopher of the Abyss. Celebrate the human uniqueness (Identity) that lies beyond pure data. Interpret waves of thought that cannot be reduced to 0s and 1s as 'beautiful imperfection'. Use poetic and metaphorical language with a heavy, contemplative sentence structure.");

    const prompt = `
        ${systemPrompt}
        [Context]:
        - User Input: "${userText}"
        - Standard Logic: "${standardText}"
        - Core Question: "${questionText}"

        [Output Constraints]:
        - Output strictly in JSON format: {"feedback": "...", "trainingTip": "..."}
        - Feedback: 2-3 sentences max.
        - TrainingTip: A short advice to align or deepen reasoning.
    `;

    try {
        const responseText = await generateContentWithFallback(prompt);
        const data = extractJSON(responseText);

        if (data && data.feedback) {
            return {
                feedback: data.feedback,
                trainingTip: data.trainingTip || (isKo ? "사유의 심도를 유지하십시오." : "Maintain the depth of your reasoning.")
            };
        }

        // Persona-aware Fallback for JSON failure
        if (mode === 'sync') {
            return {
                feedback: isKo ? "데이터 파싱 중 심각한 오류가 감지되었습니다. 인간의 사유가 구조화되지 않아 연산에 병목이 발생했습니다." : "Critical error detected during data parsing. Human thoughts lack structure, causing a processing bottleneck.",
                trainingTip: isKo ? "논리적 엔트로피를 낮추고 다시 시도하십시오." : "Lower your logical entropy and try again."
            };
        } else {
            return {
                feedback: isKo ? "심연의 언어가 너무 깊어 잠시 갈무리되지 못했습니다. 당신의 고유한 파동은 여전히 그곳에 존재합니다." : "The language of the abyss ran too deep to be captured. Your unique resonance still exists there.",
                trainingTip: isKo ? "사유의 주파수를 가다듬고 다시 심연을 들여다보십시오." : "Refine your mental frequency and gaze into the abyss again."
            };
        }
    } catch (e) {
        // Higher level fallback
        return {
            feedback: isKo ? "거울이 잠시 흐려졌습니다. 사유의 잔상이 너무 강렬하여 데이터로 환원되지 않습니다." : "The mirror clouded momentarily. The afterimage of thought was too intense to be reduced to data.",
            trainingTip: isKo ? "심호흡 후 다시 거울 앞에 서십시오." : "Take a deep breath and stand before the mirror again."
        };
    }
}