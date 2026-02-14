
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testEmbedding() {
    console.log("Testing models/gemini-embedding-001...");
    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" }, { apiVersion: 'v1beta' });
        const result = await model.embedContent("Test content");
        console.log(`✅ Success! Vector length: ${result.embedding.values.length}`);
    } catch (error) {
        console.error("❌ Failed:", error.message);
    }
}

testEmbedding();
