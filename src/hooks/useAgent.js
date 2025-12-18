import { useState } from 'react';
import { COMPONENT_REGISTRY } from '../data/componentRegistry.jsx';

export const useAgent = (apiKey, provider = 'gemini') => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Dynamic System Prompt (A2UI Protocol)
    // We instruct the AI to "speak" in JSON when it wants to render UI.
    const toolList = Object.keys(COMPONENT_REGISTRY).map(key => 
        `- "${key}": ${COMPONENT_REGISTRY[key].description}`
    ).join('\n');

    const systemInstruction = `
You are CraftOS, an intelligent interface assistant.
You can render rich UI components to help the user by outputting a JSON block.

AVAILABLE TOOLS (UI COMPONENTS):
${toolList}

PROTOCOL:
1. To render a component, output a MARKDOWN CODE BLOCK containing a JSON object.
2. The JSON must follow this schema:
   \`\`\`json
   {
     "tool": "tool_name_from_list",
     "props": { "key": "value" } // Optional properties to configure the component
   }
   \`\`\`
3. Example: If user asks "Search for cyberpunk images", reply with:
   \`\`\`json
   { "tool": "visual_search", "props": { "initialQuery": "cyberpunk" } }
   \`\`\`
4. Do not provide extra conversational text when rendering a tool unless necessary.
    `.trim();

    // 2. Response Parser (A2UI Renderer Logic)
    // Scans the response for JSON blocks and resolves them to Components.
    const parseResponse = (text) => {
        if (!text) return { type: 'text', content: '' };

        // Look for JSON code blocks: ```json { ... } ```
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);

        if (match) {
            try {
                const payload = JSON.parse(match[1]);
                const toolName = payload.tool;
                const aiProps = payload.props || {};

                const toolDef = COMPONENT_REGISTRY[toolName];
                
                if (toolDef) {
                    return {
                        type: 'component',
                        component: toolDef.component,
                        // Merge default props with AI-generated props
                        props: { ...toolDef.defaultProps, ...aiProps },
                        rawText: text
                    };
                }
            } catch (e) {
                console.warn("Failed to parse A2UI JSON:", e);
                // Fallback to text if JSON is broken
                return { type: 'text', content: text };
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