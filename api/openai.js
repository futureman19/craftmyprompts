// This file runs on Vercel's servers, not in the user's browser.
// It acts as a secure proxy to talk to OpenAI.

export default async function handler(req, res) {
  // 1. Check for POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Get the API Key
  // Priority: User's manual key (passed in body) -> Global Environment Variable
  const apiKey = req.body.apiKey || process.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API Key is missing on the server." });
  }

  // 3. Extract prompt from request
  const { prompt, model } = req.body;

  try {
    // 4. Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "OpenAI API Error");
    }

    // 5. Send result back to frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("OpenAI Proxy Error:", error);
    return res.status(500).json({ error: error.message });
  }
}