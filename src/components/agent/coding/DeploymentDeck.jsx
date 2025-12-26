import React, { useState, useEffect } from 'react';
import { Github, Download, Check, ExternalLink, Terminal, AlertCircle } from 'lucide-react';

const DeploymentDeck = ({ projectData, githubToken, onSaveToken, onDeploy }) => {

    // --- LOGIC: SMART DEFAULT ---
    // 1. If Agent gave a name, use it + timestamp.
    // 2. If no name, use 'hivemind-build' + timestamp.
    // This ensures the "Default" is always unique.
    const defaultName = projectData?.project_name
        ? `${projectData.project_name}-${Math.floor(Date.now() / 1000)}`
        : `hivemind-build-${Math.floor(Date.now() / 1000)}`;

    const [tokenInput, setTokenInput] = useState(githubToken || '');
    const [projectName, setProjectName] = useState(defaultName); // <--- User edits this
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployUrl, setDeployUrl] = useState(null);
    const [error, setError] = useState(null);

    // Sync state if prop changes (but don't overwrite if user is typing)
    useEffect(() => {
        if (projectData?.project_name) {
            // Only update if the current name is still the generic default
            if (projectName.includes('hivemind-build-')) {
                setProjectName(`${projectData.project_name}-${Math.floor(Date.now() / 1000)}`);
            }
        }
    }, [projectData]);

    const handleDeploy = async (type) => {
        if (!projectName.trim()) {
            setError("Please enter a repository name.");
            return;
        }

        setIsDeploying(true);
        setError(null);

        try {
            // 1. Save Token Logic
            if (tokenInput !== githubToken) {
                onSaveToken(tokenInput);
            }

            // 2. CRITICAL FIX: USE THE INPUT VALUE
            // We take the existing project data...
            // ...but we FORCE the 'project_name' to match the Input Box.
            const payload = {
                ...projectData,
                project_name: projectName
            };

            // 3. Send to Hook (passing token explicitly to avoid React state delay)
            const result = await onDeploy(type, payload, tokenInput);
            setDeployUrl(result.html_url);

        } catch (err) {
            console.error("Deployment Error:", err);
            setError(err.message || "Deployment Failed");
        } finally {
            setIsDeploying(false);
        }
    };

    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${projectName}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    if (deployUrl) {
        return (
            <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in">
                <div className="p-8 bg-slate-900 border border-emerald-500/30 rounded-2xl text-center space-y-6 shadow-2xl">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                        <Check size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Live on GitHub!</h2>
                        <p className="text-slate-400 text-sm">Repository created successfully.</p>
                    </div>
                    <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg">
                        Open Repository <ExternalLink size={18} />
                    </a>
                    <button onClick={() => setDeployUrl(null)} className="text-xs text-slate-500 hover:text-white underline mt-4 block mx-auto">
                        Deploy again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 pb-20 animate-in slide-in-from-bottom-4">
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl shadow-xl">

                <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20"><Terminal size={28} /></div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Production Build</h3>
                        <p className="text-sm text-slate-500">{projectData.files?.length || 0} files compiled.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-400 animate-in shake">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <div className="text-sm"><strong className="font-bold block mb-1">Deployment Failed</strong>{error}</div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repository Name</label>
                        {/* THIS INPUT CONTROLS THE NAME */}
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:border-purple-500 outline-none font-mono"
                        />
                        <p className="text-[10px] text-slate-600">Must be unique on GitHub.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GitHub Token</label>
                        <input
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder={githubToken ? "••••••••••••••••" : "ghp_..."}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:border-purple-500 outline-none font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => handleDeploy('create_repo')} disabled={isDeploying || !tokenInput || !projectName.trim()} className="p-4 bg-slate-900 border border-slate-700 hover:border-purple-500 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                        <Github size={28} className="text-slate-400 group-hover:text-white mb-1" />
                        <span className="font-bold text-slate-200 group-hover:text-white">Create Repository</span>
                    </button>
                    <button onClick={handleDownload} className="p-4 bg-slate-900 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-3 transition-all group">
                        <Download size={28} className="text-slate-400 group-hover:text-white mb-1" />
                        <span className="font-bold text-slate-200 group-hover:text-white">Download JSON</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeploymentDeck;
