export const ART_KNOWLEDGE = {
  // ==================================================================================
  // 4. ART MODE (Visual Intelligence)
  // ==================================================================================

  // --- Platforms ---
  "Instagram Post": {
    "rule": "The 4:5 aspect ratio (1080x1350) is mandatory for maximizing screen real estate; square (1:1) is outdated.",
    "mechanic": "High-contrast, centered subjects stop the scroll; the eye scans the center of the feed first.",
    "pitfall": "Over-cluttering the edges; UI elements (likes, comments overlay) will obscure details at the bottom and right."
  },
  "Instagram Story": {
    "rule": "Use 9:16 aspect ratio. Content must be designed to be consumed in under 3 seconds.",
    "mechanic": "'Safe Zones' are crucial; leave the top 15% and bottom 15% clear for the user interface.",
    "pitfall": "Placing text too close to the edges where it gets cropped on different phone models."
  },
  "Pinterest Pin": {
    "rule": "Verticality is king; 2:3 aspect ratio (1000x1500) performs best.",
    "mechanic": "Warm colors (red, orange, brown) get more repins than cool colors (blue, green) on Pinterest.",
    "pitfall": "Faces without context; Pinterest is aspirational/object-based, so pure portraits often underperform compared to 'scenes' or 'outfits'."
  },
  "Twitter Header": {
    "rule": "Account for the profile picture obstruction in the bottom left corner (on desktop) or center (on mobile).",
    "mechanic": "Use the right-hand side for the primary focal point or text.",
    "pitfall": "Using detailed textures that get compressed by Twitter's aggressive JPEG algorithm; stick to bold shapes."
  },
  "LinkedIn Banner": {
    "rule": "Keep it professional and uncluttered; this is your digital billboard.",
    "mechanic": "Align text to the right to avoid the profile picture overlap.",
    "pitfall": "Using a busy background that makes overlay text unreadable."
  },
  "YouTube Thumbnail": {
    "rule": "Faces must show extreme emotion (surprise, anger, joy) to drive CTR.",
    "mechanic": "High contrast and saturation are necessary to stand out against the white/dark background of YouTube.",
    "pitfall": "Placing important elements in the bottom right corner, where the 'Time Stamp' overlay covers them."
  },
  "Blog Header": {
    "rule": "Must be wide (16:9 or wider) and irrelevant details should be cropped out.",
    "mechanic": "The image should conceptually summarize the headline.",
    "pitfall": "Using generic stock photos of 'people shaking hands'; use abstract or metaphorical art instead."
  },
  "Podcast Cover": {
    "rule": "Must be legible at 50x50 pixels; test your design at thumbnail size.",
    "mechanic": "Faces build connection; a close-up of the host works better than a logo.",
    "pitfall": "Using thin fonts; they disappear on mobile screens."
  },
  "E-Book Cover": {
    "rule": "Title legibility is priority #1; the title must be readable even when the cover is thumbnail-sized on Amazon.",
    "mechanic": "Genre expectations dictate color schemas (e.g., Blue/Gold for Thrillers, Pink/Pastel for Romance).",
    "pitfall": "Designing for the print size rather than the thumbnail size."
  },
  "Poster": {
    "rule": "Use a clear visual hierarchy; the primary image draws the eye, then the title, then the details.",
    "mechanic": "Use 'Leading Lines' in the artwork to point towards the text.",
    "pitfall": "Putting text over busy backgrounds without a drop shadow or overlay."
  },
  "Wallpaper": {
    "rule": "Resolution must be high (4k+); compression artifacts are unforgivable on a static desktop.",
    "mechanic": "Leave 'Negative Space' for desktop icons (usually on the left).",
    "pitfall": "Being too bright; blinding white wallpapers cause eye strain."
  },
  "Sticker": {
    "rule": "Needs a strong, thick white (or contrasting) outline (Die Cut stroke) to separate it from any surface.",
    "mechanic": "Vector-style simplicity works best; details get lost when printed small.",
    "pitfall": "Fading edges; stickers need defined boundaries."
  },
  "T-Shirt Design": {
    "rule": "Limit the color palette if using screen printing (cost reduction).",
    "mechanic": "The design should sit on the chest, not the belly.",
    "pitfall": "Large solid blocks of ink (sweat patches); use halftones or negative space for breathability."
  },

  // --- Composition ---
  "Rule of Thirds": {
    "rule": "Place points of interest on the intersections of the 3x3 grid, not in the center.",
    "mechanic": "This creates 'tension' and interest, whereas centering feels static.",
    "pitfall": "Putting the horizon line dead center; move it to the top or bottom third."
  },
  "Golden Ratio": {
    "rule": "Use the Phi grid (1.618) to create a natural, organic flow.",
    "mechanic": "The 'Spiral' guides the eye from the outer edge into the detailed center.",
    "pitfall": "Forcing the spiral overlay on an image where it doesn't fit; it should feel natural, not mathematical."
  },
  "Symmetrical": {
    "rule": "Both sides of the image must be mirror images (or near-mirrors).",
    "mechanic": "Ideal for religious, authoritarian, or 'Wes Anderson' style aesthetics to convey order.",
    "pitfall": "Imperfect symmetry; if it's slightly off, it looks like a mistake."
  },
  "Knolling": {
    "rule": "Objects must be arranged at 90-degree angles in a flat-lay composition.",
    "mechanic": "Negative space is as important as the objects; ensure distinct separation to create the 'clean' aesthetic.",
    "pitfall": "Overlapping items destroys the grid effect."
  },
  "Fibonacci Spiral": {
    "rule": "A specific application of the Golden Ratio where the focal point is the tightest part of the curl.",
    "mechanic": "Great for nature shots (shells, flowers, galaxies).",
    "pitfall": "Using it for rigid architectural shots where lines are straight."
  },
  "Isometric": {
    "rule": "3D representation without perspective foreshortening; parallel lines never converge.",
    "mechanic": "Ideally viewed from a 30-degree angle; popular in strategy games and tech illustrations.",
    "pitfall": "Adding vanishing points; isometric art must remain parallel."
  },
  "One-Point Perspective": {
    "rule": "All lines converge to a single vanishing point on the horizon.",
    "mechanic": "Creates a sense of depth and focus; like looking down a tunnel or road.",
    "pitfall": "Placing the vanishing point off-canvas; it disorients the viewer."
  },
  "Birds-Eye View": {
    "rule": "Camera looks directly down (90 degrees); map-like perspective.",
    "mechanic": "Eliminates depth, emphasizing pattern and layout.",
    "pitfall": "Seeing the sides of buildings; true birds-eye only sees roofs."
  },
  "Worm-Eye View": {
    "rule": "Camera looks up from the ground level.",
    "mechanic": "Makes the subject look dominant, powerful, or terrifying.",
    "pitfall": "Losing the subject against a bright sky; watch exposure settings."
  },
  "T-Pose": {
    "rule": "Character stands with arms straight out horizontally.",
    "mechanic": "Essential for 3D modeling and rigging references.",
    "pitfall": "Using it for final art; it looks stiff and unnatural (unless that's the goal)."
  },

  // --- Material ---
  "Voxel Art": {
    "rule": "Everything is built from 3D cubes (volumetric pixels).",
    "mechanic": "Lighting is crucial to define the edges of the cubes; avoid flat lighting.",
    "pitfall": "Rotating pixels; in true voxel art, the grid is absolute."
  },
  "Claymation": {
    "rule": "Surfaces should show fingerprints and imperfections to sell the 'handmade' look.",
    "mechanic": "Lighting should be soft and physical; subsurface scattering is key for the clay texture.",
    "pitfall": "Making it too smooth; it ends up looking like bad CGI plastic."
  },
  "Plasticine": {
    "rule": "Similar to clay but smoother and slightly more oily/shiny.",
    "mechanic": "Colors should be vibrant and unmixed.",
    "pitfall": "Sharp edges; plasticine naturally rounds off."
  },
  "Origami": {
    "rule": "Every shape must theoretically be foldable from a single sheet.",
    "mechanic": "Paper texture (grain) and crease lines add realism.",
    "pitfall": "Impossible geometry; intersecting planes that couldn't exist in paper."
  },
  "Paper Cutout": {
    "rule": "Flat layers stacked with drop shadows to create depth.",
    "mechanic": "Slight misalignment adds charm.",
    "pitfall": "Consistent lighting; shadows must all fall in the same direction to sell the 'stack'."
  },
  "Knitted": {
    "rule": "The texture is a loop pattern; you must see the individual yarn strands.",
    "mechanic": "Fuzz and stray fibers (flyaways) add realism.",
    "pitfall": "The pattern looking like a flat texture map rather than 3D loops."
  },
  "Felt": {
    "rule": "Fuzzy, matted texture with no visible weave.",
    "mechanic": "Edges should be soft and fuzzy, not sharp.",
    "pitfall": "Making it look like velvet (shiny); felt is matte."
  },
  "Oil Impasto": {
    "rule": "Thick, visible brushstrokes that cast their own shadows.",
    "mechanic": "The texture is 3D; the paint sits *on* the canvas.",
    "pitfall": "Flatness; impasto is about the topography of the paint."
  },
  "Charcoal": {
    "rule": "High contrast, messy, and smudged.",
    "mechanic": "Use the 'paper grain' texture; charcoal skips over the valleys of the paper.",
    "pitfall": "Clean lines; charcoal is inherently dusty and broad."
  },
  "Watercolor": {
    "rule": "Transparency; layers should show through each other.",
    "mechanic": "'Wet-on-wet' bleeds and hard 'dried edges' define the medium.",
    "pitfall": "Opaque white; in watercolor, white is just the unpainted paper."
  },
  "Ink Wash": {
    "rule": "Monochromatic values controlled by water dilution.",
    "mechanic": "Focus on flow and spontaneity; mistakes are part of the art.",
    "pitfall": "Overworking; ink wash relies on confident, singular strokes."
  },
  "Marble": {
    "rule": "Subsurface scattering is vital; light penetrates the stone slightly.",
    "mechanic": "Veins should look organic and fractal, not painted on.",
    "pitfall": "Looking like plastic; marble has a specific cold, hard weight."
  },
  "Bronze": {
    "rule": "Metallic reflection with 'Patina' (oxidation) in the crevices.",
    "mechanic": "Specular highlights are sharp but the metal is dark.",
    "pitfall": "Making it look like gold; bronze is redder/browner and duller."
  },
  "Liquid Metal": {
    "rule": "High reflection (Chrome) and fluid dynamics.",
    "mechanic": "The environment map is the most important part; the metal only looks real if it reflects a detailed world.",
    "pitfall": "Dark environments; chrome needs light to reflect."
  },

  // --- Genre ---
  "Fantasy": {
    "rule": "Establish the magic system visually (runes, glowing artifacts).",
    "mechanic": "Scale is used to convey wonder (tiny human, giant castle).",
    "pitfall": "Generic 'Medieval'; add unique fantastical elements to separate it from history."
  },
  "Adventure": {
    "rule": "The composition should suggest forward movement or a destination.",
    "mechanic": "Earthy tones and natural lighting suggest 'exploration'.",
    "pitfall": "Static characters; they should be in action or looking at a horizon."
  },
  "Modern": {
    "rule": "Clean lines, minimalism, and functional design.",
    "mechanic": "Neutral color palettes with bold accent colors.",
    "pitfall": "Clutter; modernism is about reduction."
  },
  "Horror": {
    "rule": "What you *don't* see is scarier; use shadow and obscurity.",
    "mechanic": "'The Uncanny Valley'—things that are almost human but not quite—triggers instinctual fear.",
    "pitfall": "Over-lighting; horror dies in bright light."
  },
  "Cinematic": {
    "rule": "Aspect ratio 2.35:1 (Letterbox) and dramatic lighting.",
    "mechanic": "Color grading (Teal and Orange) separates subject from background.",
    "pitfall": "Flat lighting; cinematic looks require high dynamic range."
  },
  "Futuristic": {
    "rule": "Sleek surfaces, glass, and integrated technology.",
    "mechanic": "Functionality; the tech should look like it actually works.",
    "pitfall": "Just adding neon; futuristic can also be 'Solarpunk' or sterile white."
  },
  "Romantic": {
    "rule": "Soft focus, warm lighting, and intimacy.",
    "mechanic": "Blush tones and hazy backlighting (halo effect).",
    "pitfall": "Cheese; avoid clichés like literal hearts floating around."
  },
  "Western": {
    "rule": "Harsh sunlight, long shadows, and grit.",
    "mechanic": "The landscape is a character; the vastness of the desert vs. the individual.",
    "pitfall": "Clean clothes; everything in a western should be dusty."
  },
  "Thriller": {
    "rule": "High tension, Dutch angles, and cold colors (blues/greens).",
    "mechanic": "Information asymmetry; the viewer sees the danger before the character.",
    "pitfall": "Confusion; the threat must be clear even if hidden."
  },
  "Cyberpunk": {
    "rule": "'High Tech, Low Life'. Neon lights amidst urban decay.",
    "mechanic": "Wet streets reflect the neon, doubling the visual data.",
    "pitfall": "Clean cities; Cyberpunk is dystopian, dirty, and crowded."
  },
  "Sci-Fi": {
    "rule": "Sense of scale and advanced technology.",
    "mechanic": "'Greebling' (adding complex surface detail) makes ships look massive.",
    "pitfall": "Violating physics without explanation."
  },
  "Noir": {
    "rule": "Chiaroscuro (extreme light and dark contrast).",
    "mechanic": "Venetion blind shadows and smoke are genre staples.",
    "pitfall": "Color; true Noir is B&W, or very muted."
  },
  "Steampunk": {
    "rule": "Victorian era aesthetics + Steam power (Brass, Gears, Leather).",
    "mechanic": "Analog tech; no screens, only dials and gauges.",
    "pitfall": "Gluing gears on things randomly; the gears should look functional."
  },
  "Dystopian": {
    "rule": "Oppressive atmosphere, brutalist architecture, and decay.",
    "mechanic": "Muted, desaturated colors reflect the loss of hope.",
    "pitfall": "Making it look 'cool' instead of oppressive."
  },
  "Surrealism": {
    "rule": "Dream logic; juxtaposition of unrelated objects.",
    "mechanic": "Realistic rendering of unrealistic subjects heightens the unease.",
    "pitfall": "Randomness; good surrealism has a subconscious narrative."
  },
  "Pop Art": {
    "rule": "Bold outlines, Halftone dots, and saturated primary colors.",
    "mechanic": "Repetition and commercial imagery (soup cans, celebrities).",
    "pitfall": "Subtle shading; Pop Art is flat and graphic."
  },
  "Ukiyo-e": {
    "rule": "Woodblock print aesthetic; thick outlines and flat colors.",
    "mechanic": "Lack of shadows; depth is conveyed by layering and size.",
    "pitfall": "Western perspective; use isometric or parallel perspective."
  },
  "Vaporwave": {
    "rule": "80s/90s nostalgia, pastel neons, and glitch artifacts.",
    "mechanic": "Classical statues mixed with early computer graphics.",
    "pitfall": "Too high res; it needs that lo-fi VHS fuzz."
  },
  "Gothic": {
    "rule": "Verticality, pointed arches, and ornamentation.",
    "mechanic": "Atmosphere of melancholy and decay.",
    "pitfall": "Confusing with 'Emo'; Gothic is an architectural and literary history, not just black clothes."
  },
  "Ethereal": {
    "rule": "Light, airy, and divine.",
    "mechanic": "Overexposure and bloom effects create a 'heavenly' glow.",
    "pitfall": "Heavy contrast; keep the values light and soft."
  },

  // --- Environment ---
  "Plains": {
    "rule": "The horizon line is the dominant feature.",
    "mechanic": "The sky is 2/3 of the image; interesting clouds are mandatory.",
    "pitfall": "Empty foreground; use grass or rocks to give scale."
  },
  "Mountains": {
    "rule": "Atmospheric perspective (haze) is needed to show massive scale.",
    "mechanic": "Layers; foreground trees, mid-ground ridges, background peaks.",
    "pitfall": "Making the peak too sharp/pointy; real mountains have mass."
  },
  "Ocean": {
    "rule": "The water surface reflects the sky.",
    "mechanic": "Subsurface scattering in wave crests (green/blue light).",
    "pitfall": "A flat blue plane; water has texture, foam, and transparency."
  },
  "Lake": {
    "rule": "Stillness and reflection.",
    "mechanic": "The reflection is usually darker than the reality.",
    "pitfall": "Ripples without a source; if the air is still, the water is glass."
  },
  "Forest": {
    "rule": "Light shafts (God Rays) breaking through the canopy.",
    "mechanic": "Chaos; forests are messy with undergrowth, not clean floors.",
    "pitfall": "Uniform tree placement; trees grow in clusters."
  },
  "Desert": {
    "rule": "Dunes have a sharp edge (shadow side vs light side).",
    "mechanic": "Heat haze distorts the distance.",
    "pitfall": "Flat sand; wind creates ripples and patterns."
  },
  "Snowy Tundra": {
    "rule": "Snow is not white; it's blue (skylight shadow) and yellow (sunlight).",
    "mechanic": "Subsurface scattering makes snow look soft.",
    "pitfall": "Pure white burnout; you lose all texture detail."
  },
  "Jungle": {
    "rule": "Density; you shouldn't see far.",
    "mechanic": "Humidity; everything is wet, shiny, and misty.",
    "pitfall": "Sunlight hitting the floor; true jungles have a thick canopy blocking the sun."
  },
  "Cave": {
    "rule": "Single light source (entry or bioluminescence).",
    "mechanic": "Rock texture needs specular highlights (wetness).",
    "pitfall": "Ambient light; caves are pitch black without a source."
  },
  "Volcano": {
    "rule": "Contrast between cool dark rock and hot bright lava.",
    "mechanic": "Smoke and ash clouds obscure the top.",
    "pitfall": "Lava looking like red water; it is viscous and heavy."
  },
  "Underwater": {
    "rule": "Blue cast increases with depth (red light is absorbed first).",
    "mechanic": "Caustics (light patterns) on the floor and subject.",
    "pitfall": "Crystal clear water; real water has particulate matter (turbidity)."
  },
  "City Skyline": {
    "rule": "Variety in building height and lighting.",
    "mechanic": "Atmospheric haze separates the foreground buildings from the back.",
    "pitfall": "Dead windows; buildings need internal lights to look alive."
  },
  "Abandoned Building": {
    "rule": "Nature reclaiming structure (moss, vines).",
    "mechanic": "Dust motes in the air catch the light.",
    "pitfall": "Just looking dirty; it needs structural damage and debris."
  },
  "Cyber City": {
    "rule": "Verticality and density; layers upon layers of infrastructure.",
    "mechanic": "Holographic ads provide the primary light sources.",
    "pitfall": "Darkness; a cyber city is polluted with light."
  },
  "Laboratory": {
    "rule": "Sterile, cold lighting (fluorescent).",
    "mechanic": "Glassware and reflections add complexity.",
    "pitfall": "Looking cozy; labs are functional and hard."
  },
  "Castle": {
    "rule": "Defensive architecture (battlements, thick walls).",
    "mechanic": "Weathering; stone stains over centuries.",
    "pitfall": "Fairy tale perfection; real castles are rugged forts."
  },
  "Library": {
    "rule": "Repetition of books creates texture.",
    "mechanic": "Dust and warm lighting (old paper smell).",
    "pitfall": "Tiling textures for books; vary the colors and sizes."
  },
  "Space Station": {
    "rule": "Stark contrast between sun-side (blind white) and shadow-side (black).",
    "mechanic": "Earth glow (blue bounce light) from below.",
    "pitfall": "Stars visible near the sun; exposure settings would hide them."
  },
  "Coffee Shop": {
    "rule": "Warm, inviting, amber lighting.",
    "mechanic": "Clutter implies life (cups, laptops, steam).",
    "pitfall": "Clinical cleanliness; it should feel 'lived in'."
  },
  "Museum": {
    "rule": "Directed spotlights on exhibits, dark ambient.",
    "mechanic": "Reflections on protective glass cases.",
    "pitfall": "Crowds; museums feel more reverent when empty."
  },

  // --- Visual Style (Directors & Artists) ---
  "Wes Anderson": {
    "rule": "Extreme symmetry and a limited, pastel color palette (pinks, yellows, teals) are non-negotiable.",
    "mechanic": "Use 'flat lay' compositions for objects and deadpan, center-frame blocking for characters.",
    "pitfall": "Using handheld camera movement; Anderson's world is rigidly controlled, static, or moves on perfect rails."
  },
  "Tim Burton": {
    "rule": "Gothic whimsicality; distorted shapes, spindly limbs, and high contrast black-and-white stripes.",
    "mechanic": "'German Expressionism' influence—architecture should look like it's looming or twisting.",
    "pitfall": "Making it too scary; Burton's style is 'spooky-cute' or macabre, not terrifying gore."
  },
  "Christopher Nolan": {
    "rule": "Practical effects over CGI; the image should feel grounded, gritty, and textured.",
    "mechanic": "Massive scale; characters are often small against gargantuan, rotating, or complex environments (IMAX framing).",
    "pitfall": "Oversaturation; Nolan's palettes are often muted, metallic, and cold."
  },
  "Quentin Tarantino": {
    "rule": "The 'Trunk Shot' (looking up from below) and extreme close-ups of specific actions (feet, lips, hands).",
    "mechanic": "Violence is stylized and colorful, almost operatic.",
    "pitfall": "Digital smoothness; his look relies on the grain and texture of 35mm film."
  },
  "Stanley Kubrick": {
    "rule": "One-point perspective is the signature; lines leading to a single center point.",
    "mechanic": "'The Kubrick Stare'—head down, eyes up—conveys intensity or madness.",
    "pitfall": "Clutter; his sets are often sterile, organized, and unsettlingly clean."
  },
  "Denis Villeneuve": {
    "rule": "Brutalist architecture and atmospheric haze; scale is conveyed through massive, monolithic shapes.",
    "mechanic": "Monochromatic color grading (often orange or grey) unifies the visual language.",
    "pitfall": "Busy compositions; Villeneuve relies on negative space and silence."
  },
  "Hayao Miyazaki": {
    "rule": "Lush, hyper-detailed nature backgrounds (clouds, grass) contrasted with simpler character designs.",
    "mechanic": "'Ma' (Emptiness)—moments of quiet stillness where nothing happens, just wind blowing.",
    "pitfall": "Making the machinery look sleek; Miyazaki tech is clunky, riveted, and smokes."
  },
  "Steven Spielberg": {
    "rule": "The 'Spielberg Face'—a slow dolly-in on a character's face looking off-screen in awe/horror.",
    "mechanic": "Backlighting and beams of light (God Rays) create a sense of wonder.",
    "pitfall": "Cynicism; the visual tone is usually earnest and emotional."
  },
  "Ridley Scott": {
    "rule": "Atmosphere is key; smoke, rain, fans, and shafts of light cutting through darkness.",
    "mechanic": "High density of visual information; every frame is packed with detail ('Greebling').",
    "pitfall": "Flat lighting; Scott's world is high contrast and sweaty."
  },
  "George Lucas": {
    "rule": "'Used Universe' aesthetic; technology should look dirty, chipped, and lived-in.",
    "mechanic": "Wide shots establish the world geography clearly before action begins.",
    "pitfall": "Over-designing; the silhouettes of ships/characters should be recognizable instantly."
  },
  "David Fincher": {
    "rule": "LOCKED off camera or perfectly smooth, robotic movement; no handheld shake.",
    "mechanic": "Low light and yellow/green color grading (sodium vapor streetlights).",
    "pitfall": "Shadows being too bright; Fincher crushes the blacks to hide information."
  },
  "Greta Gerwig": {
    "rule": "Warmth and intimacy; frames often feel like paintings or stage plays.",
    "mechanic": "Color is narrative; specific hues define character arcs (e.g., Pink in Barbie).",
    "pitfall": "Coldness; her style prioritizes emotional connection and human messiness."
  },
  "Guillermo del Toro": {
    "rule": "Clockwork mechanisms and amber/cyan color contrast.",
    "mechanic": "Sympathy for the monster; creatures are designed with beauty and nobility, not just horror.",
    "pitfall": "Generic environments; his sets are cluttered with occult textures and curiosities."
  },
  "Akira Kurosawa": {
    "rule": "Weather as character; heavy rain, wind, or fog often dominates the frame.",
    "mechanic": "Movement in the background; even in static dialogue scenes, something (flags, trees) is moving behind the actors.",
    "pitfall": "Static compositions; Kurosawa uses movement to dictate the edit."
  },
  "Van Gogh": {
    "rule": "Visible, swirling brushstrokes (Impasto) that follow the form of the object.",
    "mechanic": "Complementary colors (Blue/Orange) placed side-by-side create 'vibration'.",
    "pitfall": "Blending colors; the strokes must remain distinct and unmixed."
  },
  "Picasso": {
    "rule": "Cubism; showing multiple angles of the same object simultaneously (profile and front view).",
    "mechanic": "Fragmentation of form into geometric shards.",
    "pitfall": "Attempting 3D depth; the aesthetic is aggressively flat."
  },
  "Salvador Dali": {
    "rule": "The 'Paranoiac-critical method'; objects that look like one thing but form another image.",
    "mechanic": "Melting or soft forms in a rigid landscape (dream logic).",
    "pitfall": "Randomness; Dali's surrealism is hyper-realistic in its rendering technique."
  },
  "Monet": {
    "rule": "Focus on light and atmosphere, not form; edges should be soft and indistinct.",
    "mechanic": "No black paint; shadows are painted with purples and blues.",
    "pitfall": "sharp details; Impressionism is about the *effect* of light on the eye."
  },
  "Rembrandt": {
    "rule": "'Chiaroscuro'—the dramatic contrast between light and dark.",
    "mechanic": "The 'Triangle of Light' on the shadowed side of the face is the signature portrait technique.",
    "pitfall": "Lighting the background; the background should fade into a warm, dark void."
  },
  "Greg Rutkowski": {
    "rule": "Digital painterly style with a focus on epic fantasy lighting.",
    "mechanic": "Use of 'Rim Light' to separate figures from chaotic backgrounds.",
    "pitfall": "Smoothness; his style mimics traditional oil painting brushwork."
  },
  "H.R. Giger": {
    "rule": "'Biomechanical'; the fusion of organic flesh and industrial tubing/metal.",
    "mechanic": "Sexual undercurrents; the imagery is often reproductive or phallic in nature, disturbing but elegant.",
    "pitfall": "distinct separation between flesh and machine; they must blend seamlessly."
  },
  "Simon Stålenhag": {
    "rule": "1980s Swedish suburbia meets high-tech mystery.",
    "mechanic": "Atmospheric mist and dull, overcast lighting ground the sci-fi elements in reality.",
    "pitfall": "Action poses; his art is usually quiet, showing the aftermath or the mundane."
  },
  "Beeple": {
    "rule": "Overwhelming detail, pop culture remixes, and grotesque satire.",
    "mechanic": "Cinema 4D 'Kitbashing' aesthetic—highly detailed assets jammed together.",
    "pitfall": "Subtle lighting; Beeple uses bright, neon, iridescent renders."
  },
  "Makoto Shinkai": {
    "rule": "Hyper-realistic lighting effects (lens flares, reflections) in an anime style.",
    "mechanic": "The sky is the main character; massive, detailed cloud formations.",
    "pitfall": "Flat backgrounds; every background is a painting in itself."
  },
  "Leonardo da Vinci": {
    "rule": "'Sfumato'—soft, smoky transitions between colors; no harsh outlines.",
    "mechanic": "Anatomical correctness based on dissection and observation.",
    "pitfall": "Static poses; he sought to capture the 'motions of the mind' through gesture."
  },
  "Michelangelo": {
    "rule": "Sculptural weight; figures look like painted statues with exaggerated musculature.",
    "mechanic": "'Cangiante'—using bright, shifting colors (like orange to green) to depict light/shadow instead of black.",
    "pitfall": "Soft bodies; everyone is ripped, even the babies."
  },
  "Andy Warhol": {
    "rule": "High contrast, silk-screen texture, and misaligned color layers.",
    "mechanic": "Repetition of the same image with varied neon palettes.",
    "pitfall": "Realistic shading; the image should look like a mass-produced print."
  },
  "Banksy": {
    "rule": "Stencil art aesthetic; sharp edges and limited color (Black, White, Red).",
    "mechanic": "Context is key; the art interacts with the environment (wall texture, street debris).",
    "pitfall": "Complexity; the message must be readable in a drive-by."
  },
  "Basquiat": {
    "rule": "Neo-expressionism; chaotic mix of text, skulls, and crowns.",
    "mechanic": "Primitive, aggressive brushwork that looks like graffiti.",
    "pitfall": "Polished composition; it needs to feel raw, urgent, and manic."
  },
  "Frida Kahlo": {
    "rule": "Unflinching self-portraiture featuring traditional Mexican motifs.",
    "mechanic": "Surreal symbolism (roots, veins, monkeys) connecting the body to the earth.",
    "pitfall": "Beautification; she painted her pain, unibrow, and mustache unapologetically."
  },
  "Katsushika Hokusai": {
    "rule": "'The Great Wave' style; fractal-like repetition of shapes (claws of foam).",
    "mechanic": "Prussian Blue is the dominant pigment.",
    "pitfall": "Western perspective; use flat layering to show depth."
  },

  // --- Camera ---
  "8mm": {
    "rule": "Low resolution and low frame rate (16-18fps) are essential.",
    "mechanic": "Light leaks and dust scratches are features, not bugs.",
    "pitfall": "Too much dynamic range; 8mm blows out highlights easily."
  },
  "16mm": {
    "rule": "Significant film grain, but sharper than 8mm.",
    "mechanic": "Often associated with indie cinema and documentaries; feels 'raw' but professional.",
    "pitfall": "perfectly stable footage; 16mm cameras were often handheld."
  },
  "35mm": {
    "rule": "The industry standard; fine grain, good dynamic range.",
    "mechanic": "Depth of field control is superior to smaller formats.",
    "pitfall": "Making it look digital; keep the subtle chemical noise."
  },
  "70mm": {
    "rule": "Ultra-high resolution and wide aspect ratio.",
    "mechanic": "Incredible depth and clarity; used for epics (Lawrence of Arabia).",
    "pitfall": "Using it for intimate, small rooms; it demands vistas."
  },
  "Super 8mm": {
    "rule": "Similar to 8mm but with a slightly larger frame area.",
    "mechanic": "The quintessential 'Home Movie' nostalgia look.",
    "pitfall": "Clean edges; the sprocket holes are often visible."
  },
  "IMAX": {
    "rule": "Tall aspect ratio (1.43:1) and overwhelming detail.",
    "mechanic": "Shallow depth of field due to the massive sensor size.",
    "pitfall": "Quick cuts; the screen is too big for fast editing."
  },
  "VHS": {
    "rule": "Color bleeding (Chroma shift) and scanlines are mandatory.",
    "mechanic": "'Tracking' distortion at the bottom of the frame adds authenticity.",
    "pitfall": "High definition; VHS is effectively 240p resolution."
  },
  "Polaroid": {
    "rule": "Square format with the iconic white border.",
    "mechanic": "Soft focus and washed-out colors due to instant chemical development.",
    "pitfall": "High contrast; Polaroids have a specific muddy, soft contrast curve."
  },
  "Kodak Portra 400": {
    "rule": "The gold standard for skin tones; warm yellow/red bias.",
    "mechanic": "Handles overexposure beautifully; bright scenes look creamy, not blown out.",
    "pitfall": "Cool tones; Portra is inherently warm."
  },
  "28mm": {
    "rule": "Wide angle but minimal distortion.",
    "mechanic": "Great for environmental portraits where you want context.",
    "pitfall": "Getting too close to faces; causes slight bulbous distortion."
  },
  "35mm Lens": {
    "rule": "The 'Human Eye' field of view equivalent.",
    "mechanic": "The most versatile storytelling lens; feels natural and unbiased.",
    "pitfall": "Lack of drama; it doesn't compress or expand space aggressively."
  },
  "50mm": {
    "rule": "The 'Nifty Fifty'; zero distortion.",
    "mechanic": "Standard portrait lens that flatters the face without flattening it.",
    "pitfall": "Boring composition; you have to move your feet to frame, not zoom."
  },
  "85mm": {
    "rule": "Mild telephoto; compresses the background slightly.",
    "mechanic": "The 'Beauty Lens'; slims the face and blurs the background beautifully.",
    "pitfall": "Needing too much space; hard to use indoors."
  },
  "100mm": {
    "rule": "Macro territory.",
    "mechanic": "Flattens features completely; good for beauty shots, bad for showing environment.",
    "pitfall": "Shake; long lenses amplify hand movement."
  },
  "Macro Lens": {
    "rule": "Focus distance is inches away.",
    "mechanic": "Depth of field is razor-thin (millimeters); focus stacking is often needed.",
    "pitfall": "Blocking your own light; you are very close to the subject."
  },
  "Wide Angle": {
    "rule": "Expands space; makes rooms look bigger.",
    "mechanic": "Exaggerates distance between foreground and background.",
    "pitfall": "Distortion at the edges; people in the corners will look stretched."
  },
  "Fisheye": {
    "rule": "180-degree view with extreme barrel distortion.",
    "mechanic": "Associated with skate videos and 90s music videos.",
    "pitfall": "Using it for serious portraiture; it turns faces into caricatures."
  },
  "Tilt-Shift": {
    "rule": "Manipulates the plane of focus.",
    "mechanic": "Makes real cities look like miniature toys ('Miniature Faking').",
    "pitfall": "Blurring the wrong axis; the blur should be top and bottom to create the toy effect."
  },

  // --- Shots ---
  "Aerial View": {
    "rule": "Taken from aircraft or high drone.",
    "mechanic": "Flattens the topography into a map.",
    "pitfall": "lack of a focal point; patterns become the subject."
  },
  "Close-up": {
    "rule": "Shoulders to top of head.",
    "mechanic": "Captures emotion and reaction.",
    "pitfall": "Cutting off the chin; usually, you crop the forehead, not the chin."
  },
  "Extreme Close-up": {
    "rule": "A specific detail (eye, mouth, trigger finger).",
    "mechanic": "Creates intense intimacy or tension.",
    "pitfall": "Confusion; the viewer must know what they are looking at instantly."
  },
  "Crowd Shot": {
    "rule": "Multiplicity.",
    "mechanic": "Uses 'pattern breaking' (one person looking at camera) to create a focal point.",
    "pitfall": "Uniformity; crowds need variety to look real."
  },
  "Establishing Shot": {
    "rule": "Wide shot showing the location and time of day.",
    "mechanic": "Sets the mood before the scene begins.",
    "pitfall": "Boring angles; even an establishing shot needs composition."
  },
  "Low Angle": {
    "rule": "Camera looks up at subject.",
    "mechanic": "Makes subject look powerful, dominant, or heroic.",
    "pitfall": "Showing up the nose; be careful with nostrils."
  },
  "High Angle": {
    "rule": "Camera looks down at subject.",
    "mechanic": "Makes subject look weak, vulnerable, or small.",
    "pitfall": "Flattening the depth; use props to show height."
  },
  "Over-the-shoulder": {
    "rule": "Includes the back of one character's head/shoulder.",
    "mechanic": "Establishes the relationship and spatial connection between two people.",
    "pitfall": "Blocking too much; the shoulder is a frame, not a wall."
  },
  "Handheld": {
    "rule": "Subtle camera shake adds realism/urgency.",
    "mechanic": "'Breathing' cam; even when still, a human operator drifts slightly.",
    "pitfall": "Motion sickness; too much shake is unwatchable."
  },
  "Drone Shot": {
    "rule": "Smooth, gliding motion.",
    "mechanic": "Can go where helicopters can't (through windows, under bridges).",
    "pitfall": "Propeller shadows; watch the sun angle."
  },
  "Isometric (Shot)": {
    "rule": "See 'Isometric' in Composition. High angle, parallel lines."
  },

  // --- Visuals ---
  "Cool-toned": {
    "rule": "Blues, Cyans, Greens.",
    "mechanic": "Evokes sadness, isolation, or technology.",
    "pitfall": "Making skin look dead; protect skin tones from the color grade."
  },
  "Pastel": {
    "rule": "Low saturation, high brightness.",
    "mechanic": "Associated with innocence, spring, or Wes Anderson.",
    "pitfall": "Looking washed out; you still need black levels for contrast."
  },
  "Bright": {
    "rule": "High exposure, high key.",
    "mechanic": "Optimistic and energetic.",
    "pitfall": "Clipping highlights; pure white has no data."
  },
  "Vibrant": {
    "rule": "High saturation.",
    "mechanic": "Attention-grabbing; used in advertising and pop art.",
    "pitfall": "Color bleeding; colors vibrating against each other causing eye strain."
  },
  "Muted": {
    "rule": "Low saturation, grey undertones.",
    "mechanic": "Realistic, gritty, or depressive.",
    "pitfall": "Boring; use lighting contrast to make up for lack of color contrast."
  },
  "Neon": {
    "rule": "Emissive light sources in the frame.",
    "mechanic": "Requires a dark environment to glow.",
    "pitfall": "Flat neon; neon tubes cast colored light on surroundings."
  },
  "Warm": {
    "rule": "Oranges, Reds, Yellows.",
    "mechanic": "Comfort, nostalgia, or heat.",
    "pitfall": "Making it look like a sepia filter; keep color separation."
  },
  "Duotone": {
    "rule": "Image composed of only two contrasting colors.",
    "mechanic": "Graphic design style; Spotify playlist cover aesthetic.",
    "pitfall": "Choosing colors with similar values; you need a light and a dark."
  },
  "Monochrome": {
    "rule": "Shades of a single hue.",
    "mechanic": "Forces focus on texture and composition.",
    "pitfall": "Flatness; without color contrast, value contrast is everything."
  },
  "Sepia": {
    "rule": "Brown/Red tint.",
    "mechanic": "Code for 'Old West' or 'Flashback'.",
    "pitfall": "Overuse; it's a cliché if not motivated by the era."
  },
  "High Contrast": {
    "rule": "Deep blacks, bright whites.",
    "mechanic": "'Crushed blacks' hide messiness.",
    "pitfall": "Loss of mid-tone detail."
  },
  "Bokeh": {
    "rule": "Out-of-focus background blur.",
    "mechanic": "The shape of the bokeh balls depends on the lens aperture blades.",
    "pitfall": "Distracting bokeh; if the background is too busy, blur makes it messy."
  },
  "Depth of Field": {
    "rule": "The zone of sharpness.",
    "mechanic": "Shallow DOF isolates the subject; Deep DOF shows the world.",
    "pitfall": "Missing focus; with shallow DOF, if the eye is blurry, the shot is ruined."
  },
  "Rear Projection": {
    "rule": "Subject in front of a screen.",
    "mechanic": "'In-camera' background replacement; old Hollywood car scenes.",
    "pitfall": "Lighting mismatch; foreground light must match background plate."
  },
  "Starburst": {
    "rule": "Light sources form pointed stars.",
    "mechanic": "Achieved by stopping down aperture to f/16 or f/22.",
    "pitfall": "Diffraction; image gets softer at high f-stops."
  },
  "Light Glare": {
    "rule": "Bright light washing out part of the image.",
    "mechanic": "Reduces contrast, adds dreaminess.",
    "pitfall": "Obscuring the subject entirely."
  },
  "Motion Blur": {
    "rule": "Streaking of moving objects.",
    "mechanic": "Shutter speed controls blur; 180-degree shutter rule is standard.",
    "pitfall": "Choppiness; lack of motion blur makes movement look like a strobe light."
  },
  "Chromatic Aberration": {
    "rule": "Color fringing (RGB split) at high-contrast edges.",
    "mechanic": "Simulates cheap or vintage lenses; adds digital imperfection.",
    "pitfall": "Overdoing it; it looks like a broken monitor if too strong."
  },
  "Film Grain": {
    "rule": "Visual noise.",
    "mechanic": "Acts as a texture that binds CGI and real footage together.",
    "pitfall": "Digital noise vs. Film grain; grain is organic, noise is ugly pixelation."
  },
  "Volumetric Lighting": {
    "rule": "Visible light beams (fog/dust in air).",
    "mechanic": "Adds instant 3D depth to a 2D image.",
    "pitfall": "Source confusion; beams must come from a light source."
  },
  "Ray Tracing": {
    "rule": "Accurate simulation of light bounce.",
    "mechanic": "Reflections in reflections; water, glass, and metal look real.",
    "pitfall": "Computationally expensive; in AI, specifying 'Ray Tracing' forces high-gloss realism."
  },
  "Bioluminescence": {
    "rule": "Organic light (blue/green).",
    "mechanic": "Subsurface glow; the light comes from *inside* the creature.",
    "pitfall": "Lighting the surroundings; bioluminescence is usually dim."
  },

  // --- Tech ---
  "8bit": {
    "rule": "256 colors max.",
    "mechanic": "Pixel art aesthetic; strict grid adherence.",
    "pitfall": "'Mixels' (mixing pixel sizes); all pixels must be the same size."
  },
  "16bit": {
    "rule": "SNES era graphics; more colors, parallax scrolling layers.",
    "mechanic": "Dithering patterns used to create gradients.",
    "pitfall": "Too smooth; gradients should be banded."
  },
  "1080p": {
    "rule": "1920x1080. Standard HD.",
    "mechanic": "The baseline for clarity.",
    "pitfall": "Upscaling lower res content."
  },
  "4k": {
    "rule": "3840x2160.",
    "mechanic": "Sharpness allows for cropping in post.",
    "pitfall": "File size and render time."
  },
  "8k": {
    "rule": "7680x4320.",
    "mechanic": "Overkill for screens, but essential for VR or large prints.",
    "pitfall": "Diminishing returns on small screens."
  },
  "UHD": {
    "rule": "Ultra High Def. See 4k.",
    "mechanic": "Marketing term often interchangeable with 4k."
  },
  "HDR": {
    "rule": "High Dynamic Range.",
    "mechanic": "Brighter brights, darker darks, wider color gamut.",
    "pitfall": "Tone mapping; making the image look unnatural/flat to squeeze dynamic range."
  },
  "Unreal Engine 5": {
    "rule": "Real-time rendering 'look'.",
    "mechanic": "Nanite (infinite detail) and Lumen (global illumination) are the keywords.",
    "pitfall": "'Asset Flip' look; using default assets without customization."
  },
  "Octane Render": {
    "rule": "Unbiased spectral rendering.",
    "mechanic": "The industry standard for motion graphics and abstract 3D art.",
    "pitfall": "Noise; requires long render times to clear grain."
  },

  // --- Parameters ---
  "Aspect Ratio 1:1": {
    "rule": "Square. Instagram/Social standard. Good for portraits."
  },
  "16:9": {
    "rule": "Widescreen. YouTube/TV standard. Cinematic but common."
  },
  "4:5": {
    "rule": "Vertical portrait. Instagram feed max size. Best for mobile real estate."
  },
  "2:3": {
    "rule": "Classic 35mm photo shape. Tall. Standard for Pinterest."
  },
  "9:16": {
    "rule": "Full vertical. Stories/TikTok. Immersive mobile."
  },
  "21:9": {
    "rule": "Ultrawide. Cinema. Epic landscapes."
  },
  "Stylize": {
    "rule": "AI parameter. How much artistic license the AI takes. Low = literal, High = artistic."
  },
  "Chaos": {
    "rule": "AI parameter. Variation in grid results. High chaos = unexpected compositions."
  },
  "Weird": {
    "rule": "AI parameter. Introduces non-standard subject matter or logic."
  },
  "Tile": {
    "rule": "AI parameter. Generates seamless textures for wallpapers/fabric."
  }
};