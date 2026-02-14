
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Missing API Key");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testConfig(modelName: string, apiVersion: string) {
    console.log(`\n--- Testing: ${modelName} [${apiVersion}] ---`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });
        const result = await model.embedContent("Test string");
        console.log(`✅ SUCCESS! Vector length: ${result.embedding.values.length}`);
        return true;
    } catch (error: any) {
        console.log(`❌ FAILED: ${error.message.split('\n')[0]}`); // Log only first line of error
        return false;
    }
}

async function runTests() {
    const configs = [
        { name: 'models/text-embedding-004', version: 'v1' },
        { name: 'text-embedding-004', version: 'v1' },
        { name: 'models/text-embedding-004', version: 'v1beta' },
        { name: 'text-embedding-004', version: 'v1beta' },
        { name: 'embedding-001', version: 'v1' },
        { name: 'models/embedding-001', version: 'v1' },
        // Also test generation just in case
    ];

    console.log("Starting comprehensive API test...");

    for (const config of configs) {
        await testConfig(config.name, config.version);
    }
}

runTests();
