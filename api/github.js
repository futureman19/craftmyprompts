export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, action, payload } = req.body;

  if (!token) return res.status(401).json({ error: 'Missing GitHub Token' });

  try {
    let endpoint = '';
    let body = {};

    if (action === 'create_repo') {
      // Create a new repository (user scope)
      endpoint = 'https://api.github.com/user/repos';
      body = {
        name: payload.name,
        description: payload.description,
        private: payload.private || false,
        auto_init: true // Creates a README so we can push files later if needed
      };
    }
    else if (action === 'create_gist') {
      // Create a gist
      endpoint = 'https://api.github.com/gists';
      body = {
        description: payload.description,
        public: !payload.private,
        files: payload.files // { "filename.js": { "content": "..." } }
      };
    }
    else {
      return res.status(400).json({ error: 'Invalid Action' });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'GitHub API Failed');
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("GitHub API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}