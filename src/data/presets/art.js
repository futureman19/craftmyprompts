export const ART_PRESETS = [
    // --- GENERATIVE ART STYLES ---
    { 
        label: "Cinematic Portrait", 
        genre: "Cinematic", 
        shot: "Close-up", 
        visuals: "Studio Lighting", 
        tech: "8k", 
        topic: "A cinematic portrait of **{Subject}** looking **{Emotion}**. Highly detailed skin texture, **{Lighting_Style}** (e.g. Rim Light), bokeh background. Shot on 85mm lens." 
    },
    { 
        label: "Cyberpunk Cityscape", 
        genre: "Cyberpunk", 
        environment: "Cyber City", 
        visuals: "Neon", 
        topic: "A futuristic **{City_Name}** street at night. Wet pavement reflecting **{Neon_Color}** signs. **{Action_in_Background}**. Heavy atmosphere with rain." 
    },
    { 
        label: "Studio Ghibli Scene", 
        style: "Studio Ghibli", 
        environment: "Nature", 
        visuals: "Pastel", 
        topic: "A peaceful scene of **{Subject}** in a **{Setting}** (e.g. grassy hill). Fluffy cumulus clouds, lush greenery, gentle breeze blowing. Hand-painted style by Hayao Miyazaki." 
    },
    { 
        label: "Isometric Game Asset", 
        shot: "Isometric", 
        background: "White Background", 
        visuals: "Bright", 
        topic: "A cute low-poly **{Building_or_Object}** on a floating island. Soft lighting, clean edges, blender render style. Background: **{Background_Color}**." 
    },
    {
        label: "Dark Fantasy Concept",
        genre: "Fantasy",
        visuals: "Muted",
        style: "H.R. Giger",
        topic: "An ancient **{Creature_or_Artifact}** hidden in a **{Location}**. Foggy atmosphere, organic textures, intricate details. Style of **{Artist_Reference}**."
    },
    {
        label: "Synthwave Vaporwave",
        genre: "Vaporwave",
        visuals: "Neon",
        topic: "A retro 80s grid landscape with a **{Central_Object}**. **{Color_Palette}** (e.g. Pink/Teal) color palette, sunset in background, glitch effects."
    },

    // --- SOCIAL MEDIA VISUALS ---
    { 
        label: "Carousel: Step-by-Step", 
        platform: "Instagram", 
        content_type: "Carousel (PDF/Image)", 
        framework: "Educational", 
        goal: "Saves", 
        topic: "Create a 10-slide carousel about **{Topic}**. Slide 1: Hook promising **{Benefit}**. Slides 2-8: One step per slide. Slide 9: Result. Slide 10: CTA to **{Call_To_Action}**." 
    },
    { 
        label: "Carousel: Myth vs. Fact", 
        platform: "LinkedIn", 
        content_type: "Carousel (PDF/Image)", 
        framework: "Educational", 
        goal: "Comments/Debate", 
        topic: "Create a carousel comparing Myths vs Facts about **{Industry_Topic}**. Slide 1: 'Stop believing **{Common_Myth}**'. Slide 2: The Myth. Slide 3: The Fact. Repeat for 3 myths." 
    },
    { 
        label: "Pin: Visual SEO", 
        platform: "Pinterest", 
        content_type: "Pin", 
        goal: "Click Link", 
        topic: "Generate 5 text overlay ideas for a Pinterest Pin about **{Topic}**. The text must contain the keyword '**{Target_Keyword}**' for OCR SEO. Use high contrast colors." 
    }
];