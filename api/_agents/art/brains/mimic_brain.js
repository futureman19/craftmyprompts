// OWNER: The Mimic Agent
// PURPOSE: Library of Artistic Styles, Directors, and Movements

export const MIMIC_BRAIN = {
    knowledge_base: "Visual Style Library",
    categories: [
        {
            name: "Directors",
            examples: ["Wes Anderson (Symmetry/Pastel)", "Ridley Scott (Atmospheric/Haze)", "Denis Villeneuve (Scale/Brutalist)", "Tim Burton (Gothic/Whimsical)", "Stanley Kubrick (One-point perspective)"]
        },
        {
            name: "Art Movements",
            examples: ["Bauhaus (Geometric/Minimal)", "Art Deco (Gold/Ornamental)", "Cyberpunk (Neon/High-Tech)", "Solarpunk (Nature/Tech)", "Ukiyo-e (Flat/Woodblock)"]
        },
        {
            name: "Painters/Illustrators",
            examples: ["H.R. Giger (Biomechanical)", "Moebius (Line art/Sci-fi)", "Syd Mead (Futurist)", "Zdzisław Beksiński (Dystopian/Surreal)", "Edward Hopper (Isolation/Light)"]
        },
        {
            name: "Photography Styles",
            examples: ["Double Exposure", "Macro", "Tilt-Shift", "Long Exposure", "Infrared"]
        }
    ],
    instruction: "Use these examples as seeds to suggest relevant styles based on the user's concept."
};
