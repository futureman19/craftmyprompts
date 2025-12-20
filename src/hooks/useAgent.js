import { useState } from 'react';
import { COMPONENT_REGISTRY } from '../data/componentRegistry.jsx';

export const useAgent = (apiKey, provider = 'gemini', modelOverride) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- A2UI SCHEMA DEFINITION ---
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
    7. Table
       - props: { headers: ['Col1', 'Col2'], rows: [['Row1Data1', 'Row1Data2'], ['Row2Data1', 'Row2Data2']] }
       - Note: 'rows' is an array of arrays matching the header count.
    8. Select
       - props: { label: 'String', name: 'field_name', options: ['Option 1', 'Option 2'], value: 'default_val' }

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
5. If the user asks to build a "website", "landing page", or "web app", use the 'render_website' tool. Pass the raw HTML/React code string into the 'content' prop.
6. If you receive a [USER_ACTION: action_id] message, it means the user clicked a button in your UI. Respond accordingly.
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

    // 3. Message Handler (RAG Enabled)
    const sendMessage = async (userText) => {
        if (!userText.trim()) return;

        // INTERCEPT USER ACTIONS (e.g. Blueprint Approval)
        if (userText.startsWith('[USER_ACTION:')) {
            if (userText.includes('approve_blueprint')) {
                // The user approved the blueprint. Now we trigger the deployment.
                // In a real app, we'd bundle the files. Here, we'll ship the Blueprint itself as a manifest.
                const payloadMatch = userText.match(/\{.*\}/);
                const payload = payloadMatch ? JSON.parse(payloadMatch[0]) : {};

                const newMsg = {
                    role: 'assistant',
                    type: 'component',
                    component: COMPONENT_REGISTRY['github_ship'].component,
                    props: {
                        filename: 'project_manifest.json',
                        code: JSON.stringify(payload.structure, null, 2), // Ship the structure
                        isOpen: true
                    },
                    rawText: "Blueprint Approved. Initializing Build..."
                };

                // Add the user action to history (so we see "Approve")
                setMessages(prev => [...prev, { role: 'user', type: 'text', content: "✅ Blueprint Approved" }, newMsg]);
                return;
            }
        }

        // SLASH COMMAND INTERCEPTION
        if (userText.startsWith('/')) {
            const [command, ...args] = userText.substring(1).split(' ');
            const query = args.join(' ');
            const newLocalHistory = [...messages, { role: 'user', type: 'text', content: userText }];
            setMessages(newLocalHistory);

            let syntheticResponse = null;

            switch (command.toLowerCase()) {
                case 'image':
                    // Async operation required - handle differently than instant mock
                    syntheticResponse = null; // Don't return immediate synthetic response

                    // Trigger async fetch
                    setIsLoading(true);
                    try {
                        const imgRes = await fetch('/api/generate-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt: query, apiKey })
                        });
                        const imgData = await imgRes.json();

                        if (!imgRes.ok) throw new Error(imgData.error || 'Image generation failed');

                        const newMsg = {
                            role: 'assistant',
                            type: 'component',
                            component: COMPONENT_REGISTRY['render_ui'].component, // We render a Generic UI Card
                            props: {
                                content: {
                                    type: "Card",
                                    props: { variant: "elevated" },
                                    children: [
                                        { type: "Image", props: { src: imgData.imageUrl, alt: query, aspectRatio: "square" } },
                                        { type: "Text", props: { content: `Source: ${imgData.source === 'gemini' ? 'Gemini 2.5 Flash' : 'Pexels (Fallback)'}`, variant: "caption" } }
                                    ]
                                }
                            },
                            rawText: `Generated image for: ${query}`
                        };
                        setMessages(prev => [...prev, newMsg]);
                    } catch (e) {
                        setMessages(prev => [...prev, {
                            role: 'assistant',
                            type: 'text',
                            content: `Failed to generate image: ${e.message}`
                        }]);
                    } finally {
                        setIsLoading(false);
                    }
                    return; // Return early since we handled state manually
                case 'trend':
                    // Map common aliases to YouTube Category IDs
                    const YOUTUBE_CATEGORIES = {
                        'all': '0',
                        'music': '10',
                        'gaming': '20',
                        'tech': '28',
                        'coding': '28',
                        'news': '25',
                        'movies': '30',
                        'education': '27',
                        'entertainment': '24'
                    };

                    const catId = YOUTUBE_CATEGORIES[query.toLowerCase()] || '0';
                    syntheticResponse = null;

                    setIsLoading(true);
                    try {
                        const trendRes = await fetch('/api/trends', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ categoryId: catId, region: 'US' })
                        });

                        const trendData = await trendRes.json();
                        if (!trendRes.ok) throw new Error(trendData.error || 'Failed to fetch trends');

                        // Format for A2UI Table
                        const tableRows = (trendData.trends || []).slice(0, 5).map((t, i) => [
                            `#${i + 1}`,
                            t.title.length > 30 ? t.title.substring(0, 30) + '...' : t.title,
                            new Intl.NumberFormat('en-US', { notation: "compact" }).format(t.views || 0),
                            t.channelTitle || 'Unknown'
                        ]);

                        const newMsg = {
                            role: 'assistant',
                            type: 'component',
                            component: COMPONENT_REGISTRY['render_ui'].component,
                            props: {
                                content: {
                                    type: "Container",
                                    props: { layout: "col" },
                                    children: [
                                        {
                                            type: "Card",
                                            props: { title: `Trending in ${query || 'General'}`, variant: "elevated" },
                                            children: [
                                                {
                                                    type: "Table",
                                                    props: {
                                                        headers: ['Rank', 'Title', 'Views', 'Channel'],
                                                        rows: tableRows
                                                    }
                                                },
                                                {
                                                    type: "Button",
                                                    props: { label: "Analyze These Trends", Icon: "sparkles", variant: "secondary", actionId: "analyze_trends", payload: { trends: trendData.trends } }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            rawText: `Showing trends for: ${query}`
                        };
                        setMessages(prev => [...prev, newMsg]);
                    } catch (e) {
                        setMessages(prev => [...prev, {
                            role: 'assistant',
                            type: 'text',
                            content: `Failed to fetch trends: ${e.message}`
                        }]);
                    } finally {
                        setIsLoading(false);
                    }
                    return;
                case 'ship':
                    // PHASE 4.5: BLUEPRINT FIRST ARCHITECTURE
                    // 1. We don't ship code immediately.
                    // 2. We ask the Architect (AI) to generate a "Project Manifest" (JSON File Tree).

                    setIsLoading(true);

                    // A. Construct a specialized prompt for the Architect
                    const blueprintPrompt = `
Analyze the conversation history and the current project context.
Create a recommended FILE STRUCTURE (File Tree) for this application.
Return ONLY a valid JSON object representing the file tree.
Format:
{
  "structure": [
    { "path": "src/App.jsx", "type": "file" },
    { "path": "src/components", "type": "directory" },
    ...
  ]
}
DO NOT return markdown. Return RAW JSON.`;

                    try {
                        // B. Call the AI Model (Architect)
                        const archRes = await fetch(`/api/${provider}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                apiKey,
                                prompt: blueprintPrompt,
                                model: 'claude-3-5-sonnet-20241022' // Force a smart model for architecture
                            })
                        });

                        const archData = await archRes.json();
                        let archText = '';

                        // Normalize provider response
                        if (provider === 'gemini') archText = archData.candidates?.[0]?.content?.parts?.[0]?.text;
                        else if (provider === 'openai') archText = archData.choices?.[0]?.message?.content;
                        else if (provider === 'anthropic') archText = archData.content?.[0]?.text;
                        else if (provider === 'groq') archText = archData.choices?.[0]?.message?.content;

                        // C. Parse the JSON
                        // Helper to extract JSON from potential markdown wrappers
                        const jsonMatch = archText.match(/\{[\s\S]*\}/);
                        const cleanJson = jsonMatch ? jsonMatch[0] : archText;
                        const blueprintData = JSON.parse(cleanJson);

                        // D. Present the Blueprint
                        syntheticResponse = {
                            type: 'component',
                            component: COMPONENT_REGISTRY['project_blueprint'].component,
                            props: {
                                structure: blueprintData.structure || []
                            },
                            rawText: "Project Blueprint Generated"
                        };

                    } catch (e) {
                        syntheticResponse = {
                            type: 'text',
                            content: `**Architect Error:** Failed to generate blueprint.\n${e.message}`
                        };
                    } finally {
                        setIsLoading(false);
                    }
                    break;
                case 'help':
                default:
                    syntheticResponse = {
                        type: 'text',
                        content: `**Available Slash Commands:**\n- \`/image [query]\` - Generate visuals\n- \`/trend [topic]\` - See market trends\n- \`/ship [code]\` - Create GitHub Gist\n- \`/help\` - Show this menu`
                    };
                    break;
            }

            // Simulate slight delay for "feel"
            setIsLoading(true);
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', ...syntheticResponse }]);
                setIsLoading(false);
            }, 300);
            return;
        }

        setIsLoading(true);
        const newLocalHistory = [...messages, { role: 'user', type: 'text', content: userText }];
        setMessages(newLocalHistory);

        try {
            // STEP A: RETRIEVAL (RAG)
            // Ask our vector DB for relevant knowledge before answering
            let retrievedContext = "";
            try {
                const contextResponse = await fetch('/api/retrieve-context', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: userText,
                        apiKey // Pass key for embedding generation
                    })
                });

                if (contextResponse.ok) {
                    const contextData = await contextResponse.json();
                    if (contextData.results && contextData.results.length > 0) {
                        const snippets = contextData.results.map(r => `[Source: ${r.topic}]\n${r.content}`).join('\n\n');
                        retrievedContext = `\n\n### RELEVANT KNOWLEDGE (RAG):\nUse this expert context to answer the user if relevant:\n${snippets}\n`;
                    }
                }
            } catch (err) {
                console.warn("RAG Retrieval Failed (Non-critical):", err);
                // We continue without context if RAG fails
            }

            // STEP B: BUILD PROMPT
            const historyContext = messages.map(m =>
                `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.rawText || m.content}`
            ).join('\n\n');

            const finalPrompt = `${systemInstruction}\n\nPREVIOUS CHAT HISTORY:\n${historyContext}${retrievedContext}\n\nCURRENT QUERY:\nUser: ${userText}`;

            // STEP C: GENERATION
            let selectedModel = modelOverride;
            if (!selectedModel) {
                // CTO UPDATE: Using Gemini 2.0 Flash Lite Preview (fastest/cheapest for UI gen)
                selectedModel = provider === 'openai' ? 'gpt-4o' : (provider === 'gemini' ? 'gemini-2.0-flash-lite-preview-02-05' : undefined);
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