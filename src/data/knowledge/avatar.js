export const AVATAR_KNOWLEDGE = {
  // ==================================================================================
  // 6. AVATAR MODE
  // ==================================================================================

  // --- Platform ---
  "LinkedIn PFP": {
    "rule": "Professional, approachable, high trust. Smile with teeth = higher likability.",
    "mechanic": "Background should be non-distracting (blurred office or solid color).",
    "pitfall": "Selfies; use a tripod or have someone else take it."
  },
  "Twitter/X NFT": {
    "rule": "Hexagon shape support. Uniqueness/Rarity traits are status signals.",
    "mechanic": "Community signaling (Laser eyes = Crypto bull).",
    "pitfall": "Right-click save quality; needs to be high res."
  },
  "Discord Avatar": {
    "rule": "Legible at tiny sizes (circular crop).",
    "mechanic": "GIFs (Nitro) grab attention in chat lists.",
    "pitfall": "Text in image; unreadable on mobile."
  },
  "Instagram Profile": {
    "rule": "Brand recognition. Logo or Face.",
    "mechanic": "The 'Story Ring' (gradient border) draws clicks.",
    "pitfall": "Changing it too often; lose brand permanence."
  },
  "YouTube Channel Icon": {
    "rule": "Simple iconography. High contrast.",
    "mechanic": "Matches the banner art for cohesion.",
    "pitfall": "Detailed illustration; becomes a smudge at comment size."
  },
  "VRChat": {
    "rule": "Humanoid rig requirement for full-body tracking.",
    "mechanic": "'Visemes' (mouth shapes) for lip sync.",
    "pitfall": "Too many polygons (>70k) gets the avatar blocked by safety settings."
  },
  "Roblox": {
    "rule": "Blocky aesthetic (R6 or R15 rig).",
    "mechanic": "Accessories are the primary economy.",
    "pitfall": "Breaking the voxel style with high-res textures."
  },
  "Minecraft Skin": {
    "rule": "64x64 pixel grid. Strict template.",
    "mechanic": "Second layer (Hat layer) adds depth.",
    "pitfall": "Noise shading; keep colors flat and simple."
  },
  "Unity Asset": {
    "rule": "Standard T-Pose or A-Pose.",
    "mechanic": "Material slots (Albedo, Normal, Metallic).",
    "pitfall": "Unapplied transforms; messes up the rig."
  },
  "Ready Player Me": {
    "rule": "GLB format. Cross-platform compatibility.",
    "mechanic": "Facial blendshapes for expression.",
    "pitfall": "Custom clothing clipping through body."
  },
  "Company Mascot": {
    "rule": "Silhouette recognizability (e.g., Mickey Mouse ears).",
    "mechanic": "Anthropomorphism (human traits on objects) builds empathy.",
    "pitfall": "Scary/Uncanny valley; keep it stylized."
  },
  "Chatbot Avatar": {
    "rule": "Eye contact. Looks ready to listen.",
    "mechanic": "Micro-expressions (blinking, nodding) prevents 'dead stare'.",
    "pitfall": "Looking too human; creates false expectations of intelligence."
  },
  "Sticker Pack": {
    "rule": "Exaggerated emotion. Clear outline.",
    "mechanic": "Universal gestures (Thumbs up, Facepalm).",
    "pitfall": "Subtle expressions; stickers must be instant reads."
  },
  "Favicon": {
    "rule": "16x16 or 32x32 pixels. Extreme simplicity.",
    "mechanic": "Contrast against both light and dark browser tabs.",
    "pitfall": "Using the full logo; use a symbol or letter."
  },

  // --- Art Style (Avatar) ---
  "Pixar Style": {
    "rule": "Soft lighting, subsurface scattering (glowing ears), big eyes.",
    "mechanic": "The 'Bean' face shape principle.",
    "pitfall": "Realistic skin texture; Pixar skin is perfect and stylized."
  },
  "Disney Style": {
    "rule": "Hand-drawn appeal. Expressive flow.",
    "mechanic": "Squash and Stretch principles.",
    "pitfall": "Stiff poses."
  },
  "Unreal Engine 5": {
    "rule": "MetaHuman creator. Photorealism.",
    "mechanic": "Groom (hair) physics.",
    "pitfall": "Dead eyes; needs reflections."
  },
  "Low Poly": {
    "rule": "Visible polygons. Flat shading.",
    "mechanic": "Retro aesthetic (PS1 style).",
    "pitfall": "Smooth lighting groups; breaks the faceted look."
  },
  "Fortnite Style": {
    "rule": "Stylized PBR (Physically Based Rendering). Bright colors, slightly exaggerated proportions.",
    "mechanic": "No straight lines; everything has a slight curve/taper.",
    "pitfall": "Too much noise; surfaces are clean and readable."
  },
  "Studio Ghibli": {
    "rule": "See Anime. Focus on nature and food appeal."
  },
  "Vector Flat": {
    "rule": "Scalable, clean shapes. No gradients (or subtle ones).",
    "mechanic": "Corporate Memphis style (big limbs, small heads).",
    "pitfall": "Tangents; lines touching awkwardly."
  },
  "Line Art": {
    "rule": "Outline weight variation.",
    "mechanic": "Gap implied lines.",
    "pitfall": "Shaky strokes."
  },
  "Comic Book": {
    "rule": "Halftones, heavy black inks.",
    "mechanic": "Action lines.",
    "pitfall": "Coloring over the lines."
  },
  "Photorealistic": {
    "rule": "Indistinguishable from a photo.",
    "mechanic": "Imperfections (pores, peach fuzz) make it real.",
    "pitfall": "The Uncanny Valley."
  },
  "Studio Photography": {
    "rule": "Controlled lighting. Backdrop.",
    "mechanic": "Catchlights in eyes.",
    "pitfall": "Flat lighting."
  },
  "Cinematic Lighting": {
    "rule": "Dramatic mood. See Art Mode."
  },

  // --- Framing ---
  "Headshot": {
    "rule": "Shoulders up. Standard for professional profiles."
  },
  "Bust": {
    "rule": "Chest up. Classic portrait sculpture crop."
  },
  "Waist up": {
    "rule": "Standard broadcast/news crop."
  },
  "Full Body": {
    "rule": "Shows costume and posture. Necessary for fashion."
  },
  "Extreme Close-up (Eyes)": {
    "rule": "Intense emotion. The 'Sergio Leone' shot."
  },
  "Front Facing": {
    "rule": "Passport style. Confrontational or neutral."
  },
  "Profile View": {
    "rule": "Side view. Graphic and silhouette focused."
  },
  "3/4 View": {
    "rule": "The most flattering angle. Shows depth of nose and cheek."
  },
  "Looking up": {
    "rule": "Submissive or hopeful angle."
  },
  "Looking down": {
    "rule": "Dominant or introspective angle."
  },

  // --- Expression ---
  "Smiling": {
    "rule": "Duchenne smile (eyes crinkle) is genuine. Mouth-only is fake."
  },
  "Laughing": {
    "rule": "Head tilted back, eyes closed."
  },
  "Confident": {
    "rule": "Chin up, direct eye contact."
  },
  "Winking": {
    "rule": "Playful, conspiratorial."
  },
  "Excited": {
    "rule": "Wide eyes, open mouth."
  },
  "Peaceful": {
    "rule": "Soft features, relaxed jaw."
  },
  "Friendly": {
    "rule": "Slight head tilt, soft smile."
  },
  "Smirking": {
    "rule": "Asymmetrical mouth. Arrogance or flirting."
  },
  "Serious": {
    "rule": "Furrowed brow, tight lips."
  },
  "Stoic": {
    "rule": "Neutral face, no tension."
  },
  "Bored": {
    "rule": "Half-closed eyelids, hand on chin."
  },
  "Focused": {
    "rule": "Intense stare, narrowing eyes."
  },
  "Mysterious": {
    "rule": "Shadow over eyes, slight smile."
  },
  "Angry": {
    "rule": "Bared teeth, flared nostrils."
  },
  "Crying": {
    "rule": "Red eyes, tears, wet face."
  },
  "Screaming": {
    "rule": "Distorted face, visible tongue/uvula."
  },
  "Scared": {
    "rule": "Pale skin, wide eyes (sclera visible)."
  },
  "Shocked": {
    "rule": "Slack jaw, frozen pose."
  },

  // --- Accessories ---
  "Round Glasses": {
    "rule": "Intellectual, Harry Potter, Steve Jobs vibe."
  },
  "Sunglasses": {
    "rule": "Cool, detached, hiding eyes."
  },
  "Aviators": {
    "rule": "Pilot, Police, 70s style."
  },
  "VR Headset": {
    "rule": "Gamer, Futurist, Ready Player One."
  },
  "Cybernetic Eye": {
    "rule": "Sci-fi, Borg, Enhanced."
  },
  "Monocle": {
    "rule": "Aristocrat, Villain, Old money."
  },
  "Beanie": {
    "rule": "Casual, Hipster, Developer."
  },
  "Baseball Cap": {
    "rule": "Sporty, Casual, Hiding hair."
  },
  "Crown": {
    "rule": "Royalty, Leader, Ego."
  },
  "Headphones": {
    "rule": "Music lover, Gamer, Introvert."
  },
  "Cat Ears": {
    "rule": "Anime, E-girl/boy, Playful."
  },
  "Bandana": {
    "rule": "Rebel, Biker, Gang."
  },
  "Space Helmet": {
    "rule": "Astronaut, Explorer, Daft Punk."
  },
  "Freckles": {
    "rule": "Youth, Innocence, Sun-kissed."
  },
  "Scar": {
    "rule": "History, Battle, Toughness."
  },
  "Tattoo": {
    "rule": "Rebellion, Art, Commitment."
  },
  "Piercings": {
    "rule": "Punk, Alternative, Decoration."
  },
  "Beard": {
    "rule": "Masculinity, Wisdom, Hiding chin."
  },
  "Mustache": {
    "rule": "Retro, Authority, Hipster."
  },
  "Glowing Eyes": {
    "rule": "Power, Magic, Supernatural."
  },

  // --- Lighting ---
  "Three-Point Lighting": {
    "rule": "Key (Main) + Fill (Shadows) + Back (Separation). The standard."
  },
  "Rim Lighting": {
    "rule": "Light from behind. Creates a halo outline. Separates subject from background."
  },
  "Softbox": {
    "rule": "Diffused, flattering light. Wraps around the face."
  },
  "Butterfly Lighting": {
    "rule": "High frontal light. Butterfly shadow under nose. Glamour shot."
  },
  "Rembrandt": {
    "rule": "Triangle of light on the shadowed cheek. Classic/Dramatic."
  },
  "Volumetric Fog": {
    "rule": "See Visuals."
  },
  "Bioluminescence": {
    "rule": "See Visuals."
  },
  "Neon Glow": {
    "rule": "Colored light source nearby."
  },
  "Golden Hour": {
    "rule": "Sunrise/Sunset. Warm, soft, horizontal light."
  },
  "Moonlight": {
    "rule": "Cool, blue, harsh shadows (if direct)."
  },

  // --- Material (Avatar) ---
  "Subsurface Scattering": {
    "rule": "SSS. Light penetrates skin (red glow ears/fingers). Essential for realism."
  },
  "Porous Skin": {
    "rule": "Micro-texture. Prevents plastic look."
  },
  "Hyper-realistic": {
    "rule": "See Art Style."
  },
  "Scales": {
    "rule": "Reptilian/Fish texture. Specular highlights."
  },
  "Fur": {
    "rule": "Hair simulation. Softness."
  },
  "Plasticine": {
    "rule": "See Art Mode."
  },
  "Matte Plastic": {
    "rule": "Toy-like. No reflection."
  },
  "Brushed Metal": {
    "rule": "Anisotropic highlights. Robot/Armor."
  },
  "Holographic": {
    "rule": "Transparent, glitchy, blue scanlines."
  },
  "Porcelain": {
    "rule": "Smooth, white, reflective, fragile."
  },

  // --- Background ---
  "Solid Color": {
    "rule": "Graphic, clean. Pop art."
  },
  "Gradient": {
    "rule": "Soft transition. Modern UI look."
  },
  "White Background": {
    "rule": "E-commerce, Stock photo style."
  },
  "Transparent Background": {
    "rule": "PNG. Cutout. Sticker."
  },
  "Abstract Shapes": {
    "rule": "Memphis design. Motion graphics."
  },
  "Neon City": {
    "rule": "Cyberpunk. Bokeh lights."
  },
  "Forest": {
    "rule": "Nature. Calm. Green."
  },
  "Space": {
    "rule": "Stars. Nebulas. Black."
  },
  "Office": {
    "rule": "Professional. Blurred shelves."
  },
  "Gaming Room": {
    "rule": "RGB lights. Nanoleaf panels."
  },
  "Library": {
    "rule": "Books. Intelligence. Warmth."
  },
  "Beach": {
    "rule": "Relaxed. Blue/Sand."
  },
  "Sunset": {
    "rule": "Romantic. Silhouettes."
  }
};