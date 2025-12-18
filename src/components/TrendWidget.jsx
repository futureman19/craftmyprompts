import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Youtube, Plus, Loader, AlertTriangle } from 'lucide-react';

const TrendWidget = ({ onSelectTopic, onClose }) => {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('0'); // '0' = All
    const [error, setError] = useState(null);

    // YouTube Category IDs
    const CATEGORIES = [
        { id: '0', label: 'All' },
        { id: '28', label: 'Tech' },
        { id: '20', label: 'Gaming' },
        { id: '27', label: 'Education' },
        { id: '24', label: 'Entertainment' }
    ];

    const fetchTrends = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/trends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId: category })
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || "Failed to load trends");
            
            setTrends(data.trends || []);
        } catch (err) {
            console.error(err);
            // Fallback mock data if API fails (useful if API key isn't set up yet)
            if (err.message.includes("API Key")) {
                setError("Missing API Key. Showing demo data.");
                setTrends(DEMO_DATA);
            } else {
                setError("Could not fetch trends. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
    }, [category]);

    // Helper to format view count (e.g. 1,200,000 -> 1.2M)
    const formatViews = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col h-80 md:h-96 w-full animate-in slide-in-from-top-2 fade-in duration-200">
            {/* Header */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50 rounded-t-xl flex-shrink-0">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <TrendingUp size={16} />
                    <span>Viral Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchTrends} 
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-indigo-500"
                        title="Refresh Trends"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    </button>
                    {onClose && (
                         <button onClick={onClose} className="p-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">Close</button>
                    )}
                </div>
            </div>

            {/* Filter Tabs - Scrollable for mobile */}
            <div className="p-2 flex gap-2 overflow-x-auto border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 scrollbar-hide snap-x flex-shrink-0">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`snap-start px-4 py-1.5 md:py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                            category === cat.id 
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50 dark:bg-slate-950/30">
                {error && (
                    <div className="p-3 text-xs text-center text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900 flex items-center justify-center gap-2">
                        <AlertTriangle size={12} /> {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <Loader size={24} className="animate-spin text-indigo-500" />
                        <span className="text-xs">Scanning YouTube...</span>
                    </div>
                ) : (
                    trends.map((video) => (
                        <div key={video.id} className="group bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm flex gap-3 items-center">
                            {/* Thumbnail */}
                            <div className="w-20 h-12 flex-shrink-0 rounded overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                                <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 right-0 bg-black/70 text-[8px] text-white px-1 rounded-tl">
                                    {formatViews(video.views)}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-indigo-500 transition-colors">
                                    {video.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] text-slate-400 truncate max-w-[80px]">{video.channel}</span>
                                    <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-red-500 p-1">
                                        <Youtube size={12} />
                                    </a>
                                </div>
                            </div>

                            {/* Action - Larger touch target */}
                            <button 
                                onClick={() => onSelectTopic(video.title)}
                                className="p-3 md:p-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors flex-shrink-0"
                                title="Use as Topic"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    ))
                )}
                
                {!loading && trends.length === 0 && !error && (
                    <div className="text-center py-10 text-slate-400 text-xs">No trends found.</div>
                )}
            </div>
        </div>
    );
};

// Fallback data in case API key is missing during dev or rate limited
const DEMO_DATA = [
    { id: '1', title: "I Built a Neural Network from Scratch in C++", thumbnail: "https://i.ytimg.com/vi/L1bXjF7V4G8/mqdefault.jpg", views: "1200000", channel: "CodeMaster" },
    { id: '2', title: "Why Everyone is Switching to Linux in 2025", thumbnail: "https://i.ytimg.com/vi/e123/mqdefault.jpg", views: "850000", channel: "TechDaily" },
    { id: '3', title: "React 19 vs Svelte 5: The Benchmark", thumbnail: "https://i.ytimg.com/vi/abc/mqdefault.jpg", views: "430000", channel: "WebDevSimp" },
];

export default TrendWidget;