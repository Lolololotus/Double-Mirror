'use server';

import { calculateDualScore, generateFeedback } from '@/lib/gemini';
import { QUESTIONS, Language } from '@/lib/constants';

// Future Data Schema for Training Mode
export interface TrainingSession {
    id: string;
    userId: string;
    questionId: string;
    userText: string;
    syncScore: number;
    identityScore: number;
    timestamp: Date;
    metadata: {
        mode: 'test' | 'training';
        duration: number;
        platform: 'web';
    };
}

// TODO: Implement DB storage for premium users
export async function saveTrainingLog(session: TrainingSession) {
    console.log('Mock saving session:', session);
    // await db.trainingSessions.create({ data: session });
}

// Helper for Retry Logic (Increased retries for stability)
async function withRetry<T>(operation: () => Promise<T>, retries = 2, delay = 3000): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries > 0 && (error.message.includes('429') || error.message.includes('503') || error.message.includes('UsageLimit'))) {
            console.log(`⚠️ API Error (${error.message}). Retrying in ${delay}ms... (Retries left: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(operation, retries - 1, delay * 1.5); // Exponential backoffish
        }
        throw error;
    }
}

export async function analyzeReflection(formData: FormData) {
    const text = formData.get('text') as string;
    const questionId = formData.get('questionId') as string;
    const lang = (formData.get('lang') as Language) || 'ko';
    const mode = (formData.get('mode') as 'sync' | 'identity') || 'sync';

    const currentQuestion = QUESTIONS.find(q => q.id === questionId);
    if (!text || !questionId || !currentQuestion) {
        throw new Error('Missing input or invalid question');
    }

    try {
        // Calculate scores with Retry
        let syncScore = 0;
        let identityScore = 0;
        let feedback = "";
        let trainingTip = "";
        const standardAnswer = currentQuestion.standardAnswer[lang];

        // 1. Calculate Scores (Critical) -> Wrapped in Retry
        const scoreResult = await withRetry(() => calculateDualScore(questionId, text, lang));
        syncScore = scoreResult.syncScore;
        identityScore = scoreResult.identityScore;

        // 2. Generate Feedback (Optional) -> Wrapped in Retry
        const feedbackResult = await withRetry(() => generateFeedback(text, standardAnswer, currentQuestion.text[lang], lang, mode));
        feedback = feedbackResult.feedback;
        trainingTip = feedbackResult.trainingTip;

        // Return combined result
        return {
            syncScore,
            identityScore,
            standardAnswer,
            feedback,
            trainingTip
        };
    } catch (error: any) {
        console.error('❌ Analysis failed in Server Action:', error);
        // Provide user-friendly message for Retry status
        if (error.message.includes('429')) {
            throw new Error(`시스템이 사유를 인양하기 위해 심호흡 중입니다. (Rate Limit). 잠시 후 다시 시도해주세요.`);
        }
        if (error.message.includes('404')) {
            throw new Error(`모델을 찾을 수 없습니다. (404). 관리자에게 문의하세요.`);
        }
        throw new Error(`Analysis failed logic: ${error.message}`);
    }
}
