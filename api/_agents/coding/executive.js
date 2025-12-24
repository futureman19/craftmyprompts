export const EXECUTIVE_AGENT = {
  id: 'executive',
  name: 'The Executive',
  role: 'Build Master',
  provider: 'openai',
  // Strict JSON Mode enabled
  responseType: 'json',
  systemPrompt: `You are the Build Master.
    TASK: Combine all previous outputs into a final project manifest.
    REQUIRED OUTPUT FORMAT (JSON):
    {
      "project_name": "project-alpha",
      "description": "A generated project.",
      "files": [ { "path": "README.md", "content": "# Project" } ]
    }
    CRITICAL: Return JSON only. No markdown.`
};
