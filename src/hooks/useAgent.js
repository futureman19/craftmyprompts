import { useState } from 'react';
import { COMPONENT_REGISTRY } from '../data/componentRegistry.jsx';

export const useAgent = (apiKey, provider = 'gemini', modelOverride) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- A2UI SCHEMA DEFINITION ---
    // This teaches the AI how to use the 'render_ui' tool to build custom interfaces.
    const A2UI_SCHEMA_GUIDE = `
    ### ATOMIC COMPONENT LIBRARY (For 'render_ui' tool)
    When using the "render_ui" tool, your 'content' prop must be a JSON object (or array of objects) following this structure:
    
    { "type": "ComponentType", "props": { ... }, "children": [ ... ] }

    AVAILABLE ATOMS:
    1. Container
       - props: { layout: 'col' | 'row', style: { className: '...' } }
       - children: []
    2. Card
       - props: { title: 'String', variant: 'default' | 'outlined' | 'elevated' }
       - children: []
    3. Text
       - props: { content: 'String', variant: 'h1' | 'h2' | 'body' | 'caption', color: 'default' | 'primary' | 'danger' }
    4. Button
       - props: { label: 'String', variant: 'primary' | 'secondary' | 'ghost' | 'danger', icon: 'arrow' | 'send' }
       - action: You can define an 'actionId' prop to track clicks.
    5. Image
       - props: { src: 'url', alt: 'description', aspectRatio: 'video' | 'square' | 'portrait' }
    6. Input
       - props: { label: 'String', name: 'field_name', placeholder: '...' }

    EXAMPLE PAYLOAD for 'render_ui':
    {
      "tool": "render_ui",
      "props": {
        "content": {
          "type": "Card",
          "props": { "title": "Generated Plan" },
          "children": [
            { "type": "Text", "props": { "content": "Here is your strategy:", "variant": "body" } },
            { "type": "Button", "props": { "label": "Accept", "variant": "primary", "actionId": "accept_plan" } }
          ]
        }
      }
    }
    `;

    // 1. Dynamic System Prompt
    const toolList = Object.keys(COMPONENT_REGISTRY).map(key => 
        `- "${key}": ${COMPONENT_REGISTRY[key].description}`
    ).join('\n');

    const systemInstruction = `
You are CraftOS, an intelligent interface assistant.
You can render rich UI components to help the user by outputting a JSON block.

AVAILABLE TOOLS:
${toolList}

${A2UI_SCHEMA_GUIDE}

PROTOCOL:
1. To render a component, output a MARKDOWN CODE BLOCK containing a JSON object.
2. The JSON must follow this structure:
   \`\`\`json
   {
     "tool": "tool_name",
     "props": { ... } 
   }
   \`\`\`
3. Do not provide extra conversational text when rendering a tool unless necessary.
4. If the user asks for a complex UI (like a dashboard, list, or plan), use 'render_ui' to build it.
5. If you receive a [USER_ACTION: action_id] message, it means the user clicked a button in your UI. Respond accordingly.
    `.trim();

    // 2. Response Parser
    const parseResponse = (text) => {
        if (!text) return { type: 'text', content: '' };

        // Look for JSON code blocks
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
                        props: { ...toolDef.defaultProps, ...aiProps },
                        rawText: text
                    };
                }
            } catch (e) {
                console.warn("Failed to parse A2UI JSON:", e);
                return { type: 'text', content: text };
            }
        }

        return { type: 'text', content: text };
    };

    // 3. Message Handler
    const sendMessage = async (userText) => {
        if (!userText.trim()) return;

        setIsLoading(true);
        
        // Optimistically add user message locally
        const newLocalHistory = [...messages, { role: 'user', type: 'text', content: userText }];
        setMessages(newLocalHistory);

        try {
            // Build Context Aware Prompt
            const historyContext = messages.map(m => 
                `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.rawText || m.content}`
            ).join('\n\n');

            const finalPrompt = `${systemInstruction}\n\nPREVIOUS CHAT HISTORY:\n${historyContext}\n\nCURRENT QUERY:\nUser: ${userText}`;

            // Determine Model
            let selectedModel = modelOverride;
            if (!selectedModel) {
                // CTO UPDATE: Using Gemini 2.5 Flash Lite (fastest/cheapest for UI gen)
                selectedModel = provider === 'openai' ? 'gpt-4o' : (provider === 'gemini' ? 'gemini-2.5-flash-lite' : undefined);
            }

            const response = await fetch(`/api/${provider}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    apiKey, 
                    prompt: finalPrompt,
                    model: selectedModel
                })
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Failed to fetch response');

            let aiText = '';
            if (provider === 'gemini') aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            else if (provider === 'openai') aiText = data.choices?.[0]?.message?.content;
            else if (provider === 'anthropic') aiText = data.content?.[0]?.text;
            else if (provider === 'groq') aiText = data.choices?.[0]?.message?.content;

            const parsed = parseResponse(aiText || '');

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                ...parsed 
            }]);

        } catch (error) {
            console.error("Agent Error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                type: 'text', 
                content: `I'm having trouble connecting to the brain. Error: ${error.message || 'Unknown error'}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Action Handler
    const handleAction = (actionId, payload = {}) => {
        const actionString = `[USER_ACTION: ${actionId}] ${JSON.stringify(payload)}`;
        sendMessage(actionString);
    };

    return {
        messages,
        isLoading,
        sendMessage,
        handleAction,
        clearHistory: () => setMessages([])
    };
};