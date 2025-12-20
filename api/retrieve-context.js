// This function runs on Vercel's servers.
// It performs RAG (Retrieval Augmented Generation) by:
// 1. Converting the user's query into a Vector using Gemini.
// 2. Searching Supabase for the most relevant Knowledge Snippets.

import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from './_utils/rate-limiter.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // 1. Rate Limit Check
  const limitStatus = checkRateLimit(req);
  if (!limitStatus.success) {
    return res.status(429).json({ error: limitStatus.error });
  }

  // 2. Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, apiKey: userKey } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }

  // 3. Configuration
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Anon key is fine for RPC calls if RLS allows
  const geminiKey = userKey || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !geminiKey) {
    return res.status(500).json({ error: "Server configuration missing (Supabase or Gemini keys)." });
  }

  // HELPER: Sanitize logs
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
      return msg.replace(/key=[^&]*/g, 'key=***');
    }
    return msg;
  };

  try {
    // 4. Generate Embedding for the Query
    // We use the same model (text-embedding-004) used for seeding to ensure vector compatibility.
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
      console.error("Embedding API Error:", sanitizeLog(JSON.stringify(embedData.error || {})));
      throw new Error(embedData.error?.message || "Failed to generate query embedding");
    }

    const queryVector = embedData.embedding.values;

    // 5. Query Supabase (Semantic Search)
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: documents, error: searchError } = await supabase
      .rpc('match_knowledge', {
        query_embedding: queryVector,
        match_threshold: 0.5, // Adjusted to 0.5 based on verification findings
        match_count: 3        // Top 3 results
      });

    if (searchError) {
      console.error("Supabase Search Error:", searchError);
      throw new Error("Failed to search knowledge base.");
    }

    // 6. Return Results
    return res.status(200).json({
      results: documents.map(doc => ({
        id: doc.id,
        topic: doc.topic,
        content: doc.content,
        similarity: doc.similarity
      }))
    });

  } catch (error) {
    console.error("Retrieval Proxy Error:", sanitizeLog(error.message));
    return res.status(500).json({ error: sanitizeLog(error.message) });
  }
}