import { useState } from 'react';
import { COMPONENT_REGISTRY } from '../data/componentRegistry.jsx';

export const useAgent = (apiKey, provider = 'gemini') => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Dynamic System Prompt
    // This tells the AI what tools it has access to based on the Registry.
    const toolList = Object.keys(COMPONENT_REGISTRY).map(key => 
        `- "${key}": ${COMPONENT_REGISTRY[key].description}`
    ).join('\n');

    const systemInstruction = `
You are CraftOS, an intelligent interface assistant.
You can render UI components to help the user.
AVAILABLE TOOLS:
${toolList}

RULES:
1. If the user asks for a specific tool or functionality listed above, reply ONLY with the tool tag.
2. Format: [TOOL: tool_name]
3. Example: If user asks "Show me trending topics", reply: [TOOL: show_trends]
4. Do not provide extra text when invoking a tool. Just the tag.
5. If no tool matches, reply with helpful text as normal.
    `.trim();

    // 2. Response Parser
    // Detects if the AI wants to render a component
    const parseResponse = (text) => {
        if (!text) return { type: 'text', content: '' };

        const toolRegex = /\[TOOL:\s*(.*?)\]/;
        const match = text.match(toolRegex);

        if (match) {
            const toolName = match[1].trim();
            const toolDef = COMPONENT_REGISTRY[toolName];
            
            if (toolDef) {
                return {
                    type: 'component',
                    component: toolDef.component,
                    props: toolDef.defaultProps,
                    rawText: text // Keep original just in case
                };
            }
        }

        // Default to standard text response
        return {
            type: 'text',
            content: text
        };
    };

    // 3. Message Handler
    const sendMessage = async (userText) => {
        if (!userText.trim()) return;

        setIsLoading(true);
        
        // Optimistically add user message
        const newHistory = [...messages, { role: 'user', type: 'text', content: userText }];
        setMessages(newHistory);

        try {
            // Combine System Instruction + User Prompt
            const finalPrompt = `${systemInstruction}\n\nUser Query: ${userText}`;

            const response = await fetch(`/api/${provider}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    apiKey, 
                    prompt: finalPrompt,
                    // Default generic models for chat
                    // CTO FIX: Explicitly set Gemini model to 'gemini-1.5-flash-latest' to resolve version errors
                    model: provider === 'openai' ? 'gpt-4o' : (provider === 'gemini' ? 'gemini-1.5-flash-latest' : undefined) 
                })
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Failed to fetch response');

            // Extract text based on provider
            let aiText = '';
            if (provider === 'gemini') aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            else if (provider === 'openai') aiText = data.choices?.[0]?.message?.content;
            else if (provider === 'anthropic') aiText = data.content?.[0]?.text;
            else if (provider === 'groq') aiText = data.choices?.[0]?.message?.content;
            else aiText = "Response format not recognized.";

            // Parse and Add AI Response
            const parsed = parseResponse(aiText || '');

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                ...parsed 
            }]);

        } catch (error) {
            console.error("Agent Error:", error);
            // CTO UPDATE: Detailed error logging for debugging
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                type: 'text', 
                content: `I'm having trouble connecting to the brain. Error: ${error.message || 'Unknown error'}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        sendMessage,
        clearHistory: () => setMessages([])
    };
};