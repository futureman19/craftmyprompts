import React, { useState, useEffect } from 'react';
import { RefreshCw, Save, Trash2, Copy, Check, Terminal, FileText, Bookmark, Play, Lock, Code, Zap, BookOpen, Plus, Github } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { formatTimestamp } from '../utils/index.js';
import GitHubModal from '../components/GitHubModal.jsx';
import KnowledgeSeeder from '../components/KnowledgeSeeder.jsx'; // 1. Import Seeder

const SavedView = ({ user, loadPrompt, showToast }) => {
  const [activeTab, setActiveTab] = useState('prompts'); 
  const [prompts, setPrompts] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [presets, setPresets] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  
  // GitHub Ship State
  const [showGithub, setShowGithub] = useState(false);
  const [codeToShip, setCodeToShip] = useState('');
  
  // Knowledge Form State
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);
  const [newKnowledgeTitle, setNewKnowledgeTitle] = useState('');
  const [newKnowledgeContent, setNewKnowledgeContent] = useState('');

  // --- FETCH DATA (SUPABASE) ---
  const fetchData = async () => {
    if (!user || user.uid === 'demo') {
        setLoading(false);
        return;
    }
    setLoading(true);

    try {
        // 1. Prompts
        const { data: promptsData } = await supabase
            .from('prompts')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });
        if (promptsData) setPrompts(promptsData);

        // 2. Snippets
        const { data: snippetsData } = await supabase
            .from('snippets')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });
        if (snippetsData) setSnippets(snippetsData);

        // 3. Presets
        const { data: presetsData } = await supabase
            .from('presets')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });
        if (presetsData) setPresets(presetsData);

        // 4. Knowledge
        const { data: knowledgeData } = await supabase
            .from('knowledge')
            .select('*')
            .eq('user_id', user.uid)
            .order('created_at', { ascending: false });
        if (knowledgeData) setKnowledge(knowledgeData);

    } catch (err) {
        console.error("Error fetching library:", err);
        showToast("Failed to load library", "error");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // --- ACTIONS ---
  const handleDelete = async (table, id) => {
      if(!window.confirm('Are you sure you want to delete this?')) return;
      
      // Map old collection names to new table names if necessary
      const tableName = table === 'saved_prompts' ? 'prompts' : table;

      try {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id)
            .eq('user_id', user.uid); // Security check

          if (error) throw error;
          
          showToast("Deleted successfully.");
          // Refresh data to remove item from UI
          fetchData(); 
      } catch(e) {
          console.error(e);
          showToast("Error deleting item", "error");
      }
  };

  const handleCopy = (text, id) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast("Copied to clipboard");
  };

  const handleShip = (rawContent) => {
      // Clean up markdown fences if present before shipping
      const cleanCode = rawContent
        .replace(/^```[a-z]*\s*\n/i, '') // Remove opening fence
        .replace(/```\s*$/, '')          // Remove closing fence
        .trim();
      
      setCodeToShip(cleanCode);
      setShowGithub(true);
  };

  const handleAddKnowledge = async () => {
      if (!newKnowledgeTitle || !newKnowledgeContent) {
          showToast("Title and Content are required", "error");
          return;
      }
      try {
          const { error } = await supabase.from('knowledge').insert({
              user_id: user.uid,
              title: newKnowledgeTitle,
              content: newKnowledgeContent,
              created_at: new Date().toISOString()
          });

          if (error) throw error;

          showToast("Knowledge added!");
          setNewKnowledgeTitle('');
          setNewKnowledgeContent('');
          setShowAddKnowledge(false);
          fetchData(); // Refresh list
      } catch (error) {
          console.error(error);
          showToast("Failed to save knowledge", "error");
      }
  };

  const handleLoadPreset = (preset) => {
      const compatibleData = {
          ...preset,
          type: preset.mode, 
      };
      loadPrompt(compatibleData);
  };

  if (!user || user.uid === 'demo') return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-900 transition-colors h-full">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                  <Lock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">My Studio is Locked</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Sign in to access your saved prompts, code snippets, and custom presets.</p>
          </div>
      </div>
  );

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-y-auto p-6 md:p-10 w-full pl-16 md:pl-24 transition-colors relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Studio</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your creative assets</p>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
              <button onClick={() => setActiveTab('prompts')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'prompts' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  <FileText size={16} /> Prompts <span className="opacity-60 text-xs ml-1">{prompts.length}</span>
              </button>
              <button onClick={() => setActiveTab('snippets')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'snippets' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  <Code size={16} /> Snippets <span className="opacity-60 text-xs ml-1">{snippets.length}</span>
              </button>
              <button onClick={() => setActiveTab('presets')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'presets' ? 'bg-amber-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  <Bookmark size={16} /> Presets <span className="opacity-60 text-xs ml-1">{presets.length}</span>
              </button>
              <button onClick={() => setActiveTab('knowledge')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'knowledge' ? 'bg-violet-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  <BookOpen size={16} /> Knowledge <span className="opacity-60 text-xs ml-1">{knowledge.length}</span>
              </button>
          </div>
      </div>

      {/* --- CONTENT --- */}
      
      {/* 1. PROMPTS LIST */}
      {activeTab === 'prompts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {prompts.length === 0 && <EmptyState icon={<FileText size={48} />} text="No saved prompts yet." />}
              {prompts.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${item.type === 'art' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' : (item.type === 'video' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400')}`}>
                              {item.type}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{formatTimestamp(item.created_at)}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 mb-4 flex-1">
                          <p className="font-mono text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed">{item.prompt}</p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                          <button onClick={() => loadPrompt(item)} className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                              <Play size={14} /> Remix
                          </button>
                          <button onClick={() => handleCopy(item.prompt, item.id)} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700" title="Copy Prompt">
                              {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                          <button onClick={() => handleDelete('prompts', item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                              <Trash2 size={16} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* 2. SNIPPETS LIST */}
      {activeTab === 'snippets' && (
          <div className="grid grid-cols-1 gap-6">
              {snippets.length === 0 && <EmptyState icon={<Code size={48} />} text="No saved snippets yet. Run a Battle to save one!" />}
              {snippets.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                  <Terminal size={18} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.label || 'Saved Result'}</h3>
                                  <p className="text-xs text-slate-400">Generated on {formatTimestamp(item.created_at)}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                               {/* --- NEW SHIP BUTTON --- */}
                              <button onClick={() => handleShip(item.content)} className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1">
                                  <Github size={14} /> Ship
                              </button>
                              
                              <button onClick={() => handleCopy(item.content, item.id)} className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1">
                                  {copiedId === item.id ? <Check size={14} className="text-emerald-500"/> : <Copy size={14} />} {copiedId === item.id ? 'Copied' : 'Copy Code'}
                              </button>
                              <button onClick={() => handleDelete('snippets', item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>
                      <div className="p-0 bg-[#1e1e1e] overflow-x-auto">
                          <pre className="p-4 text-xs font-mono text-[#d4d4d4] leading-relaxed">
                              {item.content}
                          </pre>
                      </div>
                      {item.prompt_used && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                              <strong>Prompt:</strong> {item.prompt_used}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      )}

      {/* 3. PRESETS LIST */}
      {activeTab === 'presets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presets.length === 0 && <EmptyState icon={<Bookmark size={48} />} text="No saved presets yet. Save your settings in the Builder!" />}
              {presets.map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-amber-400 dark:hover:border-amber-500 transition-colors group">
                      <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                               <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                  <Bookmark size={20} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{item.label}</h3>
                                  <span className="text-[10px] uppercase font-bold text-slate-400">{item.mode} • {item.textSubMode}</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-6">
                          {item.selections && Object.keys(item.selections || {}).slice(0, 4).map(key => (
                              <span key={key} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
                                  {item.selections[key][0]?.value}
                              </span>
                          ))}
                          {item.selections && Object.keys(item.selections || {}).length > 4 && <span className="text-[10px] text-slate-400 px-1">...</span>}
                      </div>

                      <div className="flex gap-2">
                          <button onClick={() => handleLoadPreset(item)} className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                              <Zap size={16} /> Apply Preset
                          </button>
                          <button onClick={() => handleDelete('presets', item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* 4. KNOWLEDGE LIST */}
      {activeTab === 'knowledge' && (
          <div className="space-y-6">
              {/* --- NEW: SYSTEM VECTOR SEEDER --- */}
              <div className="mb-4">
                  <KnowledgeSeeder />
              </div>

              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  {showAddKnowledge ? (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                          <input 
                              placeholder="Title (e.g. 'My Brand Voice')" 
                              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                              value={newKnowledgeTitle}
                              onChange={(e) => setNewKnowledgeTitle(e.target.value)}
                          />
                          <textarea 
                              placeholder="Content (Paste your guidelines, docs, or code snippet here...)" 
                              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm h-32 outline-none focus:ring-2 focus:ring-violet-500 dark:text-white font-mono"
                              value={newKnowledgeContent}
                              onChange={(e) => setNewKnowledgeContent(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                              <button onClick={() => setShowAddKnowledge(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                              <button onClick={handleAddKnowledge} className="px-4 py-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold">Save Knowledge</button>
                          </div>
                      </div>
                  ) : (
                      <button onClick={() => setShowAddKnowledge(true)} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-violet-500 hover:border-violet-200 dark:hover:border-violet-900 flex items-center justify-center gap-2 transition-all group">
                          <Plus size={20} className="group-hover:scale-110 transition-transform"/> Add New Knowledge Snippet
                      </button>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {knowledge.length === 0 && !showAddKnowledge && <EmptyState icon={<BookOpen size={48} />} text="Your knowledge library is empty." />}
                  {knowledge.map(item => (
                      <div key={item.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-violet-300 dark:hover:border-violet-700 transition-colors group relative">
                           <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2"><BookOpen size={14} className="text-violet-500"/> {item.title}</h3>
                                <div className="flex gap-1">
                                    <button onClick={() => handleCopy(item.content, item.id)} className="p-1.5 text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded transition-colors">{copiedId === item.id ? <Check size={14}/> : <Copy size={14}/>}</button>
                                    <button onClick={() => handleDelete('knowledge', item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 size={14}/></button>
                                </div>
                           </div>
                           <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-700 line-clamp-3">
                               {item.content}
                           </div>
                           <div className="mt-2 flex items-center gap-2">
                               <span className="text-[10px] text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">@{item.title.replace(/\s+/g, '')}</span>
                           </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
      
      {/* GitHub Modal (Global for this view) */}
      <GitHubModal 
        isOpen={showGithub} 
        onClose={() => setShowGithub(false)} 
        codeToPush={codeToShip} 
      />
    </div>
  );
};

const EmptyState = ({ icon, text }) => (
    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
        <div className="mb-4 opacity-50">{icon}</div>
        <p className="text-lg font-medium">{text}</p>
    </div>
);

export default SavedView;