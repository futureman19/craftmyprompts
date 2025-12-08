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
  Quote
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

export const PRESETS = {
    coding: [
        { label: "React Component", task: "Write Code", lang: "React", topic: "Create a functional component named {Name} that accepts props {Props} and renders {Description}." },
        { label: "sCrypt Smart Contract", task: "Write Smart Contract", lang: "sCrypt", topic: "Create a stateful contract that requires two signatures to unlock funds." },
        { label: "Python Bug Fix", task: "Debug", lang: "Python", topic: "Fix the following error in this code: {Error_Message}. Code: {Paste_Code}" },
        { label: "Unit Tests", task: "Write Unit Tests", lang: "TypeScript", topic: "Write comprehensive tests for this function: {Function_Code}" }
    ],
    writing: [
        { label: "LinkedIn Viral", intent: "Inspire", framework: "PAS (Problem, Agitate, Solution)", topic: "Write a post about {Topic} targeting {Audience}." },
        { label: "Blog Article", intent: "Inform", style: "TechCrunch Style", topic: "Write an outline for an article about {Subject}." }
    ],
    general: [
        { label: "Professional Email", persona: "Project Manager", tone: "Diplomatic", topic: "Write an email to {Recipient} about {Subject}." }
    ],
    art: [
        { label: "Cinematic Portrait", genre: "Cinematic", shot: "Close-up", topic: "A portrait of {Subject}, {Lighting}, highly detailed." },
        { label: "Isometric Game Asset", genre: "Modern", shot: "Isometric", topic: "A {Building_Type} on a floating island, white background." }
    ]
};