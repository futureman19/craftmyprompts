// This is a "Barrel File".
// It aggregates data from multiple smaller files and re-exports them.

export { GENERAL_DATA } from './categories/general.jsx';
export { CODING_DATA } from './categories/coding.jsx';
export { WRITING_DATA } from './categories/writing.jsx';
export { ART_DATA } from './categories/art.jsx';
export { AVATAR_DATA } from './categories/avatar.jsx';
export { VIDEO_DATA } from './categories/video.jsx';
export { SOCIAL_DATA } from './categories/social.jsx';
export { PRESETS } from './presets';

// Random topics for the "Surprise Me" feature
export const RANDOM_TOPICS = [
    // Art Topics
    "A futuristic city floating in the clouds",
    "A cute astronaut cat exploring Mars",
    "A mystical forest with glowing mushrooms",
    "A cyberpunk street food vendor in Tokyo",
    "An ancient library inside a giant tree",
    "A steampunk airship battle",
    "A serene japanese garden in winter",
    "A neon-lit diner in the rain",
    
    // Writing/Text Topics
    "Explain quantum computing to a 5 year old",
    "Write a viral tweet about coffee",
    "Create a 3-day workout plan for beginners",
    "Write a scary story in 2 sentences",
    "Explain why the sky is blue",
    "Write a rejection letter to a ghost",
    "Create a recipe for the ultimate sandwich"
];