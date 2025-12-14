export const ART_PRESETS = [
    // --- GENERATIVE ART STYLES ---
    { 
        label: "Cinematic Portrait", 
        genre: "Cinematic", 
        shot: "Close-up", 
        visuals: "Studio Lighting",
        tech: "8k",
        topic: "A portrait of {Subject} looking {Emotion}. Highly detailed skin texture, dramatic side lighting, bokeh background." 
    },
    { 
        label: "Cyberpunk Cityscape", 
        genre: "Cyberpunk", 
        environment: "Cyber City", 
        visuals: "Neon",
        topic: "A futuristic {City Name} street at night. Wet pavement reflecting neon signs. {Action} happening in background. Heavy atmosphere." 
    },
    { 
        label: "Studio Ghibli Scene", 
        style: "Studio Ghibli", 
        environment: "Nature", 
        visuals: "Pastel",
        topic: "A peaceful scene of {Subject} in a {Setting}. Fluffy cumulus clouds, lush green grass, gentle breeze blowing. Hand-painted style." 
    },
    { 
        label: "Isometric Game Asset", 
        shot: "Isometric", 
        background: "White Background", 
        visuals: "Bright",
        topic: "A cute low-poly {Building Type} on a floating island. Soft lighting, clean edges, blender render style." 
    },
    {
        label: "Dark Fantasy Concept",
        genre: "Fantasy",
        visuals: "Muted",
        style: "H.R. Giger",
        topic: "An ancient {Object/Creature} hidden in a {Location}. Foggy atmosphere, organic textures, intricate details."
    },
    {
        label: "Synthwave Vaporwave",
        genre: "Vaporwave",
        visuals: "Neon",
        topic: "A retro 80s grid landscape with a {Central Object}. Pink and teal color palette, sunset in background, glitch effects."
    },

    // --- SOCIAL MEDIA VISUALS (Moved from Social) ---
    { 
        label: "Carousel: Step-by-Step", 
        platform: "Instagram", 
        content_type: "Carousel (PDF/Image)", 
        framework: "Educational", 
        goal: "Saves", 
        topic: "Create a 10-slide carousel about {Topic}. Slide 1: Hook/Promise. Slides 2-8: One step per slide. Slide 9: Result. Slide 10: CTA to Save." 
    },
    { 
        label: "Carousel: Myth vs. Fact", 
        platform: "LinkedIn", 
        content_type: "Carousel (PDF/Image)", 
        framework: "Educational", 
        goal: "Comments/Debate",
        topic: "Create a carousel comparing Myths vs Facts about {Topic}. Slide 1: 'Stop believing this...'. Slide 2: The Myth. Slide 3: The Fact. Repeat for 3 myths." 
    },
    { 
        label: "Pin: Visual SEO", 
        platform: "Pinterest", 
        content_type: "Pin", 
        goal: "Click Link", 
        topic: "Generate 5 text overlay ideas for a Pinterest Pin about {Topic}. The text must contain the keyword '{Keyword}' for OCR SEO. Use high contrast." 
    }
];