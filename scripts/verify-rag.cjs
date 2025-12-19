const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Helper to load env files manually since we might not have dotenv
function loadEnv(filename) {
    const filePath = path.join(rootDir, filename);
    if (fs.existsSync(filePath)) {
        console.log(`Loading ${filename}...`);
        const content = fs.readFileSync(filePath, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

loadEnv('.env');
loadEnv('.env.local');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

console.log("Configuration Check:");
console.log("- Supabase URL:", supabaseUrl ? "OK" : "MISSING");
console.log("- Supabase Key:", supabaseKey ? "OK" : "MISSING");
console.log("- Gemini Key:", geminiKey ? "OK" : "MISSING");

if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error("\n❌ Missing configuration.");
    console.error("Since your keys are on Vercel, you need to copy them to a local .env.local file for this script to work.");
    console.error("Please create .env.local in the root directory with:");
    console.error("VITE_SUPABASE_URL=...");
    console.error("VITE_SUPABASE_ANON_KEY=...");
    console.error("VITE_GEMINI_API_KEY=...");
    process.exit(1);
}

async function testRAG(query) {
    console.log(`\n🧪 Testing RAG with query: "${query}"`);

    try {
        // 1. Generate Embedding
        console.log("   ➤ Generating embedding via Google Gemini...");
        const embedResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: {
                    parts: [{ text: query }]
                }
            })
        });

        const embedData = await embedResponse.json();

        if (!embedResponse.ok) {
            throw new Error(`Embedding failed: ${embedData.error?.message || JSON.stringify(embedData)}`);
        }

        const vector = embedData.embedding.values;
        console.log(`   ✅ Embedding generated (Dimension: ${vector.length})`);

        // 2. Query Supabase
        console.log("   ➤ Querying Supabase `match_knowledge` RPC...");
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase.rpc('match_knowledge', {
            query_embedding: vector,
            match_threshold: 0.0, // Force matches
            match_count: 3
        });

        if (error) {
            throw error;
        }

        console.log(`   ✅ Query successful. Found ${data.length} results.`);

        if (data.length > 0) {
            console.log("\n   📝 Top Result:");
            console.log(`      topic: ${data[0].topic}`);
            console.log(`      similarity: ${data[0].similarity}`);
            console.log(`      content (snippet): ${data[0].content.substring(0, 100)}...`);
        } else {
            console.warn("   ⚠️ No matches found. Is the database seeded?");
        }

    } catch (err) {
        console.error("   ❌ Error:", err.message);
        console.error(err);
    }
}

// Run the test
testRAG("Tell me about React components");
