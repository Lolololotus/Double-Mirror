
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Missing API Key");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    console.log("Listing available models...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy model get
        // Actually the SDK doesn't have a direct 'listModels' method on the instance easily accessible in this version of SDK sometimes, 
        // but let's try to just hit the API or use a known working model to verify key.
        // Wait, I can't easily list models with this SDK version without a specific call. 
        // Let's try to just run a simple generation to confirm KEY is valid first.

        console.log("Testing generation with gemini-1.5-flash...");
        const result = await model.generateContent("Hello");
        console.log("GenAI Response:", result.response.text());

        // Now let's try embedding with a different path
        console.log("Testing embedding with 'text-embedding-004' (no models/ prefix)...");
        const embModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        await embModel.embedContent("test");
        console.log("Success with 'text-embedding-004'!");

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

listModels();
