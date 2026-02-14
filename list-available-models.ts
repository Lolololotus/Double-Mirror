
import * as dotenv from 'dotenv';
import path from 'path';
import https from 'https';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                const output = json.models.map((m: any) =>
                    `- ${m.name} (${m.version}) [Methods: ${m.supportedGenerationMethods?.join(', ')}]`
                ).join('\n');
                fs.writeFileSync('models.txt', output);
                console.log("✅ Models written to models.txt");
            } else {
                console.error("❌ Error listing models:", json);
                fs.writeFileSync('models.txt', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error("❌ Error parsing response:", e);
            fs.writeFileSync('models.txt', "Error parsing: " + data);
        }
    });
}).on('error', (e) => {
    console.error("❌ Request Error:", e);
});
