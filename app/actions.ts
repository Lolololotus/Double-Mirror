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

// Helper for Retry Logic (Removed to prevent Vercel Timeout)
// We now Fail Fast and let Client handle retries.

export async function analyzeReflection(formData: FormData) {
    const text = formData.get('text') as string;
    const questionId = formData.get('questionId') as string;
    const lang = (formData.get('lang') as Language) || 'ko';
    const mode = (formData.get('mode') as 'sync' | 'identity') || 'sync';

    const currentQuestion = QUESTIONS.find(q => q.id === questionId);
    if (!text || !questionId || !currentQuestion) {
        throw new Error('FATAL: Missing input or invalid question');
    }

    try {
        // Calculate scores (No internal retry)
        let syncScore = 0;
        let identityScore = 0;
        let feedback = "";
        let trainingTip = "";
        const standardAnswer = currentQuestion.standardAnswer[lang];

        // 1. Calculate Score first to inform the feedback persona
        const scoreResult = await calculateDualScore(questionId, text, lang);
        syncScore = scoreResult.syncScore;
        identityScore = scoreResult.identityScore;

        // 2. Generate persona-aware feedback based on the score
        const relevantScore = mode === 'sync' ? syncScore : identityScore;
        const feedbackResult = await generateFeedback(text, standardAnswer, currentQuestion.text[lang], lang, mode, relevantScore);

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
        // [PRODUCTION LOG] Detailed Error Tracing
        console.error('❌ Analysis failed in Server Action:', {
            message: error.message,
            status: error.status,
            code: error.code,
            details: error.details
        });

        // Error Classification for Client
        const msg = error.message || '';

        if (msg.includes('429') || msg.includes('503') || msg.includes('UsageLimit') || msg.includes('Overloaded')) {
            throw new Error(`RETRY_NEEDED: ${msg}`);
        }

        if (msg.includes('404')) {
            throw new Error(`FATAL: Model not found (404).`);
        }

        throw new Error(`FATAL: ${msg}`);
    }
}
