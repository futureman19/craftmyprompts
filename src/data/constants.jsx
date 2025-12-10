import React from 'react';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Terminal, 
  Cpu, 
  Settings, 
  Layout, 
  PenTool, 
  Zap, 
  Sparkles, 
  Image as ImageIcon, 
  Palette, 
  Camera, 
  MonitorPlay, 
  Aperture,
  BookOpen,
  Ruler,
  Languages,
  Code2,
  TestTube,
  Quote,
  Smile,
  Glasses,
  User,
  Layers,
  Feather,
  Video, // <--- NEW IMPORT
  Film, // <--- NEW IMPORT
  Move, // <--- NEW IMPORT
  Activity, // <--- NEW IMPORT
  Ban // <--- NEW IMPORT
} from 'lucide-react';

export const GENERAL_DATA = [
  {
    id: 'persona',
    title: 'Persona',
    icon: <Users size={20} />,
    description: 'Who is the AI?',
    subcategories: [
      { name: 'Professional', options: ['Project Manager', 'CEO', 'Marketing Strategist', 'HR Specialist'] },
      { name: 'Academic', options: ['Research Scientist', 'Historian', 'Mathematician', 'Physics Tutor'] },
      { name: 'Lifestyle', options: ['Personal Trainer', 'Nutritionist', 'Life Coach', 'Travel Guide'] }
    ]
  },
  {
    id: 'tone',
    title: 'Tone',
    icon: <MessageSquare size={20} />,
    description: 'Voice & Style',
    subcategories: [
      { name: 'Professional', options: ['Formal', 'Diplomatic', 'Concise', 'Objective'] },
      { name: 'Casual', options: ['Friendly', 'Humorous', 'Witty', 'Sarcastic', 'Enthusiastic'] }
    ]
  },
  {
    id: 'format',
    title: 'Format',
    icon: <FileText size={20} />,
    description: 'Output Structure',
    subcategories: [
      { name: 'Structured', options: ['Bullet Points', 'Table', 'Step-by-Step', 'Pros & Cons'] },
      { name: 'Long Form', options: ['Essay', 'Article', 'Report', 'Memo'] }
    ]
  },
  {
    id: 'context',
    title: 'Context',
    icon: <BookOpen size={20} />,
    description: 'Background & Setting',
    subcategories: [
      { name: 'Audience', options: ['Beginner', 'Expert', 'Child', 'Colleague', 'Public'] },
      { name: 'Situation', options: ['Corporate Meeting', 'Viral Social Post', 'Academic Paper', 'Casual Conversation'] }
    ]
  },
  {
    id: 'length',
    title: 'Length',
    icon: <Ruler size={20} />,
    description: 'Word Count & Depth',
    subcategories: [
      { name: 'Brief', options: ['< 100 words', 'One Sentence', 'Elevator Pitch'] },
      { name: 'Medium', options: ['300 words', 'One Paragraph', 'Standard Email'] },
      { name: 'Extensive', options: ['Deep Dive', '1000+ words', 'Comprehensive Guide'] }
    ]
  },
  {
    id: 'language_style',
    title: 'Language Style',
    icon: <Languages size={20} />,
    description: 'Vocabulary & Complexity',
    subcategories: [
      { name: 'Complexity', options: ['Simple English', 'Technical Jargon', 'Academic', 'Explain Like I\'m 5'] },
      { name: 'Creative', options: ['Metaphorical', 'Storytelling', 'Persuasive', 'Descriptive'] }
    ]
  }
];

