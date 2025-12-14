export const PRESETS = {
    // --- CODING PRESETS ---
    // Targeted to trigger specific knowledge modules (React Server Components, sCrypt, Python Pydantic v2)
    coding: [
        { 
            label: "Modern React (Next.js 14)", 
            lang: "React", 
            framework_version: "Next.js 14",
            task: "Write Code", 
            topic: "Create a responsive 'DashboardCard' component using Tailwind CSS. It should accept a title, value, and trend percentage. Use Server Components where possible." 
        },
        { 
            label: "Bitcoin Smart Contract (sCrypt)", 
            lang: "sCrypt", 
            task: "Write Smart Contract", 
            topic: "Create a stateful contract for a 'Rock Paper Scissors' game where two players commit hashes and then reveal moves." 
        },
        { 
            label: "Secure Python API (FastAPI)", 
            lang: "Python", 
            framework_version: "Python 3.12",
            task: "Write Code", 
            topic: "Create a POST endpoint '/users' that validates input using Pydantic v2. Ensure email validation and password hashing." 
        },
        { 
            label: "Solidity Safe Transfer", 
            lang: "Solidity", 
            task: "Write Smart Contract", 
            topic: "Write a secure 'withdraw' function that follows the Checks-Effects-Interactions pattern to prevent reentrancy attacks." 
        },
        { 
            label: "SQL Optimization Expert", 
            lang: "SQL", 
            task: "Optimize", 
            topic: "Analyze this query for performance bottlenecks. Suggest specific indexes and rewrite the query using CTEs if beneficial: {Insert Query Here}" 
        }
    ],

    // --- WRITING PRESETS ---
    // Designed to trigger SEO, Cold Email, and Thread frameworks
    writing: [
        { 
            label: "Viral X/Twitter Thread", 
            platform: "X (Twitter)",
            framework: "Storytelling", 
            intent: "Inspire", 
            topic: "Write a thread about 'The Psychology of Color in Marketing'. Hook the reader immediately with a surprising fact." 
        },
        { 
            label: "High-Converting Cold Email", 
            intent: "Sell", 
            style: "TechCrunch Style", 
            topic: "Write a B2B cold email pitching a new AI scheduling tool to a busy CEO. Use the '3-Sentence Rule' framework." 
        },
        { 
            label: "SEO Power Blog", 
            intent: "Inform", 
            framework: "Marketing", 
            topic: "Outline a blog post about 'Sustainable Gardening'. Target keywords: 'organic soil', 'urban farming'. Include H2s for 'People Also Ask' questions." 
        },
        { 
            label: "LinkedIn Authority Post", 
            platform: "LinkedIn",
            style: "Modern/Business",
            intent: "Persuade",
            topic: "Write a post about 'Why Remote Work is Failing'. Use a contrarian hook and short, punchy lines." 
        }
    ],

    // --- SOCIAL PRESETS ---
    // Triggers platform-specific logic (TikTok Hooks, Carousel Structures)
    social: [
        { 
            label: "TikTok Viral Script", 
            platform: "TikTok", 
            hook_type: "Negativity/Fear", 
            goal: "Engagement", 
            topic: "Script a 30-second video about 'Common Gym Mistakes'. Start with a 'Stop Scrolling' hook." 
        },
        { 
            label: "Instagram Carousel (Educational)", 
            content_type: "Carousel (PDF/Image)", 
            platform: "Instagram",
            framework: "Educational", 
            topic: "Create a 5-slide breakdown of 'How to Meditate'. Slide 1 is the Hook, Slide 5 is the Save CTA." 
        },
        { 
            label: "YouTube Clickbait Title", 
            platform: "YouTube Video", 
            hook_type: "Curiosity", 
            topic: "Generate 5 high-CTR titles for a video about 'Living in a Van'. Use the 'I Survived...' syntax." 
        }
    ],

    // --- GENERAL PRESETS ---
    general: [
        { 
            label: "The 5-Year Old Explainer", 
            persona: "Physics Tutor", 
            tone: "Friendly", 
            language_style: "Simple English",
            topic: "Explain 'Black Holes' using a bathtub analogy." 
        },
        { 
            label: "Executive Summary", 
            persona: "Project Manager", 
            format: "Structured", 
            length: "Brief",
            topic: "Summarize this meeting transcript into key action items and owners: {Insert Transcript}" 
        },
        { 
            label: "Tough Interview Prep", 
            persona: "HR Specialist", 
            context: "Situation", 
            topic: "Act as a sceptical interviewer for a Senior Developer role. Ask me 3 hard questions about System Design." 
        }
    ],

    // --- ART PRESETS (Midjourney v6 Optimized) ---
    art: [
        { 
            label: "Hyper-Real Portrait", 
            genre: "Cinematic", 
            shot: "Close-up", 
            visuals: "Studio Lighting",
            tech: "8k",
            topic: "A portrait of an elderly fisherman with weathered skin, intense eyes, wearing a yellow raincoat. Rain droplets on face." 
        },
        { 
            label: "Cyberpunk Cityscape", 
            genre: "Cyberpunk", 
            environment: "Cyber City", 
            visuals: "Neon",
            topic: "A futuristic Tokyo street at night. Wet pavement reflecting neon signs. Flying cars overhead. Atmosphere is heavy and moody." 
        },
        { 
            label: "Ghibli Style Landscape", 
            style: "Studio Ghibli", 
            environment: "Nature", 
            visuals: "Pastel",
            topic: "A grassy hill with a single giant oak tree. Fluffy white clouds in a blue sky. A gentle breeze blowing the grass." 
        },
        { 
            label: "Isometric Game Asset", 
            shot: "Isometric", 
            background: "White Background", 
            topic: "A magical potion shop on a floating island. Cute low-poly style. Glowing windows." 
        }
    ],

    // --- AVATAR PRESETS ---
    avatar: [
        { 
            label: "Pixar 3D Profile", 
            avatar_style: "Pixar Style", 
            framing: "Headshot", 
            expression: "Confident", 
            background: "Gradient",
            topic: "A 3D character of a young tech wizard with blue hair." 
        },
        { 
            label: "Anime PFP", 
            avatar_style: "Anime", 
            framing: "Bust (Shoulders up)", 
            expression: "Mysterious", 
            topic: "An anime character with silver hair and glowing red eyes. Dark moody background." 
        },
        { 
            label: "Professional LinkedIn Headshot", 
            avatar_style: "Photorealistic", 
            framing: "Headshot", 
            expression: "Friendly", 
            background: "Office Blur",
            topic: "A professional photo of a woman in a navy blazer. Soft studio lighting." 
        }
    ],

    // --- VIDEO PRESETS (Runway/Pika) ---
    video: [
        { 
            label: "Cinematic Drone Shot", 
            camera_move: "Drone Flyover", 
            motion_strength: "Normal Motion", 
            aesthetics: "4k Digital Clean", 
            topic: "Sweeping aerial view of the Swiss Alps at sunrise. Golden light hitting the snow peaks." 
        },
        { 
            label: "90s VHS Horror", 
            camera_move: "Handheld Shake", 
            aesthetics: "VHS Glitch", 
            topic: "POV walking down a dark hospital hallway. Flickering lights. Grainy footage." 
        },
        { 
            label: "Slow Mo Product Reveal", 
            camera_move: "Orbit", 
            motion_strength: "Slow Motion", 
            topic: "A luxury perfume bottle spinning slowly. Water droplets splashing in slow motion." 
        }
    ]
};