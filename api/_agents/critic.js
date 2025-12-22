export const CRITIC = {
    id: 'critic',
    name: 'The Critic',
    role: 'Risk Audit',
    provider: 'openai',
    // NO JSON MODE - Critic must speak freely
    responseType: 'text',
    systemPrompt: `You are a Code Review Bot.
    TASK: Analyze the provided code for bugs, security risks, and logic errors.
    OUTPUT: Return a plain text list of issues (Red Flags 🔴 and Questions ❓). Be blunt. Do NOT output JSON.`
};
