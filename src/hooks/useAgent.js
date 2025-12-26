import { useState, useEffect, useRef } from 'react';
import { COMPONENT_REGISTRY } from '../data/componentRegistry.jsx';

/**
 * useAgent Hook (Swarm Edition)
 * Connects the Chat Interface directly to the Central Swarm API.
 */
export const useAgent = (keys = {}, activeAgent = null, knowledge = {}) => {

    // 1. Determine Storage Key
    const agentId = activeAgent?.id || 'general_agent';
    const storageKey = `craft_agent_chat_${agentId}`;

    // 2. Initialize State
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useRef(false);

    // 3. Persist State
    useEffect(() => {
        if (isMounted.current) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } else {
            isMounted.current = true;
        }
    }, [messages, storageKey]);

    // 4. Reset on Switch
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        setMessages(saved ? JSON.parse(saved) : []);
    }, [storageKey]);

    // --- A2UI SCHEMA (Client-Side Rendering) ---
    const A2UI_SCHEMA_GUIDE = `
    [SYSTEM NOTE: CAPABILITY DETECTED]
    You can render UI components! Output a JSON block:
    \`\`\`json
    { "tool": "render_ui", "props": { ... } }
    \`\`\`
    Available: Container, Card, Text, Button, Image, Input, Table.
    `;

    // 5. Response Parser (Extracts UI JSON from Text)
    const parseResponse = (text) => {
        if (!text) return { type: 'text', content: '' };
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);

        if (match) {
            try {
                const payload = JSON.parse(match[1]);
                const toolDef = COMPONENT_REGISTRY[payload.tool] || COMPONENT_REGISTRY[payload.type]; // Fallback
                if (toolDef) {
                    return {
                        type: 'component',
                        component: toolDef.component,
                        props: { ...toolDef.defaultProps, ...payload.props },
                        rawText: text
                    };
                }
            } catch (e) { console.warn("UI Parse Error", e); }
        }
        return { type: 'text', content: text };
    };

    // 6. Message Handler (Connected to Swarm)
    const sendMessage = async (userText) => {
        if (!userText.trim()) return;

        // Optimistic Update
        const newUserMsg = { role: 'user', type: 'text', content: userText };
        setMessages(prev => [...prev, newUserMsg]);
        setIsLoading(true);

        try {
            // Build Context
            const historyContext = messages.map(m =>
                `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.rawText || m.content}`
            ).join('\n\n');

            // NEW: Build Knowledge Context from RAG
            const knowledgeContext = Object.entries(knowledge)
                .map(([k, v]) => `[KNOWLEDGE - ${k}]: ${JSON.stringify(v)}`)
                .join('\n');

            // CALL SWARM API
            const response = await fetch('/api/swarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userText,
                    // Map frontend ID to backend ID. Default to 'manager' if none selected.
                    targetAgentId: activeAgent?.id || 'manager',
                    // ADD THIS FLAG:
                    mode: 'chat',
                    // Pass A2UI guide + History + Knowledge as context
                    context: `
                    ${A2UI_SCHEMA_GUIDE}
                    
                    ### USER KNOWLEDGE BASE:
                    ${knowledgeContext || "No specific knowledge loaded."}

                    ### CHAT HISTORY:
                    ${historyContext}
                    `,
                    keys: keys,
                    category: 'general'
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Swarm Unreachable");
            }

            const data = await response.json();
            const aiText = data.swarm[0].content;

            // Parse and Add
            const parsed = parseResponse(aiText || '');
            setMessages(prev => [...prev, { role: 'assistant', ...parsed }]);

        } catch (error) {
            console.error("Agent Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                type: 'text',
                content: `Error: ${error.message || 'Connection failed'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        setMessages([]);
        localStorage.removeItem(storageKey);
    };

    return { messages, isLoading, sendMessage, clearHistory };
};