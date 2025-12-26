import React, { useState, useEffect } from 'react';
import { Github, Download, Check, ExternalLink, Terminal, AlertCircle } from 'lucide-react';

const DeploymentDeck = ({ projectData, githubToken, onSaveToken, onDeploy }) => {
    // 1. SMART DEFAULT: Add timestamp to prevent "Repo already exists" errors
    const defaultName = projectData?.project_name
        ? `${projectData.project_name}-${Math.floor(Date.now() / 1000)}`
        : `hivemind-build-${Math.floor(Date.now() / 1000)}`;

    const [tokenInput, setTokenInput] = useState(githubToken || '');
    const [projectName, setProjectName] = useState(defaultName);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployUrl, setDeployUrl] = useState(null);
    const [error, setError] = useState(null);

    // Sync state if prop changes (optional, keeps it reactive)
    useEffect(() => {
        if (projectData?.project_name) {
            // Only update if the user hasn't typed a custom name yet (simple check)
            if (projectName.includes('hivemind-build-')) {
                setProjectName(`${projectData.project_name}-${Math.floor(Date.now() / 1000)}`);
            }
        }
    }, [projectData]);

    const handleDeploy = async (type) => {
        setIsDeploying(true);
        setError(null);
        try {
            // Save token if changed
            if (tokenInput !== githubToken) {
                onSaveToken(tokenInput);
            }

            // CRITICAL: OVERRIDE THE NAME
            // We create a new object so we don't mutate the prop
            const payload = {
                ...projectData,
                project_name: projectName // <--- This forces the user's input to be used
            };

            const result = await onDeploy(type, payload);
            setDeployUrl(result.html_url);
        } catch (err) {
            console.error("Deployment Error:", err);
            setError(err.message || "Deployment Failed");
        } finally {
            setIsDeploying(false);
        }
    };

    // Client-side Download
    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${projectName}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // --- VIEW: SUCCESS STATE (Non-blocking) ---
    if (deployUrl) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in">
                <div className="p-8 bg-slate-900 border border-emerald-500/30 rounded-2xl text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <Check size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Live on GitHub!</h2>
                        <p className="text-slate-400 text-sm">Repository created successfully.</p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <a
                            href={deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                        >
                            Open Repository <ExternalLink size={18} />
                        </a>
                    </div>

                    {/* "Go Back" / Reset Option */}
                    <button
                        onClick={() => setDeployUrl(null)}
                        className="text-xs text-slate-500 hover:text-white underline mt-4 block mx-auto"
                    >
                        Deploy to a different location
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW: CONFIGURATION STATE ---
    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-20 animate-in slide-in-from-bottom-4">

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl shadow-xl">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                        <Terminal size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Production Build</h3>
                        <p className="text-sm text-slate-500">
                            {projectData.files?.length || 0} files compiled and ready for export.
                        </p>
                    </div>
                </div>

                {/* ERROR BANNER */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-400 animate-in shake">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <strong className="font-bold block mb-1">Deployment Failed</strong>
                            {error}
                        </div>
                    </div>
                )}

                {/* --- CONFIG FORM --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    {/* 1. Project Name Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Repository Name
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="my-awesome-app"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-slate-600 font-mono"
                        />
                        <p className="text-[10px] text-slate-600">
                            Must be unique on GitHub.
                        </p>
                    </div>

                    {/* 2. Token Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            GitHub Token
                        </label>
                        <input
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder={githubToken ? "••••••••••••••••" : "ghp_..."}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-slate-600 font-mono"
                        />
                        <p className="text-[10px] text-slate-600">
                            Stored locally in your browser.
                        </p>
                    </div>
                </div>

                {/* --- ACTIONS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* BUTTON: GITHUB */}
                    <button
                        onClick={() => handleDeploy('create_repo')}
                        disabled={isDeploying || !tokenInput || !projectName.trim()}
                        className="p-4 bg-slate-900 border border-slate-700 hover:border-purple-500 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Github size={28} className="text-slate-400 group-hover:text-white mb-1 transition-colors" />
                        <div className="text-center relative z-10">
                            <div className="font-bold text-slate-200 group-hover:text-white">Create Repository</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Push to GitHub</div>
                        </div>
                    </button>

                    {/* BUTTON: DOWNLOAD */}
                    <button
                        onClick={handleDownload}
                        className="p-4 bg-slate-900 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-3 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Download size={28} className="text-slate-400 group-hover:text-white mb-1 transition-colors" />
                        <div className="text-center relative z-10">
                            <div className="font-bold text-slate-200 group-hover:text-white">Download JSON</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Save Local Package</div>
                        </div>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DeploymentDeck;
