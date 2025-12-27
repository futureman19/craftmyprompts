// OWNER: The Producer Agent
// PURPOSE: Video Model Specifications & Production Strategy

export const PRODUCER_BRAIN = {
    knowledge_base: "Video Production Standards",
    models: [
        {
            id: "runway-gen-2",
            label: "Runway Gen-2",
            provider: "RunwayML",
            capabilities: {
                max_duration: "4 seconds",
                extendable: true,
                strengths: "Cinematic realism, consistent lighting",
                weaknesses: "Morphing artifacts on fast motion"
            },
            best_for: "Realism, Drama, Landscapes"
        },
        {
            id: "pika-1.0",
            label: "Pika 1.0",
            provider: "Pika Labs",
            capabilities: {
                max_duration: "3 seconds",
                extendable: true,
                strengths: "Animation, fluid motion, animals",
                weaknesses: "Lower resolution on complex textures"
            },
            best_for: "Cartoons, Anime, Creatures"
        },
        {
            id: "svd-xt",
            label: "Stable Video Diffusion XT",
            provider: "Stability AI",
            capabilities: {
                max_duration: "2 seconds (25 frames)",
                extendable: false,
                strengths: "High quality loops, open source",
                weaknesses: "Very short duration, no camera controls"
            },
            best_for: "Background loops, subtle motion"
        }
    ],
    production_rules: [
        "Always specify duration within model limits.",
        "Simple motion is better than complex action.",
        "Consistency is key: Don't switch art styles mid-scene."
    ]
};
