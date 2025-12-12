import React from 'react';
import { 
  Layout, 
  PenTool, 
  Zap, 
  Feather 
} from 'lucide-react';

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