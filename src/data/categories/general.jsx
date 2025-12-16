import React from 'react';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  BookOpen,
  Ruler,
  Languages,
  Mic,
  AlertCircle,
  Share2
} from 'lucide-react';

export const GENERAL_DATA = [
  {
    id: 'platform',
    title: 'Platform',
    icon: <Share2 size={20} />,
    description: 'Where will this be published?',
    subcategories: [
      { name: 'Blogging', options: ['Medium', 'Substack', 'WordPress', 'Ghost'] },
      { name: 'Professional', options: ['LinkedIn Article', 'White Paper', 'Press Release', 'Internal Memo'] },
      { name: 'Academic', options: ['Research Paper', 'Thesis', 'Grant Proposal'] }
    ]
  },
  {
    id: 'target_audience',
    title: 'Target Audience', // NEW: The "Who"
    icon: <Users size={20} />,
    description: 'Who is reading this?',
    subcategories: [
      { name: 'Professional', options: ['C-Suite Executives', 'Software Engineers', 'Investors (VCs)', 'Hiring Managers'] },
      { name: 'General', options: ['Complete Beginners', '5-Year Olds (ELI5)', 'Gen Z', 'Retirees'] },
      { name: 'Niche', options: ['Academics', 'Gamers', 'Fitness Enthusiasts', 'Crypto Natives'] }
    ]
  },
  {
    id: 'persona',
    title: 'Persona',
    icon: <BookOpen size={20} />,
    description: 'Who is the AI acting as?',
    subcategories: [
      { name: 'Business', options: ['Fortune 500 CEO', 'Project Manager', 'Marketing Strategist', 'HR Specialist', 'Startup Founder'] },
      { name: 'Academic', options: ['Research Scientist', 'Historian', 'Mathematician', 'Physics Tutor', 'Debate Coach'] },
      { name: 'Lifestyle', options: ['Personal Trainer', 'Nutritionist', 'Life Coach', 'Travel Guide', 'Chef'] }
    ]
  },
  {
    id: 'voice_mimicry',
    title: 'Voice & Mimicry', // MERGED: Author + Style
    icon: <Mic size={20} />,
    description: 'Emulate specific styles',
    subcategories: [
      { name: 'Authors', options: ['Hemingway (Concise)', 'Shakespearean', 'Malcolm Gladwell', 'Seth Godin', 'Oscar Wilde'] },
      { name: 'Media Brands', options: ['TechCrunch Style', 'BuzzFeed Style', 'New York Times', 'The Onion (Satire)'] },
      { name: 'POV', options: ['First Person (I/Me)', 'Second Person (You)', 'Third Person Objective'] }
    ]
  },
  {
    id: 'tone',
    title: 'Tone',
    icon: <MessageSquare size={20} />,
    description: 'Emotional resonance',
    subcategories: [
      { name: 'Professional', options: ['Formal', 'Diplomatic', 'Concise', 'Objective', 'Persuasive'] },
      { name: 'Casual', options: ['Friendly', 'Humorous', 'Witty', 'Sarcastic', 'Enthusiastic', 'Empathetic'] }
    ]
  },
  {
    id: 'constraints',
    title: 'Constraints', // NEW: Hard limits
    icon: <AlertCircle size={20} />,
    description: 'What to avoid or enforce',
    subcategories: [
      { name: 'Length', options: ['Under 280 characters', 'Under 100 words', 'One Sentence', 'Deep Dive (1000+ words)'] },
      { name: 'Content', options: ['No Fluff/Yapping', 'No Jargon', 'Strictly Factual', 'Use Analogies', 'No Moralizing'] },
      { name: 'Formatting', options: ['Markdown', 'Plain Text', 'CSV Format', 'JSON Output'] }
    ]
  },
  {
    id: 'framework',
    title: 'Frameworks',
    icon: <Ruler size={20} />,
    description: 'Proven Structures',
    subcategories: [
      { name: 'Marketing', options: ['AIDA (Attention, Interest, Desire, Action)', 'PAS (Problem, Agitate, Solution)', 'FAB (Features, Advantages, Benefits)'] },
      { name: 'Storytelling', options: ['Hero\'s Journey', 'In Medias Res', 'Three-Act Structure', 'Star-Chain-Hook'] },
      { name: 'Business', options: ['STAR (Situation, Task, Action, Result)', 'SWOT Analysis'] }
    ]
  },
  {
    id: 'format',
    title: 'Output Format',
    icon: <FileText size={20} />,
    description: 'Visual structure',
    subcategories: [
      { name: 'Lists', options: ['Bullet Points', 'Numbered List', 'Checklist'] },
      { name: 'Data', options: ['Table', 'Comparison Chart', 'Pros & Cons'] },
      { name: 'Prose', options: ['Essay', 'Email', 'Memo', 'Script'] }
    ]
  }
];