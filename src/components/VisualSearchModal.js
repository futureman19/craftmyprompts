import React, { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, Loader, Palette, Check } from 'lucide-react';

const VisualSearchModal = ({ isOpen, onClose, onSelectImage }) => {
    const [query, setQuery] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Common mood colors for prompt engineering
    const colors = [
        { name: 'Neon Red', hex: '#FF0055' },
        { name: 'Cyber Blue', hex: '#00F0FF' },
        { name: 'Toxic Green', hex: '#39FF14' },
        { name: 'Golden Hour', hex: '#FFD700' },
        { name: 'Noir Black', hex: '#000000' },
        { name: 'Clean White', hex: '#FFFFFF' },
    ];

    // Reset on open
    useEffect(() => {
        if (isOpen && !images.length) {
            // Optional: Load some default "Trending" visuals
            handleSearch('Abstract'); 
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSearch = async (searchQuery = query) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/pexels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    query: searchQuery, 
                    color: selectedColor 
                })
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Failed to fetch images');
            setImages(data.photos || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleColorSelect = (hex) => {
        const newColor = selectedColor === hex ? '' : hex;
        setSelectedColor(newColor);
        // Trigger search immediately if query exists, else just set filter
        if (query) handleSearch();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <ImageIcon size={20} className="text-pink-500" /> Visual Reference Search
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Toolbar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search visuals (e.g. 'Cyberpunk City', 'Portrait')..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none dark:text-white"
                            />
                        </div>
                        <button 
                            onClick={() => handleSearch()}
                            disabled={loading}
                            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-pink-600 dark:hover:bg-pink-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {/* Color Filters */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><Palette size={12}/> Mood:</span>
                        {colors.map(c => (
                            <button
                                key={c.hex}
                                onClick={() => handleColorSelect(c.hex)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium transition-all ${selectedColor === c.hex ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                            >
                                <div className="w-3 h-3 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: c.hex }}></div>
                                {c.name}
                            </button>
                        ))}
                        {selectedColor && (
                            <button onClick={() => setSelectedColor('')} className="text-xs text-slate-400 hover:text-red-500 ml-2">Clear</button>
                        )}
                    </div>
                </div>

                {/* Grid Results */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/50">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Loader size={40} className="animate-spin mb-4 text-pink-500" />
                            <p className="text-sm">Curating visuals...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center p-8 text-red-500">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map(img => (
                                <div 
                                    key={img.id} 
                                    className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700"
                                    onClick={() => { onSelectImage(img.url); onClose(); }}
                                >
                                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    
                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        <p className="text-white text-xs font-bold truncate">{img.photographer}</p>
                                        <button className="mt-2 w-full py-1.5 bg-pink-600 text-white text-xs font-bold rounded flex items-center justify-center gap-1">
                                            <Check size={12} /> Select
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!loading && images.length === 0 && !error && (
                        <div className="text-center py-20 text-slate-400">
                            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Search for a visual style to begin.</p>
                        </div>
                    )}
                </div>
                
                {/* Footer Attribution */}
                <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
                    <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="text-[10px] text-slate-400 hover:text-pink-500 transition-colors">
                        Photos provided by Pexels
                    </a>
                </div>
            </div>
        </div>
    );
};

export default VisualSearchModal;