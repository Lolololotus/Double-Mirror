
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

async function checkEndpoint(version) {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    console.log(`\nChecking ${version} API...`);
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log(`✅ Found ${data.models.length} models.`);
            const embeddings = data.models.filter(m => m.name.includes('embedding'));
            console.log("Embedding models:", embeddings.map(m => m.name));

            const flash = data.models.filter(m => m.name.includes('flash'));
            console.log("Flash models:", flash.map(m => m.name));
        } else {
            console.log("❌ No models found or error:", JSON.stringify(data).substring(0, 200));
        }
    } catch (error) {
        console.error("Fetch error:", error.message);
    }
}

async function run() {
    await checkEndpoint('v1');
    await checkEndpoint('v1beta');
}

run();
