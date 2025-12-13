// This function runs on Vercel's servers.
// It securely handles requests to Anthropic's Claude API.

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Parse the body
  const { apiKey: userKey, prompt, model } = req.body;

  // 3. Determine which Key to use
  // Priority: User's manual key -> Global Environment Variable
  const apiKey = userKey || process.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Anthropic API Key is missing on the server." });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01', // Required header for Claude
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: model || "claude-3-5-sonnet-20240620", // Default to Sonnet 3.5
        max_tokens: 1024,
        messages: [
            { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || `Anthropic API Error (${response.status})`);
    }

    // Anthropic returns data.content[0].text
    return res.status(200).json(data);

  } catch (error) {
    console.error("Anthropic Proxy Error:", error);
    return res.status(500).json({ error: error.message });
  }
}