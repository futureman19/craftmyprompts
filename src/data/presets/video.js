export const VIDEO_PRESETS = [
    // --- CINEMATIC STYLES ---
    { 
        label: "Cinematic Drone Shot", 
        camera_move: "Drone Flyover", 
        motion_strength: "Normal Motion", 
        aesthetics: "4k Digital Clean", 
        topic: "Sweeping aerial view of {Location} at {Time of Day}. Golden hour lighting, smooth movement, high dynamic range." 
    },
    { 
        label: "90s VHS Horror", 
        camera_move: "Handheld Shake", 
        aesthetics: "VHS Glitch", 
        topic: "POV walking through {Location}. Grainy footage, flickering lights, tracking errors, timestamp overlay in corner." 
    },
    { 
        label: "Luxury Product Showcase", 
        camera_move: "Orbit", 
        motion_strength: "Slow Motion", 
        topic: "A close up of {Product}. Elegant studio lighting, smooth rotation, water droplets, bokeh background." 
    },
    {
        label: "Hyper-Lapse Travel",
        camera_move: "Forward Zoom",
        motion_strength: "High Motion",
        aesthetics: "Time-Lapse",
        topic: "A fast-moving hyper-lapse through {City Street}. Blurring lights, moving crowds, day-to-night transition."
    },
    {
        label: "Macro Nature Doc",
        camera_move: "Static",
        motion_strength: "Subtle Motion",
        aesthetics: "Macro Lens",
        topic: "Extreme close-up of {Insect/Flower}. Tiny movements, shallow depth of field, natural sunlight."
    },

    // --- VIRAL SHORTS HOOKS (Moved from Social) ---
    { 
        label: "Hook: The Negative Warning", 
        platform: "TikTok", 
        content_type: "Short-Form Video",
        hook_type: "Negativity/Fear", 
        goal: "Engagement", 
        topic: "Script a video starting with the hook: 'Stop {Action} if you want {Goal}!' Body: Explain why this habit is destroying progress. CTA: 'Save this so you don't forget.'" 
    },
    { 
        label: "Shorts: The 'Visual Surprise'", 
        platform: "YouTube Shorts", 
        content_type: "Short-Form Video",
        hook_type: "Curiosity", 
        goal: "Viral Reach", 
        topic: "Script a video about {Topic}. Start immediately with the Final Result (0:00-0:03). Then cut to: 'Here is how I did it.' Body: Fast montage steps. CTA: Loop the ending back to the start." 
    },

    // --- YOUTUBE PACKAGING (Moved from Social) ---
    { 
        label: "YT Title: High Stakes", 
        platform: "YouTube Video", 
        content_type: "Title Generator",
        hook_type: "Negativity/Fear", 
        goal: "Viral Reach",
        topic: "Generate 5 titles about {Topic} using the syntax: 'I Survived With [Constraint]' or 'I Built The World's Largest [Object]'." 
    },
    { 
        label: "YT Title: The Authority Test", 
        platform: "YouTube Video", 
        content_type: "Title Generator",
        hook_type: "Value/Status", 
        goal: "Viral Reach",
        topic: "Generate 5 titles about {Topic} using the syntax: 'I Tested [Number] Years Of' or 'I Tried Every [Item] in [Category]'." 
    },
    { 
        label: "YT Title: Negative Warning", 
        platform: "YouTube Video", 
        content_type: "Title Generator",
        hook_type: "Negativity/Fear", 
        goal: "Viral Reach",
        topic: "Generate 5 titles about {Topic} using the syntax: 'Don't Buy [Product] Until You Watch This' or 'Never [Action], Do This Instead'." 
    }
];