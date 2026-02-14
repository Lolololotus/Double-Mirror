
import * as dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verify() {
    const key = process.env.GEMINI_API_KEY;
    console.log("🔑 Checking Key:", key ? `${key.substring(0, 10)}...` : "MISSING");

    if (!key) {
        console.error("❌ Key is missing in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    // Use gemini-pro-latest as it is the only one responding reliably (with backoff)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-pro-latest' }, { apiVersion: 'v1beta' });

    try {
        console.log("📡 Sending test request to gemini-pro-latest...");
        const result = await model.generateContent("Test");
        console.log("✅ API Success!", result.response.text());
    } catch (e: any) {
        console.error("❌ API Failed:");
        console.error(`   Message: ${e.message}`);
        console.error(`   Full Error:`, JSON.stringify(e, null, 2));
    }
}

verify();
