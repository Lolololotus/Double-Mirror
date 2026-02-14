
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

async function checkModel(version, modelName) {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    console.log(`Checking ${version} for ${modelName}...`);
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            const found = data.models.find(m => m.name === modelName || m.name === `models/${modelName}`);
            if (found) {
                console.log(`[${version}] ✅ FOUND: ${found.name}`);
            } else {
                console.log(`[${version}] ❌ NOT FOUND: ${modelName}`);
                // List similar
                const similar = data.models.filter(m => m.name.includes('embedding'));
                if (similar.length > 0) console.log(`   Alternatives: ${similar.map(m => m.name).join(', ')}`);
            }
        }
    } catch (error) {
        console.error(`[${version}] Error:`, error.message);
    }
}

async function run() {
    await checkModel('v1', 'embedding-001');
    await checkModel('v1beta', 'embedding-001');
    // Also check for gemini-2.0-flash exact name
    await checkModel('v1', 'gemini-2.0-flash');
    await checkModel('v1beta', 'gemini-2.0-flash');
}

run();
