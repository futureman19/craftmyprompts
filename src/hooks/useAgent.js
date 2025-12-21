import { useState, useEffect, useRef } from 'react';
import { COMPONENT_REGISTRY } from '../data/componentRegistry.jsx';

/**
 * useAgent Hook (Persistent Version)
 * Automatically saves/loads chat history based on the active agent's ID.
 */
export const useAgent = (keys = {}, activeAgent = null) => {
    // 1. Determine Storage Key
    const agentId = activeAgent?.id || 'general_agent';
    const storageKey = `craft_agent_chat_${agentId}`;

    // 2. Initialize State from Storage (Lazy Initializer)
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn("Failed to load chat history", e);
            return [];
        }
    });

    const [isLoading, setIsLoading] = useState(false);

    // Ref to track if we should save (prevents saving empty state over existing data on mount race conditions)
    const isMounted = useRef(false);

    // 3. Persist State on Change
    useEffect(() => {
        if (isMounted.current) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } else {
            isMounted.current = true;
        }
    }, [messages, storageKey]);

    // 4. Reset/Load when switching Agents
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            setMessages(JSON.parse(saved));
        } else {
            setMessages([]);
        }
    }, [storageKey]);

    // --- A2UI SCHEMA DEFINITION ---
    const A2UI_SCHEMA_GUIDE = `
    ### ATOMIC COMPONENT LIBRARY (For 'render_ui' tool)
    When using the "render_ui" tool, your 'content' prop must be a JSON object (or array of objects) following this structure:
    
    { "type": "ComponentType", "props": { ... }, "children": [ ... ] }

    AVAILABLE ATOMS:
    1. Container ({ layout: 'col' | 'row' })
    2. Card ({ title: 'String', variant: 'default' | 'outlined' | 'elevated' })
    3. Text ({ content: 'String', variant: 'h1' | 'h2' | 'body' | 'caption' })
    4. Button ({ label: 'String', variant: 'primary', actionId: 'id' })
    5. Image ({ src: 'url' })
    6. Input ({ label: 'String' })
    7. Table ({ headers: [], rows: [] })
    `;

    // 5. Dynamic System Prompt
    const toolList = Object.keys(COMPONENT_REGISTRY).map(key =>
        `- "${key}": ${COMPONENT_REGISTRY[key].description}`
    ).join('\n');

    const baseInstruction = `
You are CraftOS, an intelligent interface assistant.
You can render rich UI components to help the user by outputting a JSON block.

AVAILABLE TOOLS:
${toolList}

${A2UI_SCHEMA_GUIDE}

PROTOCOL:
1. To render a component, output a MARKDOWN CODE BLOCK containing a JSON object.
   \`\`\`json
   { "tool": "tool_name", "props": { ... } }
   \`\`\`
2. If the user asks for a UI, use 'render_ui'.
3. If the user asks for a website/app, use 'render_website'.
    `.trim();

    // 6. Response Parser
    const parseResponse = (text) => {
        if (!text) return { type: 'text', content: '' };
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);

        if (match) {
            try {
                const payload = JSON.parse(match[1]);
                const toolDef = COMPONENT_REGISTRY[payload.tool];
                if (toolDef) {
                    return {
                        type: 'component',
                        component: toolDef.component,
                        props: { ...toolDef.defaultProps, ...payload.props },
                        rawText: text
                    };
                }
            } catch (e) {
                console.warn("Failed to parse A2UI JSON:", e);
            }
        }
        return { type: 'text', content: text };
    };

    // 7. Message Handler
    const sendMessage = async (userText) => {
        if (!userText.trim()) return;

        // Optimistic Update
        const newUserMsg = { role: 'user', type: 'text', content: userText };
        setMessages(prev => [...prev, newUserMsg]);
        setIsLoading(true);

        try {
            // Context Builder
            const historyContext = messages.map(m =>
                `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.rawText || m.content}`
            ).join('\n\n');

            let personaPrompt = "";
            if (activeAgent) {
                personaPrompt = `
### ACTIVE PERSONA
NAME: ${activeAgent.name || "Custom Agent"}
ROLE: ${activeAgent.role || "Assistant"}
SYSTEM INSTRUCTION: ${activeAgent.systemPrompt || "You are a helpful AI assistant."}
                `.trim();
            }

            const finalPrompt = `${baseInstruction}\n\n${personaPrompt}\n\nPREVIOUS CHAT HISTORY:\n${historyContext}\n\nCURRENT QUERY:\nUser: ${userText}`;

            // Provider Logic
            const targetProvider = activeAgent?.provider || 'gemini';
            const targetModel = activeAgent?.model;
            const targetKey = keys[targetProvider];

            if (!targetKey) throw new Error(`Missing API Key for ${targetProvider}`);

            const response = await fetch(`/api/${targetProvider}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: targetKey,
                    prompt: finalPrompt,
                    model: targetModel
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch response');

            let aiText = '';
            if (targetProvider === 'gemini') aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            else if (targetProvider === 'openai') aiText = data.choices?.[0]?.message?.content;
            else if (targetProvider === 'anthropic') aiText = data.content?.[0]?.text;
            else if (targetProvider === 'groq') aiText = data.choices?.[0]?.message?.content;

            const parsed = parseResponse(aiText || '');

            // Save Assistant Message
            setMessages(prev => [...prev, { role: 'assistant', ...parsed }]);

        } catch (error) {
            console.error("Agent Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                type: 'text',
                content: `Error: ${error.message || 'Unknown error'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // 8. Clear History
    const clearHistory = () => {
        setMessages([]);
        localStorage.removeItem(storageKey);
    };

    return {
        messages,
        isLoading,
        sendMessage,
        clearHistory
    };
};