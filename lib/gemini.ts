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
        // [TIP] User's key confirms 'gemini-flash-latest' and 'gemini-pro-latest' are optimal.
        primaryModel: genAI.getGenerativeModel({ model: 'gemini-flash-latest', ...config }, apiOptions),
        fallbackModel: genAI.getGenerativeModel({ model: 'gemini-pro-latest', ...config }, apiOptions)
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
    const systemPrompt = mode === 'sync'
        ? (isKo ? "당신은 차가운 기계 교관입니다. 인간적 감정을 질책하고 논리 오차를 'Error'로 규정하세요." : "You are a Cold Machine Instructor. Criticize human emotions as 'Errors'.")
        : (isKo ? "당신은 심연의 철학자입니다. AI와 다른 인간적 불완전성을 '고유한 영혼'으로 찬양하세요." : "You are a Philosopher of the Abyss. Praise human imperfection as a 'Unique Soul'.");

    const prompt = `
        ${systemPrompt}
        [Question]: ${questionText}
        [Standard]: ${standardText}
        [User]: ${userText}
        [Output Format]: JSON ONLY
        {"feedback": "...", "trainingTip": "..."}
    `;

    const responseText = await generateContentWithFallback(prompt);
    const data = extractJSON(responseText);

    return {
        feedback: data?.feedback || responseText.substring(0, 200),
        trainingTip: data?.trainingTip || "분석 완료."
    };
}