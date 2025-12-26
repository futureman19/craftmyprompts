import React, { useState } from 'react';
import { Github, Download, Check, Copy, ExternalLink, Terminal, Code2 } from 'lucide-react';

const DeploymentDeck = ({ projectData, githubToken, onSaveToken, onDeploy }) => {
    const [tokenInput, setTokenInput] = useState(githubToken || '');
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployUrl, setDeployUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleDeploy = async (type) => {
        setIsDeploying(true);
        setError(null);
        try {
            // Save token if changed
            if (tokenInput !== githubToken) {
                onSaveToken(tokenInput);
            }

            const result = await onDeploy(type, projectData);
            setDeployUrl(result.html_url);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDeploying(false);
        }
    };

    if (deployUrl) {
        return (
            <div className="p-8 bg-slate-900 border border-emerald-500/30 rounded-2xl text-center space-y-6 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Check size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Deployment Successful!</h2>
                    <p className="text-slate-400 text-sm">Your project has been pushed to GitHub.</p>
                </div>

                <a
                    href={deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all transform hover:scale-105"
                >
                    Open Repository <ExternalLink size={16} />
                </a>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <Terminal size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Final Build Ready</h3>
                        <p className="text-sm text-slate-500">
                            {projectData.files?.length || 0} files generated. Ready for export.
                        </p>
                    </div>
                </div>

                {/* Token Input */}
                {!githubToken && (
                    <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-800">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">GitHub Personal Access Token</label>
                        <input
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxx"
                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-purple-500 outline-none"
                        />
                        <p className="text-[10px] text-slate-500 mt-2">Required for creating repositories/gists. Stored locally.</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleDeploy('create_repo')}
                        disabled={isDeploying || !tokenInput}
                        className="p-4 bg-slate-900 border border-slate-700 hover:border-purple-500 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <Github size={24} className="text-slate-400 group-hover:text-white" />
                        <div className="text-center">
                            <div className="font-bold text-slate-200 group-hover:text-white">Create Repository</div>
                            <div className="text-xs text-slate-500">Full Project Source</div>
                        </div>
                    </button>

                    <button
                        onClick={() => handleDeploy('create_gist')}
                        disabled={isDeploying || !tokenInput}
                        className="p-4 bg-slate-900 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 rounded-xl flex flex-col items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <Code2 size={24} className="text-slate-400 group-hover:text-white" />
                        <div className="text-center">
                            <div className="font-bold text-slate-200 group-hover:text-white">Create Private Gist</div>
                            <div className="text-xs text-slate-500">Quick Snippet Share</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeploymentDeck;
