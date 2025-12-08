import React, { useState, useEffect } from 'react';
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
import { Palette, Terminal, RefreshCw, Heart, Play, AlertTriangle, ArrowDown } from 'lucide-react';
import { db, APP_ID } from '../lib/firebase.js';
import { formatTimestamp } from '../utils/index.js';

const POSTS_PER_PAGE = 20;

const FeedView = ({ user, loadPrompt, onLoginRequest }) => {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null); // Keeps track of where we left off
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Are there more posts to load?
  const [error, setError] = useState(null);

  const fetchPosts = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Base query: Public posts, sorted by newest first, limited to 20
      let q = query(
        collection(db, 'artifacts', APP_ID, 'public', 'data', 'posts'),
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );

      // If loading more, start AFTER the last document we saw
      if (!isInitial && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      // Update the cursor to the last document in this batch
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastDoc(lastVisible);
      
      // If we got fewer docs than requested, we've hit the end
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
      // NOTE: If you see a "Missing or insufficient permissions" error here, 
      // check your Firestore Security Rules.
      // If you see "The query requires an index," check the browser console for a link to create it.
      setError("Unable to load feed.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchPosts(true);
  }, []); // Run once on mount

  const handleLike = async (postId) => {
      // GUEST LOGIC: Prompt login on like
      if(!user || user.uid === 'demo') {
          onLoginRequest();
          return;
      }
      
      // Optimistic UI Update (Update the number immediately before database confirms)
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

  if (error) return <div className="flex-1 p-10 text-center text-red-400 w-full pl-16 md:pl-24 flex flex-col items-center gap-2"><AlertTriangle/> {error}</div>;

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 md:p-10 w-full pl-16 md:pl-24">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Community Feed</h2>
      
      {/* Posts Grid */}
      <div className="max-w-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
        {posts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${post.type === 'art' ? 'bg-pink-100 text-pink-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {post.type === 'art' ? <Palette size={16} /> : <Terminal size={16} />}
                    </div>
                    <div>
                    <p className="font-semibold text-slate-900">{post.authorName || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{formatTimestamp(post.createdAt)}</span>
                        {post.targetModel && <span className="bg-slate-100 px-1.5 py-0.5 rounded capitalize">{post.targetModel.replace('-', ' ')}</span>}
                    </div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm text-slate-700 mb-4 whitespace-pre-wrap max-h-40 overflow-hidden text-ellipsis">{post.prompt}</div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-red-500 transition-colors group"><Heart size={18} className="group-hover:fill-red-500" /> {post.likes || 0}</button>
                <button onClick={() => loadPrompt(post)} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors ml-auto"><Play size={18} /> Remix</button>
            </div>
            </div>
        ))}
      </div>

      {/* Load More Button */}
      {loading && <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-indigo-500" /></div>}
      
      {!loading && hasMore && (
          <div className="flex justify-center pb-12">
              <button 
                onClick={() => fetchPosts(false)} 
                disabled={loadingMore}
                className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-full font-medium hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-50"
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