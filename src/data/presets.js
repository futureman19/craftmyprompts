export const PRESETS = {
    coding: [
        { label: "React Component", task: "Write Code", lang: "React", topic: "Create a functional component named {Name} that accepts props {Props} and renders {Description}." },
        { label: "sCrypt Smart Contract", task: "Write Smart Contract", lang: "sCrypt", topic: "Create a stateful contract that requires two signatures to unlock funds." },
        { label: "Python API Endpoint", task: "Write Code", lang: "Python", topic: "Create a FastAPI endpoint for {Functionality} that accepts {Input} and returns {Output}." },
        { label: "SQL Query Optimizer", task: "Optimize", lang: "SQL", topic: "Analyze this query for performance issues and suggest indexes: {Query}." },
        { label: "Regex Generator", task: "Write Code", lang: "JavaScript", topic: "Write a regex pattern to match {Pattern_Description}." },
        { label: "Unit Tests", task: "Write Unit Tests", lang: "TypeScript", topic: "Write comprehensive tests for this function: {Function_Code}" },
        { label: "Debug Python", task: "Debug", lang: "Python", topic: "Fix the following error: {Error_Message} in this code: {Code}" }
    ],
    writing: [
        { label: "Viral LinkedIn Post", intent: "Inspire", framework: "PAS (Problem, Agitate, Solution)", topic: "Write a post about {Topic} targeting {Audience}." },
        { label: "SEO Blog Post", intent: "Inform", style: "TechCrunch Style", topic: "Write an outline for an article about {Subject} with keywords: {Keywords}." },
        { label: "Cold Email", intent: "Sell", framework: "AIDA (Attention, Interest, Desire, Action)", topic: "Write a cold email to {Prospect_Role} pitching {Product_Name}." },
        { label: "YouTube Script", intent: "Entertain", style: "BuzzFeed Style", topic: "Write a script for a video titled '{Title}'." },
        { label: "Press Release", intent: "Inform", style: "Professional", topic: "Announce the launch of {Product}." }
    ],
    general: [
        { label: "Professional Email", persona: "Project Manager", tone: "Diplomatic", topic: "Write an email to {Recipient} about {Subject}." },
        { label: "Complex Concept Explainer", persona: "Physics Tutor", tone: "Friendly", topic: "Explain {Concept} to a 5-year old." },
        { label: "Travel Itinerary", persona: "Travel Guide", tone: "Enthusiastic", topic: "Create a 3-day itinerary for {City} focused on {Interests}." },
        { label: "Meal Plan", persona: "Nutritionist", tone: "Objective", topic: "Create a weekly meal plan for {Diet_Type} diet." },
        { label: "Job Interview Prep", persona: "HR Specialist", tone: "Professional", topic: "Give me 5 tough interview questions for a {Job_Role} position." }
    ],
    art: [
        { label: "Cinematic Portrait", genre: "Cinematic", shot: "Close-up", topic: "A portrait of {Subject}, {Lighting}, highly detailed." },
        { label: "Isometric Game Asset", genre: "Modern", shot: "Isometric", topic: "A {Building_Type} on a floating island, white background." },
        { label: "Minimalist Logo", genre: "Modern", visuals: "High Contrast", topic: "A vector logo design for {Company_Name}, flat style, minimal." },
        { label: "Fantasy Landscape", genre: "Fantasy", environment: "Mountains", topic: "A sweeping view of {Place}, epic scale, 8k resolution." },
        { label: "Product Photography", genre: "Modern", visuals: "Studio Lighting", topic: "A professional shot of {Product}, sleek background." },
        { label: "Synthwave City", genre: "Vaporwave", environment: "Cyber City", topic: "A retro-futuristic city skyline at sunset." }
    ],
    avatar: [
        { label: "Pixar Style 3D", avatar_style: "Pixar Style", framing: "Headshot", expression: "Confident", topic: "A cute 3D character of {Subject}." },
        { label: "Cyberpunk PFP", avatar_style: "Cyberpunk", accessories: "VR Headset", background: "Neon City", topic: "A futuristic avatar of {Subject}." },
        { label: "Anime Profile", avatar_style: "Anime", framing: "Bust (Shoulders up)", expression: "Mysterious", topic: "An anime character of {Subject}." },
        { label: "Professional Headshot", avatar_style: "Realistic", framing: "Headshot", background: "Office Blur", topic: "A professional photo of {Subject} wearing a suit." },
        { label: "Vector Sticker", avatar_style: "Vector Flat", background: "White Background", topic: "A flat vector sticker of {Subject}." }
    ],
    video: [
        { label: "Cinematic Drone Shot", camera_move: "Drone Flyover", motion_strength: "Normal Motion", aesthetics: "4k Digital Clean", topic: "A sweeping aerial view of {Location} at sunset." },
        { label: "Vintage VHS Style", camera_move: "Handheld Shake", aesthetics: "VHS Glitch", topic: "A 90s style home video of {Subject}." }
    ]
};