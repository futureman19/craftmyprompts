import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { RefreshCw, Save } from 'lucide-react';
import { db, APP_ID } from '../lib/firebase.js';
import { formatTimestamp } from '../utils/index.js';

const SavedView = ({ user, loadPrompt, showToast }) => {
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.uid === 'demo') return;
    const q = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'saved_prompts');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setSavedPrompts(fetched);
    }, (err) => {
        console.error("Saved Error:", err);
        setError("Unable to load library.");
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id) => {
      if(confirm('Delete this prompt?')) {
          try {
              await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'saved_prompts', id));
              showToast("Deleted");
          } catch(e) {
              showToast("Error deleting", "error");
          }
      }
  }

  if (!user || user.uid === 'demo') return <div className="flex-1 p-10 text-center text-slate-500 w-full pl-16 md:pl-24">Please log in to view your library.</div>;
  if (error) return <div className="flex-1 p-10 text-center text-red-400 w-full pl-16 md:pl-24">{error}</div>;

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-10 w-full pl-16 md:pl-24">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">My Library</h2>
      <div className="max-w-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {savedPrompts.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group hover:border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${item.type === 'art' ? 'bg-pink-100 text-pink-700' : 'bg-indigo-100 text-indigo-700'}`}>{item.type}</span>
                  <span className="text-xs text-slate-400 ml-auto">{formatTimestamp(item.createdAt)}</span>
              </div>
              <p className="font-mono text-xs text-slate-600 mb-4 line-clamp-4 flex-1">{item.prompt}</p>
              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                  <button onClick={() => loadPrompt(item)} className="flex-1 py-2 text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors font-medium">Load</button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><RefreshCw className="rotate-45" size={18} /></button>
              </div>
            </div>
          ))}
          {savedPrompts.length === 0 && <div className="col-span-full text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50"><Save size={32} className="mx-auto mb-3 opacity-30" /><p>No saved prompts yet.</p></div>}
      </div>
    </div>
  );
};

export default SavedView;