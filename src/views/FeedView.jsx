import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { Palette, Terminal, RefreshCw, Heart, Play, AlertTriangle, ArrowDown, Filter, FileText, Layers } from 'lucide-react';
import { db, APP_ID } from '../lib/firebase.js';
import { formatTimestamp } from '../utils/index.js';

// Increased limit to ensure we have enough diversity for filters
const POSTS_PER_PAGE = 50;

const FeedView = ({ user, loadPrompt, onLoginRequest }) => {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  // --- CTO UPDATE: Filter State ---
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchPosts = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      let q = query(
        collection(db, 'artifacts', APP_ID, 'public', 'data', 'posts'),
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );

      if (!isInitial && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);
      
      if (snapshot.docs.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }

      const newPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
    } catch (err) {
      console.error("Feed Error:", err);
      setError("Unable to load feed.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, []);

  const handleLike = async (postId) => {
      if(!user || user.uid === 'demo') {
          onLoginRequest();
          return;
      }
      
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
      ));

      const postRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'posts', postId);
      try {
          await updateDoc(postRef, { likes: increment(1) });
      } catch(e) {
          console.error("Like error", e);
      }
  }

  // --- CTO UPDATE: Client-Side Filter Logic ---
  const filteredPosts = useMemo(() => {
      if (activeFilter === 'all') return posts;
      
      return posts.filter(post => {
          if (activeFilter === 'art') return post.type === 'art';
          if (activeFilter === 'coding') return post.textSubMode === 'coding';
          if (activeFilter === 'writing') return post.textSubMode === 'writing';
          return true;
      });
  }, [posts, activeFilter]);

  if (error) return <div className="flex-1 p-10 text-center text-red-400 w-full pl-16 md:pl-24 flex flex-col items-center gap-2"><AlertTriangle/> {error}</div>;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-y-auto p-6 md:p-10 w-full pl-16 md:pl-24 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Community Feed</h2>
          
          {/* --- CTO UPDATE: Filter Chips UI --- */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
              <Filter size={16} className="text-slate-400 mr-1" />
              
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeFilter === 'all' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
              >
                All Posts
              </button>
              
              <button 
                onClick={() => setActiveFilter('art')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${activeFilter === 'art' ? 'bg-pink-600 text-white shadow-md shadow-pink-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-pink-200 hover:text-pink-600'}`}
              >
                <Palette size={12} /> Art
              </button>
              
              <button 
                onClick={() => setActiveFilter('coding')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${activeFilter === 'coding' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 hover:text-indigo-600'}`}
              >
                <Terminal size={12} /> Coding
              </button>
              
              <button 
                onClick={() => setActiveFilter('writing')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${activeFilter === 'writing' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 hover:text-emerald-600'}`}
              >
                <FileText size={12} /> Writing
              </button>
          </div>
      </div>
      
      {/* Grid */}
      <div className="max-w-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
        {filteredPosts.map(post => (
            <div key={post.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${post.type === 'art' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                    {post.type === 'art' ? <Palette size={16} /> : (post.textSubMode === 'coding' ? <Terminal size={16} /> : <FileText size={16} />)}
                    </div>
                    <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{post.authorName || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                        <span>{formatTimestamp(post.createdAt)}</span>
                        {post.targetModel && <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded capitalize">{post.targetModel.replace('-', ' ')}</span>}
                    </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg font-mono text-sm text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap max-h-40 overflow-hidden text-ellipsis flex-1 relative">
                 {/* Visual fade at bottom of text */}
                 <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent pointer-events-none"></div>
                 {post.prompt}
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-auto">
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-red-500 transition-colors group"><Heart size={18} className="group-hover:fill-red-500" /> {post.likes || 0}</button>
                <div className="ml-auto flex items-center gap-2">
                    {post.textSubMode && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-500 dark:text-slate-400 capitalize">{post.textSubMode}</span>}
                    <button onClick={() => loadPrompt(post)} className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors text-xs uppercase tracking-wide"><Play size={14} /> Remix</button>
                </div>
            </div>
            </div>
        ))}

        {filteredPosts.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <Layers size={48} className="opacity-20" />
                <p>No posts found for this filter.</p>
                <button onClick={() => setActiveFilter('all')} className="text-indigo-500 font-bold text-sm hover:underline">Clear Filters</button>
            </div>
        )}
      </div>

      {loading && <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-indigo-500" /></div>}
      
      {!loading && hasMore && (
          <div className="flex justify-center pb-12">
              <button 
                onClick={() => fetchPosts(false)} 
                disabled={loadingMore}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-6 py-2 rounded-full font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                  {loadingMore ? <RefreshCw size={16} className="animate-spin"/> : <ArrowDown size={16} />}
                  Load More
              </button>
          </div>
      )}
      
      {!loading && !hasMore && posts.length > 0 && (
          <div className="text-center pb-12 text-slate-400 text-sm">You've reached the end!</div>
      )}
    </div>
  );
};

export default FeedView;