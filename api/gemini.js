// This function runs on Vercel's servers.
// It securely handles requests to Google's Gemini API so keys aren't exposed in the browser.

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Parse the body
  // endpoint: 'generateContent' or 'listModels'
  const { apiKey: userKey, prompt, model, endpoint } = req.body;

  // 3. Determine which Key to use
  // Priority: User's manual key -> Global Environment Variable
  const apiKey = userKey || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API Key is missing on the server." });
  }

  try {
    // --- SCENARIO A: LIST MODELS ---
    if (endpoint === 'listModels') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch models");
      }
      return res.status(200).json(data);
    }

    // --- SCENARIO B: GENERATE CONTENT (Default) ---
    const targetModel = model || 'models/gemini-1.5-flash';
    // Ensure 'models/' prefix is present
    const modelPath = targetModel.startsWith('models/') ? targetModel : `models/${targetModel}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }] 
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `Gemini API Error (${response.status})`);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    return res.status(500).json({ error: error.message });
  }
}