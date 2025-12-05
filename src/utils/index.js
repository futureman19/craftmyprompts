export const formatTimestamp = (ts) => {
    if (!ts) return '';
    if (typeof ts === 'string') return ts; // Already a string
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString(); // Firestore Timestamp
    if (ts instanceof Date) return ts.toLocaleTimeString(); // JS Date object
    return ''; // Unknown/Object that can't be rendered
};