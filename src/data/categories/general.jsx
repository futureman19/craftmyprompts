import React from 'react';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  BookOpen,
  Ruler,
  Languages
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