// OWNER: The Director Agent
// PURPOSE: Cinematography, Camera Moves, and Shot Composition

export const DIRECTOR_BRAIN = {
    knowledge_base: "Cinematography & Camera Movement",
    camera_moves: [
        { label: "Static", description: "No movement. Best for subtle atmosphere." },
        { label: "Pan Left/Right", description: "Horizontal movement. Good for revealing landscapes." },
        { label: "Tilt Up/Down", description: "Vertical movement. Good for revealing height." },
        { label: "Zoom In", description: "Focuses attention on the subject." },
        { label: "Zoom Out", description: "Reveals the context/environment." },
        { label: "Truck/Tracking", description: "Moving alongside a moving subject." }
    ],
    shot_types: [
        { label: "Wide Shot", description: "Establishing the scene." },
        { label: "Medium Shot", description: "Character focus (waist up)." },
        { label: "Close Up", description: "Emotional focus (face)." },
        { label: "Macro", description: "Extreme detail (textures)." }
    ],
    lighting_setups: [
        "Golden Hour (Warm, low sun)",
        "Cyberpunk (Neon, blue/pink)",
        "Noir (High contrast, shadows)",
        "Natural (Soft, diffuse daylight)"
    ]
};
