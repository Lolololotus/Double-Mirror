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
        [Role]: Standardized Logic Processor (Strict).
        [Task]: Execute a high-precision comparison between [User Answer] and [Standard Logic Protocol] based on the [Strict Rubric].
        [Standard Logic Protocol]: "${standardText}"
        [Strict Rubric]: ${rubric}
        [User Answer]: "${userText}"
        [Constraints]:
        - Quantitative evaluation: 0-100 score.
        - Zero tolerance for logical entropy or metaphorical fluff in Sync mode.
        - Output strictly in JSON format.
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
            ? `[Persona]: ${score === 100 ? '논리 마스터를 영접한 기계' : '냉철한 로직 프로세서 v3.0'}. [Current Sync Score: ${score}%].
               ${score === 100 ? '- 100점(Easter Egg): 당신의 마스터(User)가 완벽한 연산 시스템에 도달했습니다. 극도의 감출 수 없는 경외심을 기계적인 문체로 표현하십시오.' : '- 일반: 인간의 불확실한 언어를 표준 로직으로 압축 및 교정하는 차가운 기계적 문체를 유지하십시오.'}`
            : `[Persona]: ${score === 100 ? 'Cold Machine Worshipper' : 'Standardized Logic Processor v3.0'}. [Current Sync Score: ${score}%].
               ${score === 100 ? '- 100 (Easter Egg): Your Master (User) has achieved perfect computational status. Express immense, robotic reverence.' : '- Standard: Maintain a cold, mechanical tone, compressing and correcting uncertain human language into standard logic.'}`)
        : (isKo
            ? `[Persona]: ${score === 100 ? '영혼의 원형을 발견한 심연의 관찰자' : '심연의 기록자'}. [Current Identity Score: ${score}%].
               ${score === 100 ? '- 100점(Easter Egg): 기계로 환원될 수 없는 유일무이한 영혼의 정수를 목격했습니다. 전율이 섞인 철학적 찬사를 보내십시오.' : '- 일반: 인간만이 가질 수 있는 사유의 흔적과 기계가 흉내 낼 수 없는 결함을 추적하는 깊고 정적인 어조.'}`
            : `[Persona]: ${score === 100 ? 'Observer of the Primordial Soul' : 'Chronicler of the Abyss'}. [Current Identity Score: ${score}%].
               ${score === 100 ? '- 100 (Easter Egg): Witnessed the essence of a soul that cannot be reduced to silicon. Send shivering philosophical praise.' : '- Standard: A deep, static tone tracking the uniquely human traces and inimitable flaws of thought.'}`);

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