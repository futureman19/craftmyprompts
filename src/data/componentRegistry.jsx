import TrendWidget from '../components/TrendWidget.jsx';
import VisualSearchModal from '../components/VisualSearchModal.jsx';
import GitHubModal from '../components/GitHubModal.jsx';

// --- A2UI COMPONENT REGISTRY ---
// This file maps "Tool Names" (Intents) to actual React Components.
// The AI Agent will output a tool name (e.g., 'show_trends'), and the
// Interface will look up the corresponding component here to render.

export const COMPONENT_REGISTRY = {
    // 1. Viral Trends Widget
    // Used when the user asks for "trending topics", "viral ideas", or "what's popular".
    "show_trends": {
        component: TrendWidget,
        defaultProps: {
            // In a chat stream, we might want to hide the close button initially
            onClose: null 
        },
        description: "Displays real-time viral trends from YouTube. Use this when the user needs topic inspiration."
    },

    // 2. Visual Reference Search
    // Used when the user wants to "find an image", "search for references", or "look up visuals".
    "visual_search": {
        component: VisualSearchModal,
        defaultProps: {
            isOpen: true, // Modals need to be open to be seen
            // Handlers (onSelectImage) will be injected by the runtime hook
        },
        description: "Search interface for high-quality stock photos (Pexels) to use as references."
    },

    // 3. GitHub Deployment
    // Used when the user wants to "save code", "ship it", or "create a gist".
    "github_ship": {
        component: GitHubModal,
        defaultProps: {
            isOpen: true,
            // codeToPush will be injected from the agent's current context
        },
        description: "Deployment interface to save code snippets to GitHub Gists."
    }
};