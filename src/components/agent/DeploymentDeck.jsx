import React, { useState } from 'react';
import { Package, Github, Download, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { generateProjectZip } from '../../utils/artifactEngine.js';

const DeploymentDeck = ({ projectData, githubToken, onSaveToken, onDeploy }) => {
    const [deployStatus, setDeployStatus] = useState('idle');
    const [deployUrl, setDeployUrl] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [tokenInput, setTokenInput] = useState('');
    const [isZipping, setIsZipping] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleAction = async (actionType) => {
        // --- 1. LOCAL ZIP DOWNLOAD (REAL ENGINE) ---
        if (actionType === 'zip') {
            setIsZipping(true);
            try {
                // Check if engine exists
                if (typeof generateProjectZip !== 'function') {
                    throw new Error("Artifact Engine not found. Check imports.");
                }
                await generateProjectZip(projectData);
            } catch (e) {
                console.error("Zip Error:", e);
                alert("Zip Failed: " + e.message);
            } finally {
                setIsZipping(false);
            }
            return;
        }

        // --- 2. GITHUB DEPLOYMENT ---
        setDeployStatus('deploying');
        setErrorMsg('');

        try {
            const result = await onDeploy(actionType, projectData);
            setDeployUrl(result.html_url);
            setDeployStatus('success');
        } catch (e) {
            setDeployStatus('error');
            setErrorMsg(e.message);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-10 animate-in zoom-in-95">
            <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />

                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 border border-emerald-500/20">
                    <Package size={32} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{projectData.project_name || "Build Complete"}</h2>
                <p className="text-slate-400 mb-8">{projectData.description || "Ready for deployment."}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ZIP BUTTON */}
                    <button
                        onClick={() => handleAction('zip')}
                        disabled={isZipping}
                        className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-3 transition-all group disabled:opacity-50"
                    >
                        {isZipping ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" /> : <Download size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />}
                        <span className="font-bold text-slate-200">{isZipping ? "Compressing..." : "Download .ZIP"}</span>
                    </button>

                    {/* GITHUB SECTION */}
                    {!githubToken ? (
                        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-3">
                            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-bold">
                                <Github size={16} /> Connect GitHub
                            </div>
                            <input
                                type="password"
                                placeholder="Paste Personal Access Token"
                                className="w-full bg-black/50 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                value={tokenInput}
                                onChange={(e) => setTokenInput(e.target.value)}
                            />
                            <button
                                onClick={() => onSaveToken(tokenInput)}
                                disabled={!tokenInput}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded disabled:opacity-50"
                            >
                                Save Token
                            </button>
                            <div className="border-t border-slate-800 pt-2 mt-1">
                                <button onClick={() => setShowHelp(!showHelp)} className="text-[10px] text-slate-500 hover:text-emerald-400 flex items-center justify-center gap-1 w-full">
                                    <AlertTriangle size={10} /> What is this?
                                </button>
                                {showHelp && (
                                    <div className="mt-2 text-[10px] text-slate-400 text-left bg-slate-900 p-2 rounded">
                                        <p>Generate a Classic Token with <b>repo</b> & <b>gist</b> scopes.</p>
                                        <a href="https://github.com/settings/tokens/new?scopes=repo,gist&description=CraftMyPrompt+Hivemind" target="_blank" rel="noreferrer" className="block w-full text-center mt-2 bg-slate-800 text-white py-1 rounded hover:bg-slate-700">Generate Token</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => handleAction('create_gist')}
                                disabled={deployStatus === 'deploying'}
                                className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-3 transition-all group"
                            >
                                <Github size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-slate-200">Create Private Gist</span>
                            </button>
                            <button
                                onClick={() => handleAction('create_repo')}
                                disabled={deployStatus === 'deploying'}
                                className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-3 transition-all group"
                            >
                                <Github size={20} className="text-white group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-slate-200">Create Repository</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* STATUS & ERROR DISPLAY */}
                {deployStatus === 'error' && (
                    <div className="mt-6 text-xs text-rose-400 bg-rose-500/10 p-3 rounded border border-rose-500/20">
                        <AlertTriangle className="inline-block mr-2" size={14} />
                        Deployment Failed: {errorMsg}
                    </div>
                )}
                {deployStatus === 'success' && (
                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-in slide-in-from-bottom-2">
                        <div className="text-emerald-400 font-bold mb-2 flex items-center justify-center gap-2">
                            <CheckCircle size={16} /> Deployed Successfully!
                        </div>
                        <a href={deployUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-bold">
                            View on GitHub <ExternalLink size={12} />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeploymentDeck;
