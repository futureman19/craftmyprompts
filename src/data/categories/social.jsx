import React from 'react';
import { 
  Share2, 
  Zap, 
  Layout, 
  Hash, 
  Target,
  Activity
} from 'lucide-react';

export const SOCIAL_DATA = [
  {
    id: 'platform',
    title: 'Platform',
    icon: <Share2 size={20} />,
    description: 'Text-based networks',
    subcategories: [
      { name: 'Microblogging', options: ['X (Twitter)', 'Threads', 'Bluesky'] },
      { name: 'Professional', options: ['LinkedIn', 'Cold Email', 'Medium'] },
      { name: 'Community', options: ['Reddit', 'Discord', 'Facebook Group', 'Slack'] }
    ]
  },
  {
    id: 'algorithm_signal',
    title: 'Algorithm Signal', // NEW: Optimization Target
    icon: <Activity size={20} />,
    description: 'What metric are we optimizing?',
    subcategories: [
      { name: 'Reach', options: ['Shareability (Viral)', 'Trend Jacking', 'Controversy (Debate)'] },
      { name: 'Retention', options: ['Dwell Time (Long Read)', 'Saveable (Reference)', 'Carousel Swipe'] },
      { name: 'Conversion', options: ['Click-Through (Traffic)', 'DM Generation', 'Lead Magnet'] }
    ]
  },
  {
    id: 'hook_type',
    title: 'Hook Strategy', // RENAMED: More professional
    icon: <Zap size={20} />,
    description: 'The text trigger (Read time: 0-3s)',
    subcategories: [
      { name: 'Psychology', options: ['Negativity Bias ("Stop doing...")', 'Curiosity Gap ("The Secret...")', 'Pattern Interrupt', 'Unpopular Opinion'] },
      { name: 'Value', options: ['"How I..." (Authority)', 'The Checklist', 'The Breakdown', 'The Data Dump'] },
      { name: 'Emotion', options: ['The Failure Story', 'The Rant', 'The Celebration', 'Vulnerability'] }
    ]
  },
  {
    id: 'content_type',
    title: 'Format',
    icon: <Layout size={20} />,
    description: 'The container for your content',
    subcategories: [
      { name: 'Short Form', options: ['Tweet', 'Thread', 'Status Update', 'Comment Reply'] },
      { name: 'Long Form', options: ['LinkedIn Article', 'Newsletter Issue', 'Case Study', 'Manifesto'] }
    ]
  },
  {
    id: 'framework',
    title: 'Structure',
    icon: <Hash size={20} />,
    description: 'The narrative arc',
    subcategories: [
      { name: 'Copywriting', options: ['PAS (Problem-Agitate-Solution)', 'AIDA (Attention-Interest-Desire-Action)', 'BAB (Before-After-Bridge)'] },
      { name: 'Storytelling', options: ['Hero\'s Journey', 'Star-Chain-Hook', 'The "Open Loop"', 'The Listicle'] }
    ]
  },
  {
    id: 'goal',
    title: 'Goal',
    icon: <Target size={20} />,
    description: 'What is the desired outcome?',
    subcategories: [
      { name: 'Engagement', options: ['Viral Reach', 'Comments/Debate', 'Shares/Saves'] },
      { name: 'Conversion', options: ['Click Link', 'Sign Up', 'Book Call', 'Buy Product'] }
    ]
  }
];