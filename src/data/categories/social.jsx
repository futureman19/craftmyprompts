import React from 'react';
import { 
  Share2, 
  Zap, 
  Layout, 
  Hash, 
  Target 
} from 'lucide-react';

export const SOCIAL_DATA = [
  {
    id: 'platform',
    title: 'Platform',
    icon: <Share2 size={20} />,
    description: 'Where is this going?',
    subcategories: [
      { name: 'Video First', options: ['TikTok', 'Instagram Reels', 'YouTube Shorts'] },
      { name: 'Professional', options: ['LinkedIn', 'Cold Email'] },
      { name: 'Social Graph', options: ['X (Twitter)', 'Instagram', 'Pinterest', 'Facebook'] },
      { name: 'Search', options: ['YouTube Video', 'SEO Blog'] }
    ]
  },
  {
    id: 'content_type',
    title: 'Format',
    icon: <Layout size={20} />,
    description: 'The container for your content',
    subcategories: [
      { name: 'Visual', options: ['Short-Form Video', 'Carousel (PDF/Image)', 'Single Image', 'Pin', 'Thumbnail'] },
      { name: 'Text', options: ['Thread', 'Text Post', 'Article', 'Email'] }
    ]
  },
  {
    id: 'hook_type',
    title: 'Viral Hook',
    icon: <Zap size={20} />,
    description: 'The psychological trigger (0-3s)',
    subcategories: [
      { name: 'Negativity/Fear', options: ['Negative Constraint', 'Warning Label', 'Stop Scrolling', 'The Mistake'] },
      { name: 'Curiosity', options: ['Incredulity Gap', 'Insider Secret', 'Mystery Mechanism', 'The "What If"'] },
      { name: 'Value/Status', options: ['Efficiency Promise', 'Authority Guide', 'Transformation', 'The Specificity Filter'] }
    ]
  },
  {
    id: 'framework',
    title: 'Structure',
    icon: <Hash size={20} />,
    description: 'The narrative arc',
    subcategories: [
      { name: 'Educational', options: ['Step-by-Step', 'Myth vs Fact', 'Listicle', 'How-To'] },
      { name: 'Narrative', options: ['Before & After', 'Hero\'s Journey', 'Day in the Life', 'Storytime'] },
      { name: 'Sales', options: ['PAS (Problem-Agitate-Solution)', 'AIDA (Attention-Interest-Desire-Action)', 'The 3-Sentence Rule'] }
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