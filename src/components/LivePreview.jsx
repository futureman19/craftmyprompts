import React, { useState, useEffect } from 'react';
import { Maximize2, X, Code, Eye, RefreshCw } from 'lucide-react';

const LivePreview = ({ 
    content,       // The raw code string (HTML/JSX)
    title = "Live Preview",
    isChatMode = false, // If true, optimizes styling for chat bubbles
    onClose 
}) => {
    const [view, setView] = useState('preview'); // 'preview' | 'code'
    const [isExpanded, setIsExpanded] = useState(false);
    const [key, setKey] = useState(0); // To force re-render/reload of iframe

    // --- PARSER LOGIC ---
    const extractCode = (typeRegex) => {
        if (!content) return null;
        // Match code blocks like ```html ... ```
        const regex = new RegExp(`\`\`\`(${typeRegex})([\\s\\S]*?)\`\`\``, 'i');
        const match = content.match(regex);
        return match ? match[2] : null;
    };

    // 1. Detect Content Type
    let html = extractCode('html');
    let css = extractCode('css');
    let js = extractCode('js|javascript');
    let jsx = extractCode('jsx|react|tsx');
    
    // If no markdown fences, assume the whole content is the code (fallback)
    if (!html && !jsx && !js) {
        if (content.trim().startsWith('<')) html = content;
        else if (content.includes('import React')) jsx = content;
    }

    // 2. Prepare Runtime
    let scriptType = 'text/javascript';
    let processedScript = js || '';
    let isReact = false;

    if (!html && (jsx || (js && (js.includes('import React') || js.includes('export default') || js.includes('return <'))))) {
        isReact = true;
        scriptType = 'text/babel';
        let reactCode = jsx || js;

        // Clean imports for browser runtime
        reactCode = reactCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');

        // Find Component Name
        let componentName = 'App';
        const exportMatch = reactCode.match(/export\s+default\s+(?:function\s+)?(\w+)/);
        if (exportMatch) {
            componentName = exportMatch[1];
            reactCode = reactCode.replace(/export\s+default\s+(?:function\s+)?/, 'function ');
        } else {
             // Fallback: assume first capitalized function is component
             const firstComp = reactCode.match(/function\s+([A-Z]\w+)/);
             if (firstComp) componentName = firstComp[1];
        }

        // Wrap in Error Boundary Mount
        processedScript = `
            ${reactCode}
            try {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                if (typeof ${componentName} !== 'undefined') {
                    root.render(React.createElement(${componentName}));
                } else {
                    document.body.innerHTML = '<div style="color:red;padding:20px;">Could not find component "${componentName}" to render.</div>';
                }
            } catch (e) {
                document.body.innerHTML = '<div style="color:red;padding:20px;">Runtime Error: ' + e.message + '</div>';
            }
        `;
    }

    // 3. Construct HTML Document
    const srcDoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <script src="https://cdn.tailwindcss.com"></script>
                <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                <style>
                    body { font-family: sans-serif; padding: 0; margin: 0; background: #fff; }
                    ${css || ''}
                </style>
            </head>
            <body>
                <div id="root">
                    ${html || (isReact ? '' : '<div style="display:flex;height:100vh;align-items:center;justify-content:center;color:#ccc;">No renderable content found</div>')}
                </div>
                <script type="${scriptType}" data-presets="react">
                    ${processedScript}
                </script>
            </body>
        </html>
    `;

    // --- RENDER HELPERS ---
    const Container = ({ children }) => {
        if (isExpanded) {
            return (
                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full h-full max-w-6xl rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
                        {children}
                    </div>
                </div>
            );
        }
        return (
            <div className={`w-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm ${isChatMode ? 'rounded-xl mt-2' : 'rounded-lg h-full'}`}>
                {children}
            </div>
        );
    };

    return (
        <Container>
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setKey(k => k + 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title="Reload">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={() => setView(v => v === 'code' ? 'preview' : 'code')} className={`p-1 rounded text-slate-500 hover:text-indigo-500 ${view === 'code' ? 'bg-indigo-50 text-indigo-600' : ''}`} title="Toggle Code">
                        {view === 'code' ? <Eye size={14} /> : <Code size={14} />}
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title={isExpanded ? "Minimize" : "Maximize"}>
                        {isExpanded ? <X size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className={`${isExpanded ? 'h-full' : 'h-64'} bg-slate-100 dark:bg-slate-900 relative`}>
                {view === 'preview' ? (
                    <iframe 
                        key={key}
                        title="Preview"
                        srcDoc={srcDoc}
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts allow-modals allow-same-origin"
                    />
                ) : (
                    <pre className="w-full h-full p-4 overflow-auto text-xs font-mono text-slate-300 bg-[#1e1e1e]">
                        {content}
                    </pre>
                )}
            </div>
        </Container>
    );
};

export default LivePreview;