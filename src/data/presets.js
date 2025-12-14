export const PRESETS = {
    // --- CODING PRESETS ---
    // Sets up the environment for specific coding tasks
    coding: [
        { 
            label: "Modern React Component", 
            lang: "React", 
            framework_version: "Next.js 14",
            task: "Write Code", 
            topic: "Create a responsive {Component Name} using Tailwind CSS. It should {Functionality}. Use Server Components where possible." 
        },
        { 
            label: "Bitcoin Smart Contract", 
            lang: "sCrypt", 
            task: "Write Smart Contract", 
            topic: "Create a stateful contract for {Contract Logic} where {Condition}." 
        },
        { 
            label: "Secure Python API", 
            lang: "Python", 
            framework_version: "Python 3.12",
            task: "Write Code", 
            topic: "Create a POST endpoint '{Endpoint}' that validates input using Pydantic v2. Ensure {Validation Rule}." 
        },
        { 
            label: "Solidity Safe Transfer", 
            lang: "Solidity", 
            task: "Write Smart Contract", 
            topic: "Write a secure '{Function Name}' function that follows the Checks-Effects-Interactions pattern to prevent reentrancy." 
        },
        { 
            label: "SQL Optimization", 
            lang: "SQL", 
            task: "Optimize", 
            topic: "Analyze this query for performance bottlenecks and suggest indexes: {Insert Query Here}" 
        }
    ],

    // --- WRITING PRESETS ---
    // Sets the Tone, Framework, and Style for text generation
    writing: [
        { 
            label: "Viral X/Twitter Thread", 
            // Note: 'platform' is usually in Social, but we map it here if the builder supports cross-pollination
            framework: "Storytelling", 
            intent: "Inspire", 
            style: "TechCrunch Style",
            topic: "Write a thread about {Topic}. Hook the reader immediately with a surprising fact." 
        },
        { 
            label: "B2B Cold Email", 
            intent: "Sell", 
            framework: "AIDA (Attention, Interest, Desire, Action)", 
            style: "TechCrunch Style", 
            topic: "Write a cold email pitching {Product} to a {Target Role}. Focus on the pain point of {Pain Point}." 
        },
        { 
            label: "SEO Blog Post", 
            intent: "Inform", 
            framework: "PAS (Problem, Agitate, Solution)", 
            topic: "Outline a blog post about {Topic}. Target keywords: {Keywords}. Include H2 headers for 'People Also Ask'." 
        },
        { 
            label: "LinkedIn Authority Op-Ed", 
            intent: "Persuade",
            style: "Malcolm Gladwell",
            topic: "Write a contrarian post about {Industry Trend}. Argue that {Opinion}." 
        }
    ],

    // --- SOCIAL PRESETS ---
    // Specific configurations for Social Media platforms
    social: [
        { 
            label: "TikTok Viral Script", 
            platform: "TikTok", 
            content_type: "Short-Form Video",
            hook_type: "Negativity/Fear", 
            goal: "Engagement", 
            topic: "Script a 30-second video about {Topic}. Start with a 'Stop Scrolling' hook about a common mistake." 
        },
        { 
            label: "Instagram Carousel", 
            platform: "Instagram", 
            content_type: "Carousel (PDF/Image)", 
            framework: "Educational", 
            goal: "Conversion",
            topic: "Create a 5-slide breakdown of {Topic}. Slide 1 is the Hook, Slide 5 is the CTA to {Action}." 
        },
        { 
            label: "YouTube Clickbait Title", 
            platform: "YouTube Video", 
            content_type: "Thumbnail",
            hook_type: "Curiosity", 
            goal: "Engagement",
            topic: "Generate 5 high-CTR titles for a video about {Topic}. Use the 'I Survived...' or 'I Tested...' syntax." 
        }
    ],

    // --- GENERAL PRESETS ---
    // Personas and Modes for general tasks
    general: [
        { 
            label: "ELI5 Explainer", 
            persona: "Physics Tutor", 
            tone: "Friendly", 
            language_style: "Simple English",
            topic: "Explain {Complex Concept} using a {Real World Object} analogy." 
        },
        { 
            label: "Executive Summary", 
            persona: "Project Manager", 
            format: "Structured", 
            length: "Brief",
            topic: "Summarize this text into bullet points with key action items: {Insert Text}" 
        },
        { 
            label: "Tough Interviewer", 
            persona: "HR Specialist", 
            context: "Situation", 
            topic: "Act as a sceptical interviewer for a {Job Role} position. Ask me 3 hard questions about {Skill}." 
        }
    ],

    // --- ART PRESETS ---
    // Configures Midjourney/Stable Diffusion settings
    art: [
        { 
            label: "Cinematic Portrait", 
            genre: "Cinematic", 
            shot: "Close-up", 
            visuals: "Studio Lighting",
            tech: "8k",
            topic: "A portrait of {Subject} looking {Emotion}. Highly detailed texture." 
        },
        { 
            label: "Cyberpunk City", 
            genre: "Cyberpunk", 
            environment: "Cyber City", 
            visuals: "Neon",
            topic: "A futuristic {City Name} street at night. Rain reflecting neon lights. {Action} happening in background." 
        },
        { 
            label: "Studio Ghibli Scene", 
            style: "Studio Ghibli", 
            environment: "Nature", 
            visuals: "Pastel",
            topic: "A peaceful scene of {Subject} in a {Setting}. Fluffy clouds, lush grass, gentle breeze." 
        },
        { 
            label: "Isometric Game Asset", 
            shot: "Isometric", 
            background: "White Background", 
            visuals: "Bright",
            topic: "A cute low-poly {Building Type} on a floating island." 
        }
    ],

    // --- AVATAR PRESETS ---
    avatar: [
        { 
            label: "Pixar Style 3D", 
            avatar_style: "Pixar Style", 
            framing: "Headshot", 
            expression: "Confident", 
            background: "Gradient",
            topic: "A 3D character of {Description}." 
        },
        { 
            label: "Anime Profile", 
            avatar_style: "Anime", 
            framing: "Bust (Shoulders up)", 
            expression: "Mysterious", 
            topic: "An anime character with {Hair Color} hair and {Eye Color} eyes." 
        },
        { 
            label: "Professional Headshot", 
            avatar_style: "Photorealistic", 
            framing: "Headshot", 
            expression: "Friendly", 
            background: "Office Blur",
            topic: "A professional photo of {Subject} wearing {Clothing}." 
        }
    ],

    // --- VIDEO PRESETS ---
    video: [
        { 
            label: "Cinematic Drone", 
            camera_move: "Drone Flyover", 
            motion_strength: "Normal Motion", 
            aesthetics: "4k Digital Clean", 
            topic: "Sweeping aerial view of {Location} at {Time of Day}." 
        },
        { 
            label: "90s VHS Style", 
            camera_move: "Handheld Shake", 
            aesthetics: "VHS Glitch", 
            topic: "POV walking through {Location}. Grainy footage, flickering lights." 
        },
        { 
            label: "Product Showcase", 
            camera_move: "Orbit", 
            motion_strength: "Slow Motion", 
            topic: "A close up of {Product}. Elegant lighting, smooth rotation." 
        }
    ]
};