export const CODING_DATA = [
  {
    id: 'language',
    title: 'Language & Stack',
    icon: <Terminal size={20} />,
    description: 'Tech Stack',
    subcategories: [
      { name: 'Languages', options: ['sCrypt', 'Bitcoin Script', 'Python', 'TypeScript', 'JavaScript', 'Rust', 'Go', 'C++', 'Swift', 'SQL', 'Solidity'] },
      { name: 'Web Frameworks', options: ['React', 'Next.js', 'Vue', 'Svelte', 'Tailwind CSS', 'Node.js', 'Django'] },
      { name: 'Blockchain/BSV', options: ['scrypt-ts', 'BSV SDK', 'Whatsonchain API', 'Gorilla Pool', 'JungleBus'] },
      { name: 'Data/ML', options: ['Pandas', 'PyTorch', 'TensorFlow', 'NumPy', 'Scikit-learn'] }
    ]
  },
  {
    id: 'framework_version',
    title: 'Version',
    icon: <Code2 size={20} />,
    description: 'Specific Versions',
    subcategories: [
      { name: 'Web', options: ['React 18', 'React 19', 'Next.js 13', 'Next.js 14', 'Vue 3'] },
      { name: 'Python', options: ['Python 3.11', 'Python 3.12'] },
      { name: 'sCrypt', options: ['sCrypt v1 (Legacy)', 'sCrypt v2 (scrypt-ts)'] }
    ]
  },
  {
    id: 'task',
    title: 'Coding Task',
    icon: <Cpu size={20} />,
    description: 'Objective',
    subcategories: [
      { name: 'Action', options: ['Write Smart Contract', 'Verify Signature', 'Create Transaction', 'Debug', 'Refactor', 'Optimize', 'Explain Code', 'Write Unit Tests'] },
      { name: 'Focus', options: ['UTXO Management', 'Stateful Contracts', 'Push Data', 'OP_RETURN', 'Performance', 'Security', 'Scalability'] }
    ]
  },
  {
    id: 'testing_library',
    title: 'Testing',
    icon: <TestTube size={20} />,
    description: 'Test Frameworks',
    subcategories: [
      { name: 'JS/TS', options: ['Mocha', 'Chai', 'Jest', 'Vitest', 'Cypress', 'Playwright'] },
      { name: 'Python', options: ['PyTest', 'Unittest'] },
      { name: 'Smart Contracts', options: ['sCrypt Testnet', 'Local Mock'] }
    ]
  },
  {
    id: 'principles',
    title: 'Principles',
    icon: <Settings size={20} />,
    description: 'Code Quality',
    subcategories: [
      { name: 'Paradigms', options: ['Functional Programming', 'OOP', 'Event-Driven', 'UTXO Model'] },
      { name: 'Best Practices', options: ['SOLID Principles', 'DRY', 'Clean Code', 'TDD'] }
    ]
  },
  {
    id: 'commenting_style',
    title: 'Comments',
    icon: <Quote size={20} />,
    description: 'Documentation Style',
    subcategories: [
      { name: 'Style', options: ['JSDoc', 'Docstrings', 'Minimal', 'Verbose', 'Step-by-step Explanation'] }
    ]
  }
];

export const WRITING_DATA = [
  {
    id: 'author',
    title: 'Emulate Author',
    icon: <Feather size={20} />,
    description: 'Write in the style of...',
    subcategories: [
      { name: 'Fiction Masters', options: ['J.K. Rowling', 'Stephen King', 'Ernest Hemingway', 'George R.R. Martin', 'Neil Gaiman', 'Agatha Christie'] },
      { name: 'Classic', options: ['William Shakespeare', 'Mark Twain', 'Jane Austen', 'Charles Dickens', 'Oscar Wilde'] },
      { name: 'Modern/Business', options: ['Malcolm Gladwell', 'Seth Godin', 'Tim Ferriss', 'Brene Brown', 'Gary Vaynerchuk'] }
    ]
  },
  {
    id: 'framework',
    title: 'Frameworks',
    icon: <Layout size={20} />,
    description: 'Proven Structures',
    subcategories: [
      { name: 'Marketing', options: ['AIDA (Attention, Interest, Desire, Action)', 'PAS (Problem, Agitate, Solution)', 'FAB (Features, Advantages, Benefits)'] },
      { name: 'Storytelling', options: ['Hero\'s Journey', 'In Medias Res', 'Three-Act Structure'] },
      { name: 'Business', options: ['STAR (Situation, Task, Action, Result)', 'SWOT Analysis'] }
    ]
  },
  {
    id: 'style',
    title: 'Style & Voice',
    icon: <PenTool size={20} />,
    description: 'Literary Style',
    subcategories: [
      { name: 'Famous Voices', options: ['Hemingway (Concise)', 'Shakespearean', 'TechCrunch Style', 'Malcolm Gladwell', 'BuzzFeed Style'] },
      { name: 'POV', options: ['First Person (I/Me)', 'Second Person (You)', 'Third Person Limited', 'Third Person Omniscient'] }
    ]
  },
  {
    id: 'intent',
    title: 'Intent',
    icon: <Zap size={20} />,
    description: 'Goal of Text',
    subcategories: [
      { name: 'Goal', options: ['Persuade', 'Inform', 'Entertain', 'Inspire', 'Sell', 'Educate'] },
      { name: 'Audience', options: ['5-Year Old', 'Expert', 'Investor', 'General Public'] }
    ]
  }
];

