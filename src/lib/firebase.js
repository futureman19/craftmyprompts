// --- DEPRECATED ---
// This file is kept temporarily to prevent build errors during the migration phase.
// The application has moved to Supabase (PostgreSQL).
// Please use 'src/lib/supabase.js' for all database and auth operations.

export const auth = {
    currentUser: null,
    onAuthStateChanged: () => {
        console.warn("Firebase Auth is deprecated. Please use Supabase Auth.");
        return () => {}; // Return dummy unsubscribe function
    }
};

export const db = {
    collection: () => {
        console.warn("Firebase Firestore is deprecated. Please use Supabase Client.");
    }
};

// Kept for backward compatibility with any remaining imports
export const APP_ID = (typeof __app_id !== 'undefined') ? __app_id : "craft-my-prompt-app";