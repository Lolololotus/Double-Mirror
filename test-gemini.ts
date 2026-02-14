
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const embeddingModel = genAI.getGenerativeModel({ model: 'models/text-embedding-004' }, { apiVersion: 'v1' });

async function testEmbedding() {
    console.log("Testing Embedding with 'models/text-embedding-004' (v1)...");
    try {
        const text = "Test embedding string";
        const result = await embeddingModel.embedContent(text);
        console.log("✅ Embedding Success! Vector length:", result.embedding.values.length);
    } catch (error: any) {
        console.error("❌ Embedding Failed:", error.message);
        if (error.response) {
            console.error("Response:", JSON.stringify(error.response, null, 2));
        }
    }
}

testEmbedding();