export const ART_DATA = [
  {
    id: 'genre',
    title: 'Genre & Vibe',
    icon: <Sparkles size={20} />,
    description: 'The overall theme',
    subcategories: [
      {
        name: 'Main Genres',
        options: ['Fantasy', 'Adventure', 'Modern', 'Horror', 'Cinematic', 'Futuristic', 'Romantic', 'Western', 'Thriller', 'Cyberpunk', 'Sci-Fi', 'Noir', 'Steampunk', 'Dystopian', 'Surrealism', 'Pop Art', 'Ukiyo-e', 'Vaporwave', 'Gothic', 'Ethereal']
      }
    ]
  },
  {
    id: 'environment',
    title: 'Environment',
    icon: <ImageIcon size={20} />,
    description: 'Where is the scene set?',
    subcategories: [
      {
        name: 'Nature',
        options: ['Plains', 'Mountains', 'Ocean', 'Lake', 'Forest', 'Desert', 'Snowy Tundra', 'Jungle', 'Cave', 'Volcano', 'Underwater']
      },
      {
        name: 'Urban/Indoor',
        options: ['City Skyline', 'Abandoned Building', 'Cyber City', 'Laboratory', 'Castle', 'Library', 'Space Station', 'Coffee Shop', 'Museum']
      }
    ]
  },
  {
    id: 'style',
    title: 'Visual Style',
    icon: <Palette size={20} />,
    description: 'Artists & Directors (Visuals)',
    isVisual: true,
    subcategories: [
      {
        name: 'Directors',
        options: [
          'Wes Anderson', 'Tim Burton', 'Christopher Nolan', 'Quentin Tarantino', 'Stanley Kubrick', 'Denis Villeneuve', 'Hayao Miyazaki',
          'Steven Spielberg', 'Ridley Scott', 'George Lucas', 'David Fincher', 'Greta Gerwig', 'Guillermo del Toro', 'Akira Kurosawa'
        ]
      },
      {
        name: 'Painters/Artists',
        options: [
          'Van Gogh', 'Picasso', 'Salvador Dali', 'Monet', 'Rembrandt', 'Greg Rutkowski', 'H.R. Giger', 'Simon Stålenhag', 'Beeple', 
          'Makoto Shinkai', 'Leonardo da Vinci', 'Michelangelo', 'Andy Warhol', 'Banksy', 'Basquiat', 'Frida Kahlo', 'Katsushika Hokusai'
        ]
      }
    ]
  },
  {
    id: 'camera',
    title: 'Camera & Lens',
    icon: <Camera size={20} />,
    description: 'Hardware and focal length',
    subcategories: [
      {
        name: 'Film Type',
        options: ['8mm', '16mm', '35mm', '70mm', 'Super 8mm', 'IMAX', 'VHS', 'Polaroid', 'Kodak Portra 400']
      },
      {
        name: 'Lens',
        options: ['28mm', '35mm', '50mm', '85mm', '100mm', 'Macro Lens', 'Wide Angle', 'Fisheye', 'Tilt-Shift']
      }
    ]
  },
  {
    id: 'shots',
    title: 'Shot Type',
    icon: <MonitorPlay size={20} />,
    description: 'Framing and composition',
    subcategories: [
      {
        name: 'Angles',
        options: ['Aerial View', 'Close-up', 'Extreme Close-up', 'Crowd Shot', 'Establishing Shot', 'Low Angle', 'High Angle', 'Over-the-shoulder', 'Handheld', 'Drone Shot', 'Isometric']
      }
    ]
  },
  {
    id: 'visuals',
    title: 'Lighting & Effects',
    icon: <Aperture size={20} />,
    description: 'Grading and atmosphere',
    subcategories: [
      {
        name: 'Grading',
        options: ['Cool-toned', 'Pastel', 'Bright', 'Vibrant', 'Muted', 'Neon', 'Warm', 'Duotone', 'Monochrome', 'Sepia', 'High Contrast']
      },
      {
        name: 'Effects',
        options: ['Bokeh', 'Depth of Field', 'Rear Projection', 'Starburst', 'Light Glare', 'Motion Blur', 'Chromatic Aberration', 'Film Grain', 'Volumetric Lighting', 'Ray Tracing', 'Bioluminescence']
      }
    ]
  },
  {
    id: 'tech',
    title: 'Resolution & Specs',
    icon: <Settings size={20} />,
    description: 'Technical quality',
    subcategories: [
      {
        name: 'Quality',
        options: ['8bit', '16bit', '1080p', '4k', '8k', 'UHD', 'HDR', 'Unreal Engine 5', 'Octane Render']
      }
    ]
  },
  {
    id: 'params',
    title: 'Parameters',
    icon: <Terminal size={20} />,
    description: 'Model specific flags',
    subcategories: [
      {
        name: 'Aspect Ratio (--ar)',
        options: ['1:1', '16:9', '4:5', '2:3', '9:16', '21:9']
      },
      {
        name: 'Stylize (--s) [MJ]',
        options: ['0', '100', '250', '500', '750', '1000']
      },
      {
        name: 'Chaos (--c) [MJ]',
        options: ['0', '10', '25', '50', '100']
      },
      {
        name: 'Weird (--w) [MJ]',
        options: ['0', '250', '500', '1000', '3000']
      },
      {
        name: 'Tile (--tile) [MJ]',
        options: ['Seamless Pattern']
      }
    ]
  }
];

