
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

async function listAllModels(version) {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    console.log(`\n--- Listing ${version} Models ---`);
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log(`Found ${data.models.length} models:`);
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("Error or no models:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("Fetch error:", error.message);
    }
}

async function run() {
    await listAllModels('v1beta');
    await listAllModels('v1');
}

run();
