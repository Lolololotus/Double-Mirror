
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

async function checkModel(version, modelName) {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    console.log(`Checking ${version}...`);
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            const found = data.models.find(m => m.name.includes(modelName));
            if (found) {
                console.log(`[${version}] ✅ FOUND: ${found.name}`);
                console.log(`           Supported generation methods: ${found.supportedGenerationMethods}`);
            } else {
                console.log(`[${version}] ❌ NOT FOUND: ${modelName}`);
            }
        } else {
            console.log(`[${version}] Error listing models: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        console.error(`[${version}] Fetch error:`, error.message);
    }
}

async function run() {
    await checkModel('v1', 'text-embedding-004');
    await checkModel('v1beta', 'text-embedding-004');
    await checkModel('v1', 'gemini-1.5-flash');
}

run();