export const AVATAR_DATA = [
  {
    id: 'avatar_style',
    title: 'Art Style',
    icon: <Palette size={20} />,
    description: 'The look and feel',
    isVisual: true,
    subcategories: [
      { name: '3D/CGI', options: ['Pixar Style', 'Disney Style', 'Unreal Engine 5', 'Claymation', 'Low Poly', 'Fortnite Style'] },
      { name: '2D/Illustration', options: ['Anime', 'Studio Ghibli', 'Vector Flat', 'Line Art', 'Watercolor', 'Oil Painting', 'Sketch', 'Comic Book', 'Pop Art'] },
      { name: 'Digital', options: ['Cyberpunk', 'Vaporwave', 'Pixel Art', 'Glitch Art', 'Neon', 'Synthwave'] },
      { name: 'Realistic', options: ['Photorealistic', 'Studio Photography', 'Cinematic Lighting'] }
    ]
  },
  {
    id: 'framing',
    title: 'Framing',
    icon: <User size={20} />,
    description: 'Headshot or Full Body?',
    subcategories: [
      { name: 'Crop', options: ['Headshot', 'Bust (Shoulders up)', 'Waist up', 'Full Body', 'Extreme Close-up (Eyes)'] },
      { name: 'Angle', options: ['Front Facing', 'Profile View', '3/4 View', 'Looking up', 'Looking down'] }
    ]
  },
  {
    id: 'expression',
    title: 'Expression',
    icon: <Smile size={20} />,
    description: 'Emotion & Mood',
    subcategories: [
      { name: 'Positive', options: ['Smiling', 'Laughing', 'Confident', 'Winking', 'Excited', 'Peaceful', 'Friendly'] },
      { name: 'Cool/Neutral', options: ['Smirking', 'Serious', 'Stoic', 'Bored', 'Focused', 'Mysterious'] },
      { name: 'Negative/Intense', options: ['Angry', 'Crying', 'Screaming', 'Scared', 'Shocked'] }
    ]
  },
  {
    id: 'accessories',
    title: 'Accessories & Details',
    icon: <Glasses size={20} />,
    description: 'Wearables & Features',
    subcategories: [
      { name: 'Eyewear', options: ['Round Glasses', 'Sunglasses', 'Aviators', 'VR Headset', 'Cybernetic Eye', 'Monocle'] },
      { name: 'Headwear', options: ['Beanie', 'Baseball Cap', 'Crown', 'Headphones', 'Cat Ears', 'Bandana', 'Space Helmet'] },
      { name: 'Features', options: ['Freckles', 'Scar', 'Tattoo', 'Piercings', 'Beard', 'Mustache', 'Glowing Eyes'] }
    ]
  },
  {
    id: 'background',
    title: 'Background',
    icon: <Layers size={20} />,
    description: 'Setting the scene',
    subcategories: [
      { name: 'Simple', options: ['Solid Color', 'Gradient', 'White Background', 'Transparent Background (Sticker)', 'Abstract Shapes'] },
      { name: 'Environment', options: ['Neon City', 'Forest', 'Space', 'Office', 'Gaming Room', 'Library', 'Beach', 'Sunset'] }
    ]
  },
  {
    id: 'params',
    title: 'Parameters',
    icon: <Terminal size={20} />,
    description: 'Model specific flags',
    subcategories: [
        {
          name: 'Aspect Ratio (--ar)',
          options: ['1:1', '9:16']
        },
        {
          name: 'Niji Mode (--niji) [MJ]',
          options: ['Anime Style']
        }
    ]
  }
];

