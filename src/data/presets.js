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
            topic: "Create a stateful contract for {Contract Logic} where {Condition}. Use the UTXO model." 
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
            platform: "X (Twitter)",
            framework: "Storytelling", 
            intent: "Inspire", 
            style: "TechCrunch Style",
            topic: "Write a thread about {Topic}. Hook the reader immediately with a surprising fact. Use '1/x' numbering." 
        },
        { 
            label: "B2B Cold Email", 
            intent: "Sell", 
            framework: "AIDA (Attention, Interest, Desire, Action)", 
            style: "TechCrunch Style", 
            topic: "Write a cold email pitching {Product} to a {Target Role}. Focus on the pain point of {Pain Point}. Keep it under 75 words." 
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
            topic: "Write a contrarian post about {Industry Trend}. Argue that {Opinion}. Use short, punchy sentences (Broetry style)." 
        }
    ],

    // --- SOCIAL PRESETS (Viral Architectures) ---
    // Hardcoded retention protocols from 1of10, SendShort, and SocialRails research
    social: [
        // VIDEO HOOKS (Short-Form)
        { 
            label: "Hook: The Negative Warning", 
            platform: "TikTok", 
            content_type: "Short-Form Video",
            hook_type: "Negativity/Fear", 
            goal: "Engagement", 
            topic: "Script a video starting with the hook: 'Stop {Action} if you want {Goal}.' Explain why this habit is destroying progress." 
        },
        { 
            label: "Hook: The Unanswered Question", 
            platform: "Instagram Reels", 
            content_type: "Short-Form Video",
            hook_type: "Curiosity", 
            goal: "Engagement", 
            topic: "Script a video starting with: 'Why do 99% of people fail at {Subject}?' Provide the counter-intuitive answer." 
        },
        { 
            label: "Hook: The Secret Reveal", 
            platform: "TikTok", 
            content_type: "Short-Form Video", 
            hook_type: "Curiosity", 
            goal: "Shares/Saves", 
            topic: "Script a video starting with: 'The {Industry} industry doesn't want you to know this...' Reveal a specific insider secret about {Topic}." 
        },

        // YOUTUBE TITLES (Long-Form)
        { 
            label: "Title: The Survivorship Protocol", 
            platform: "YouTube Video", 
            hook_type: "Negativity/Fear", 
            goal: "Click-Through Rate",
            topic: "Generate a video title using the syntax: 'I Survived {Duration} With {Constraint}.' Ensure the constraint represents a mortal or reputational threat." 
        },
        { 
            label: "Title: The Time Condenser", 
            platform: "YouTube Video", 
            hook_type: "Value/Status", 
            goal: "Click-Through Rate",
            topic: "Generate a video title using the syntax: 'I Tested {Number} Years Of {Subject}.' The time period must be exaggerated to imply high information density." 
        },
        { 
            label: "Title: The Tier List", 
            platform: "YouTube Video", 
            hook_type: "Value/Status", 
            goal: "Engagement",
            topic: "Generate a video title using the syntax: 'The {Subject} Tier List'. Rank items from S-Tier to F-Tier to invite tribal debate." 
        },

        // CAROUSELS (Static)
        { 
            label: "Carousel: Step-by-Step", 
            platform: "Instagram", 
            content_type: "Carousel (PDF/Image)", 
            framework: "Educational", 
            goal: "Saves", 
            topic: "Create a 10-slide carousel about {Topic}. Slide 1: Problem/Hook. Slides 2-8: Micro-actions. Slide 9: Final Result. Slide 10: CTA." 
        },
        { 
            label: "Carousel: Myth vs Fact", 
            platform: "LinkedIn", 
            content_type: "Carousel (PDF/Image)", 
            framework: "Educational", 
            goal: "Engagement", 
            topic: "Create a carousel comparing {Common Myth} vs {The Truth}. Use alternating slides to contrast the misconception with the reality." 
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
            topic: "Explain {Complex Concept} using a {Real World Object} analogy. Keep it simple enough for a 5-year-old." 
        },
        { 
            label: "Executive Summary", 
            persona: "Project Manager", 
            format: "Structured", 
            length: "Brief",
            topic: "Summarize this text into bullet points with key action items and owners: {Insert Text Here}" 
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
            topic: "A portrait of {Subject} looking {Emotion}. Highly detailed skin texture, dramatic side lighting." 
        },
        { 
            label: "Cyberpunk City", 
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
            topic: "A peaceful scene of {Subject} in a {Setting}. Fluffy cumulus clouds, lush green grass, gentle breeze blowing." 
        },
        { 
            label: "Isometric Game Asset", 
            shot: "Isometric", 
            background: "White Background", 
            visuals: "Bright",
            topic: "A cute low-poly {Building Type} on a floating island. Soft lighting, clean edges." 
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
            topic: "A 3D character of {Description}. Big expressive eyes, soft rendering." 
        },
        { 
            label: "Anime Profile", 
            avatar_style: "Anime", 
            framing: "Bust (Shoulders up)", 
            expression: "Mysterious", 
            topic: "An anime character with {Hair Color} hair and {Eye Color} eyes. Cel-shaded style." 
        },
        { 
            label: "Professional Headshot", 
            avatar_style: "Photorealistic", 
            framing: "Headshot", 
            expression: "Friendly", 
            background: "Office Blur",
            topic: "A professional photo of {Subject} wearing {Clothing}. Shallow depth of field." 
        }
    ],

    // --- VIDEO PRESETS ---
    video: [
        { 
            label: "Cinematic Drone", 
            camera_move: "Drone Flyover", 
            motion_strength: "Normal Motion", 
            aesthetics: "4k Digital Clean", 
            topic: "Sweeping aerial view of {Location} at {Time of Day}. Smooth movement." 
        },
        { 
            label: "90s VHS Style", 
            camera_move: "Handheld Shake", 
            aesthetics: "VHS Glitch", 
            topic: "POV walking through {Location}. Grainy footage, flickering lights, tracking errors." 
        },
        { 
            label: "Product Showcase", 
            camera_move: "Orbit", 
            motion_strength: "Slow Motion", 
            topic: "A close up of {Product}. Elegant lighting, smooth rotation, water droplets." 
        }
    ]
};