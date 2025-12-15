// This function runs on Vercel's servers.
// It acts as a secure proxy to the GitHub API.

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, action, payload } = req.body;

  // 2. Validate Inputs
  if (!token) {
    return res.status(401).json({ error: "GitHub Access Token is missing." });
  }

  // HELPER: Sanitize logs to remove sensitive tokens
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
        return msg.replace(/Authorization: token [^&]*/g, 'Authorization: token ***')
                  .replace(/"token":\s*"[^"]*"/g, '"token": "***"');
    }
    return msg;
  };

  try {
    let endpoint = '';
    let method = 'POST';
    let body = {};

    // 3. Route Actions
    switch (action) {
        case 'create_gist':
            endpoint = 'https://api.github.com/gists';
            body = {
                description: payload.description || "Created with CraftMyPrompt",
                public: payload.public !== false, // Default to public
                files: payload.files
            };
            break;
            
        case 'create_repo':
            endpoint = 'https://api.github.com/user/repos';
            body = {
                name: payload.name,
                description: payload.description || "Generated via CraftMyPrompt",
                private: payload.private || false,
                auto_init: true
            };
            break;

        default:
            return res.status(400).json({ error: "Invalid action specified." });
    }

    // 4. Call GitHub API
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data.message || `GitHub API Error (${response.status})`;
        console.error("GitHub Error Details:", sanitizeLog(JSON.stringify(data)));
        throw new Error(errorMsg);
    }

    // 5. Success
    return res.status(200).json(data);

  } catch (error) {
    console.error("GitHub Proxy Error:", sanitizeLog(error.message));
    return res.status(500).json({ error: sanitizeLog(error.message) });
  }
}