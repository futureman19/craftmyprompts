import React from 'react';
import { 
  Palette, 
  User, 
  Smile, 
  Glasses, 
  Layers, 
  Terminal 
} from 'lucide-react';

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