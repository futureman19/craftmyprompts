export const SOCIAL_PRESETS = [
    // VIDEO HOOKS (Short-Form)
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
        hook_type: "Curiosity", // Maps to Archetype: Incredulity Gap
        goal: "Viral Reach", 
        topic: "Script a video about {Topic}. Start immediately with the Final Result (0:00-0:03). Then cut to: 'Here is how I did it.' Body: Fast montage steps. CTA: Loop the ending back to the start." 
    },
    
    // CAROUSELS: INSTAGRAM / LINKEDIN
    { 
        label: "Carousel: Step-by-Step", 
        platform: "Instagram", 
        content_type: "Carousel (PDF/Image)", 
        framework: "Educational", 
        goal: "Saves", // Maps to Saves
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
        goal: "Click Link", // Maps to Traffic
        topic: "Generate 5 text overlay ideas for a Pinterest Pin about {Topic}. The text must contain the keyword '{Keyword}' for OCR SEO. Use high contrast." 
    },

    // YOUTUBE PACKAGING
    { 
        label: "YT Title: High Stakes", 
        platform: "YouTube Video", 
        content_type: "Text Post", // Using Text Post as closest proxy for Title
        hook_type: "Negativity/Fear", 
        goal: "Viral Reach", // Maps to High CTR
        topic: "Generate 5 titles about {Topic} using the syntax: 'I Survived With [Constraint]' or 'I Built The World's Largest [Object]'." 
    },
    { 
        label: "YT Title: The Authority Test", 
        platform: "YouTube Video", 
        content_type: "Text Post",
        hook_type: "Value/Status", 
        goal: "Viral Reach",
        topic: "Generate 5 titles about {Topic} using the syntax: 'I Tested [Number] Years Of' or 'I Tried Every [Item] in [Category]'." 
    },
    { 
        label: "YT Title: Negative Warning", 
        platform: "YouTube Video", 
        content_type: "Text Post",
        hook_type: "Negativity/Fear", 
        goal: "Viral Reach", // Maps to Urgency
        topic: "Generate 5 titles about {Topic} using the syntax: 'Don't Buy [Product] Until You Watch This' or 'Never [Action], Do This Instead'." 
    }
];