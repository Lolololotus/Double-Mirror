
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runTest() {
    console.log("🚀 Starting Model Verification (Generic Gemini Pro)...");

    // Dynamic import
    const { calculateDualScore } = await import('./lib/gemini');

    const qId = 'routine';
    const userAns = "Test answer about routine.";

    try {
        const scores = await calculateDualScore(qId, userAns, 'ko');
        console.log("✅ Score Result:", scores);
        console.log("✨ Model is WORKING! (gemini-pro classic)");
    } catch (e: any) {
        console.error("❌ Model Test Failed:", e.message);
    }
}

runTest();
