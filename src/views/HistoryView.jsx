import React from 'react';

const HistoryView = ({ sessionHistory, showToast }) => (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-y-auto p-6 md:p-10 w-full pl-16 md:pl-24 transition-colors">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Session History</h2>
      <div className="max-w-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {sessionHistory.length === 0 && <p className="text-slate-400 italic col-span-full">No history yet. Start crafting!</p>}
        {sessionHistory.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${item.type === 'art' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>{item.type}</span>
                    <span className="text-xs text-slate-400">{item.timestamp}</span>
                </div>
                <p className="font-mono text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{item.prompt}</p>
                <button onClick={() => {
                    navigator.clipboard.writeText(item.prompt);
                    showToast("Copied from history");
                }} className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Copy Again</button>
            </div>
        ))}
      </div>
    </div>
);

export default HistoryView;