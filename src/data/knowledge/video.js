export const VIDEO_KNOWLEDGE = {
  // ==================================================================================
  // 5. VIDEO MODE (Viral Architecture)
  // ==================================================================================

  // --- Platform & Format ---
  "TikTok": {
    "rule": "Hook must happen in 0.5 seconds; visual movement or text overlay immediately.",
    "mechanic": "Audio is a search engine; using 'Trending Sounds' (even at 0% volume) boosts algorithmic discovery.",
    "pitfall": "Corporate polish; TikTok rewards lo-fi, authentic, shot-on-phone aesthetics over studio quality."
  },
  "Instagram Reels": {
    "rule": "Do not leave the TikTok watermark; the algorithm suppresses recycled content.",
    "mechanic": "Aesthetic covers matter; unlike TikTok, Reels sit on your permanent grid, so the thumbnail must match your brand vibe.",
    "pitfall": "Text outside the 'Safe Zone'; UI elements cover the bottom 20% and right side."
  },
  "YouTube Shorts": {
    "rule": "Loop your video seamlessly; the end should flow back into the beginning to trick users into watching twice.",
    "mechanic": "Shorts are the primary funnel for long-form subscribers; pin a related video in the comments.",
    "pitfall": "Treating it like a story; Shorts are evergreen search content, not just daily updates."
  },
  "YouTube Video": {
    "rule": "CTR (Click Through Rate) + AVD (Average View Duration) = Success. Your thumbnail and title are 50% of the work.",
    "mechanic": "The 'J-Cut' (audio starts before video) keeps viewers engaged during transitions.",
    "pitfall": "Long intros; start the content immediately. No 'Hey guys, welcome back'."
  },
  
  // --- Viral Mechanics ---
  "Short-Form Viral Hooks": {
    "rule": "The hook must be delivered in under 3 seconds; if the viewer does not pause within 0.4 seconds, the algorithm marks the video as a failure.",
    "mechanic": "The 'Visual Pattern Interrupt'; visuals must change every 1.5 seconds during the hook to break the brain's prediction error mechanism.",
    "pitfall": "Starting with 'Hey guys' or 'Welcome back,' which triggers an immediate scroll reflex; start In Media Res (middle of the action) instead."
  },
  "YouTube Title Engineering": {
    "rule": "Adhere to specific syntactic structures like 'I Tested [Number] Years Of [Subject]' or 'Don't Buy [Product] Until You Watch This' to trigger psychological levers like Time Arbitrage or Risk Mitigation.",
    "mechanic": "The 'Time Condenser' effect; titles promising to compress years of experience into minutes signal high information density to the algorithm.",
    "pitfall": "Writing purely descriptive titles (e.g., 'Review of the iPhone 15') instead of conflict-driven titles."
  },
  "Retention Editing Physics": {
    "rule": "Remove all breaths and pauses longer than 0.2 seconds (The 'Millennial Pause' removal) to maintain information density.",
    "mechanic": "Use 'J-Cuts' where the audio from the next clip starts before the video cuts to it, bridging the cognitive gap and smoothing the transition.",
    "pitfall": "'Pacing Drag,' where visual information density falls below the brain's processing speed; a visual change (zoom, text, cut) must occur every 2-5 seconds."
  },
  "The Loop Mechanism": {
    "rule": "The final sentence of the script must syntactically flow back into the opening hook to encourage immediate re-watching.",
    "mechanic": "This technique tricks the algorithm into registering >100% Average Percentage Viewed (APV), which is the strongest signal for viral distribution.",
    "pitfall": "Using a definitive sign-off like 'Thanks for watching' which signals the viewer to scroll away."
  },

  // --- Generation Physics (Runway/Pika) ---
  "Runway Gen-2 Camera Control": {
    "rule": "Distinctly separate 'Motion Brush' (which moves the subject) from 'Camera Motion' (which moves the viewport).",
    "mechanic": "Create 'Parallax' by assigning opposite motion vectors; for example, panning the camera right (`Horizontal +2`) while the subject moves left via Motion Brush (`Horizontal -3`).",
    "pitfall": "Setting motion values to the maximum (10), which causes significant warping and distortion; values between 3-5 are optimal for realism."
  },
  "AI Video Physics Simulation": {
    "rule": "Explicitly describe weight and impact to counter the 'floating' tendency of diffusion models (e.g., 'The ball accelerates downwards at 9.8m/s^2 and deforms upon impact').",
    "mechanic": "'Visual Anchoring'; repeating specific descriptive traits (e.g., 'Red scarf') in every segment of a prompt chain helps maintain object permanence across frames.",
    "pitfall": "Using generic motion terms like 'moving'; use specific cinematic terms like 'Truck', 'Pan', or 'Dolly Zoom' to define the physics of the camera."
  },

  // --- Camera Movement ---
  "Pan Left/Right": {
    "rule": "Smooth, constant speed.",
    "mechanic": "Reveals new information horizontally; use it to show the relationship between two objects.",
    "pitfall": "'Hose-piping' (panning back and forth aimlessly); pick a direction and commit."
  },
  "Tilt Up/Down": {
    "rule": "Vertical reveal.",
    "mechanic": "Tilt Up = Revealing scale/grandeur (hero). Tilt Down = Revealing ground/defeat.",
    "pitfall": "Tilting too fast causes motion strobing."
  },
  "Zoom In/Out": {
    "rule": "Zooming changes the focal length (background compression), not just the size.",
    "mechanic": "'Crash Zoom' adds comedic or dramatic emphasis instantly.",
    "pitfall": "Digital zoom; always optical zoom if possible to preserve resolution."
  },
  "Rack Focus": {
    "rule": "Shifting focus from foreground to background.",
    "mechanic": "Directs the viewer's eye to the most important element.",
    "pitfall": "'Hunting'; missing the focus point and adjusting back and forth."
  },
  "Handheld Shake": {
    "rule": "Adds realism and urgency.",
    "mechanic": "High shutter speed increases the perceived chaos of the shake (Private Ryan effect).",
    "pitfall": "Rolling shutter; cheap sensors turn handheld footage into Jell-O."
  },
  "Drone Flyover": {
    "rule": "Constant velocity and altitude.",
    "mechanic": "Reveals geography and scale.",
    "pitfall": "Propellers in shot; flying too fast forward angles the camera down into the props."
  },
  "FPV Drone": {
    "rule": "Acrobatic, high-speed flight.",
    "mechanic": "Needs a high refresh rate to watch comfortably.",
    "pitfall": "Motion sickness; keep the horizon somewhat understandable."
  },
  "Orbit": {
    "rule": "Circling a subject while keeping them centered.",
    "mechanic": "Isolate the hero; the background spins, making the subject the only stable thing.",
    "pitfall": "Jerky movement; requires high skill or automation."
  },
  "Tracking Shot": {
    "rule": "Camera follows the subject at the same speed.",
    "mechanic": "Places the viewer 'with' the character.",
    "pitfall": "Losing the lead room; keep space in front of the subject."
  },

  // --- Environmental Physics ---
  "Zero Gravity": {
    "rule": "Objects float with inertia; they don't stop unless they hit something.",
    "mechanic": "Liquids form spheres due to surface tension.",
    "pitfall": "Things falling; there is no 'down'."
  },
  "Underwater Physics": {
    "rule": "Drag/Resistance; movement is slow and deliberate.",
    "mechanic": "Light refraction and caustics; things look 33% larger.",
    "pitfall": "Clear vision; water creates blue haze and blur over distance."
  },
  "Slow Motion Fluid": {
    "rule": "High frame rate (60fps+) played back at 24fps.",
    "mechanic": "Reveals viscosity and surface tension invisible to the eye.",
    "pitfall": "Optical Flow interpolation artifacts if forcing standard footage to slow mo."
  }
};