import TrendWidget from '../components/TrendWidget.jsx';
import VisualSearchModal from '../components/VisualSearchModal.jsx';
import GitHubModal from '../components/GitHubModal.jsx';
import A2UIRenderer from '../components/a2ui/A2UIRenderer.jsx';

import LivePreview from '../components/LivePreview.jsx';
import ProjectBlueprint from '../components/agent/ProjectBlueprint.jsx'; // Import Blueprint Component

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
    },

    // 4. Generative UI (The "CraftUI" Engine)
    // This allows the AI to build custom layouts using atomic components (Cards, Buttons).
    "render_ui": {
        component: A2UIRenderer,
        defaultProps: {},
        description: "Renders a custom UI layout. REQUIRED PROP: 'content' (JSON tree of atoms: Container, Card, Text, Button, Image, Input)."
    },

    // 5. Live Website Rendering
    // Used when the user asks to "build a website", "create a landing page", or "write code".
    "render_website": {
        component: LivePreview,
        defaultProps: {
            isChatMode: true, // Optimize for chat display
            title: "Generated Website"
        },
        description: "Renders a live website preview from HTML/React code. REQUIRED PROP: 'content' (The raw code string)."
    },

    // 6. Project Blueprint (The Architect's Manifest)
    // Used when the user runs /ship to visualize the file structure.
    "project_blueprint": {
        component: ProjectBlueprint,
        defaultProps: {
            structure: [],
            // onAction will be injected by ChatInterface
        },
        description: "Renders a technical file tree blueprint for user approval."
    }
};