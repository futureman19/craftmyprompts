const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Setup Environment
const rootDir = path.join(__dirname, '..');

function loadEnv(filename) {
    const filePath = path.join(rootDir, filename);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                if (!process.env[key]) process.env[key] = value;
            }
        });
    }
}

loadEnv('.env.local');

// 2. Setup Clients
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error("❌ Missing API Keys in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
    console.log(`\n🌱 Starting Knowledge Seed...`);

    // 3. Load Knowledge Data (Dynamic Import for ESM compatibility)
    // We import the ESM file from this CJS script.
    let KNOWLEDGE_BASE;
    try {
        // Attempt relative import. Node handles this in async import()
        const module = await import('../src/data/knowledgeBase.js');
        KNOWLEDGE_BASE = module.KNOWLEDGE_BASE;
    } catch (e) {
        console.error("❌ Failed to import knowledgeBase.js:", e);
        process.exit(1);
    }

    const entries = Object.entries(KNOWLEDGE_BASE);
    console.log(`Found ${entries.length} topics to process.\n`);

    for (const [topic, content] of entries) {
        // console.log to ensure output is visible immediately
        console.log(`Processing: ${topic.padEnd(30)}`);

        try {
            // A. Check if exists
            const { data: existing } = await supabase
                .from('knowledge_vectors')
                .select('id')
                .eq('topic', topic)
                .single();

            if (existing) {
                console.log(`   ⏭️  Skipped (Exists)`);
                continue;
            }

            // B. Generate Embedding
            let textToEmbed = content;
            if (typeof content !== 'string') {
                textToEmbed = `Rule: ${content.rule}\nMechanic: ${content.mechanic}\nPitfall: ${content.pitfall}`;
            }

            const embedRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "models/text-embedding-004",
                    content: { parts: [{ text: textToEmbed }] }
                })
            });

            if (!embedRes.ok) {
                const errData = await embedRes.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Status ${embedRes.status}`);
            }

            const embedData = await embedRes.json();
            const vector = embedData.embedding.values;

            // C. Save to DB
            const { error } = await supabase
                .from('knowledge_vectors')
                .insert({
                    topic: topic,
                    content: content,
                    embedding: vector
                });

            if (error) throw error;
            console.log(`   ✅  Saved`);

            // D. Rate Limit Pause
            await new Promise(r => setTimeout(r, 500));

        } catch (err) {
            console.error(`   ❌  Error: ${err.message}`);
        }
    }
    console.log("\n✨ Seeding Complete!");
}

seedDatabase();
