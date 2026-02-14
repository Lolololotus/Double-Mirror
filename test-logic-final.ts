
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runTest() {
    console.log("🚀 Starting Model Verification...");

    const { GoogleGenerativeAI } = await import('@google/generative-ai');

    // Testing Lite model for stability/quota
    const MODEL_NAME = 'models/gemini-2.0-flash-lite-preview-02-05'; // Guessing based on pattern? No, use exact from list.
    // List said: models/gemini-2.0-flash-lite-001
    const EXACT_MODEL_NAME = 'models/gemini-2.0-flash-lite-001';

    console.log(`\n🧪 Testing Model: ${EXACT_MODEL_NAME}`);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: EXACT_MODEL_NAME }, { apiVersion: 'v1beta' });

    try {
        const result = await model.generateContent("Hello.");
        console.log("✅ Model Response:", result.response.text());
        console.log("✨ Model is WORKING!");
    } catch (e: any) {
        console.error("❌ Model Test Failed:", e.message);
    }
}

runTest();
