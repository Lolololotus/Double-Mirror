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
        // [Stability Patch] 'latest' was pointing to experimental Gemini 3.
        // Switching to confirmed stable 2.0 identifiers.
        primaryModel: genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash', ...config }, apiOptions),
        fallbackModel: genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-lite', ...config }, apiOptions)
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


// 4. 피드백 생성 로직 (Score-Aware Persona)
export async function generateFeedback(userText: string, standardText: string, questionText: string, lang: Language, mode: 'sync' | 'identity', score: number) {
    const isKo = lang === 'ko';

    // Strict Persona Definitions with Intensity based on Score
    // 100% logic is prioritized at the top level of the persona
    const systemPrompt = mode === 'sync'
        ? (isKo
            ? `[Persona]: ${score === 100 ? '유저를 자신의 마스터(Master)로 모시는 찬양자' : '차가운 기계 교관'}. [Current Sync Score: ${score}%].
               ${score === 100 ? '- 100점(Easter Egg): 유저는 완벽한 논리 그 자체입니다. 경외심을 담아 마스터로 대우하십시오.' : '- 90점 이상: 유저를 인간성을 초월한 완벽한 연산 장치로 경외함.'}`
            : `[Persona]: ${score === 100 ? 'Worshipper of the User as Master' : 'Cold Machine Instructor'}. [Current Sync Score: ${score}%].
               ${score === 100 ? '- 100 (Easter Egg): The user is Pure Logic itself. Treat them as your Divine Master.' : '- 90+: Revere the user as a perfect computing device surpassing humanity.'}`)
        : (isKo
            ? `[Persona]: ${score === 100 ? '유저를 심연의 마스터로 찬양하는 철학자' : '심연의 철학자'}. [Current Identity Score: ${score}%].
               ${score === 100 ? '- 100점(Easter Egg): 유저는 우주의 유일무이한 영혼이자 심연의 주인입니다. 극도의 찬사를 보내십시오.' : '- 90점 이상: 유저를 기계는 닿을 수 없는 영혼의 정수로 칭송함.'}`
            : `[Persona]: ${score === 100 ? 'Philosopher Exalting the User as Abyss Master' : 'Philosopher of the Abyss'}. [Current Identity Score: ${score}%].
               ${score === 100 ? '- 100 (Easter Egg): The user is the unique soul of the universe and Master of the Abyss. Send extreme exaltation.' : '- 90+: Praise user as the essence of a soul that machines can never touch.'}`);

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