// --- CTO UPDATE: NEW VIDEO DATA ---
export const VIDEO_DATA = [
    {
      id: 'camera_move',
      title: 'Camera Movement',
      icon: <Move size={20} />,
      description: 'How does the camera behave?',
      subcategories: [
        { name: 'Basic', options: ['Pan Left', 'Pan Right', 'Tilt Up', 'Tilt Down', 'Zoom In', 'Zoom Out', 'Static'] },
        { name: 'Advanced', options: ['Roll Clockwise', 'Roll Counter-Clockwise', 'Truck Left', 'Truck Right', 'Pedestal Up', 'Pedestal Down', 'Rack Focus'] },
        { name: 'Styles', options: ['Handheld Shake', 'Drone Flyover', 'FPV Drone', 'Orbit', 'Tracking Shot'] }
      ]
    },
    {
      id: 'motion_strength',
      title: 'Motion Strength',
      icon: <Activity size={20} />,
      description: 'Intensity of movement',
      subcategories: [
        { name: 'Intensity', options: ['Subtle Motion', 'Normal Motion', 'High Motion', 'Hyper-Lapse', 'Slow Motion'] }
      ]
    },
    {
      id: 'aesthetics',
      title: 'Aesthetics & FPS',
      icon: <Film size={20} />,
      description: 'Visual style of the footage',
      subcategories: [
        { name: 'Frame Rate', options: ['24fps (Cinematic)', '30fps (Standard)', '60fps (Smooth)'] },
        { name: 'Look', options: ['VHS Glitch', '8mm Film Grain', '4k Digital Clean', 'CCTV Footage', 'GoPro Fisheye', 'Anime Style'] }
      ]
    },
    {
      id: 'video_negative',
      title: 'Negative Prompt',
      icon: <Ban size={20} />,
      description: 'Avoid these artifacts',
      subcategories: [
        { name: 'Artifacts', options: ['Blurry', 'Distortion', 'Morphing', 'Static', 'Watermark', 'Text', 'Bad anatomy'] }
      ]
    }
  ];

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
    // --- CTO UPDATE: VIDEO PRESETS ---
    video: [
        { label: "Cinematic Drone Shot", camera_move: "Drone Flyover", motion_strength: "Normal Motion", aesthetics: "4k Digital Clean", topic: "A sweeping aerial view of {Location} at sunset." },
        { label: "Vintage VHS Style", camera_move: "Handheld Shake", aesthetics: "VHS Glitch", topic: "A 90s style home video of {Subject}." }
    ]
};

// --- RANDOM TOPICS FOR SURPRISE ME ---
export const RANDOM_TOPICS = [
    // Art Topics
    "A futuristic city floating in the clouds",
    "A cute astronaut cat exploring Mars",
    "A mystical forest with glowing mushrooms",
    "A cyberpunk street food vendor in Tokyo",
    "An ancient library inside a giant tree",
    "A steampunk airship battle",
    "A serene japanese garden in winter",
    "A neon-lit diner in the rain",
    
    // Writing/Text Topics
    "Explain quantum computing to a 5 year old",
    "Write a viral tweet about coffee",
    "Create a 3-day workout plan for beginners",
    "Write a scary story in 2 sentences",
    "Explain why the sky is blue",
    "Write a rejection letter to a ghost",
    "Create a recipe for the ultimate sandwich"
];