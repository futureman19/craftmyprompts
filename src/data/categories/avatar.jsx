import React from 'react';
import { 
  Palette, 
  User, 
  Smile, 
  Glasses, 
  Layers, 
  Terminal,
  Share2,
  Aperture, // For Lighting
  Box       // For Material
} from 'lucide-react';

export const AVATAR_DATA = [
  {
    id: 'platform',
    title: 'Platform',
    icon: <Share2 size={20} />,
    description: 'Where will this avatar be used?',
    subcategories: [
      { name: 'Social Profiles', options: ['LinkedIn PFP', 'Twitter/X NFT', 'Discord Avatar', 'Instagram Profile', 'YouTube Channel Icon'] },
      { name: 'Gaming/Metaverse', options: ['VRChat', 'Roblox', 'Minecraft Skin', 'Unity Asset', 'Ready Player Me'] },
      { name: 'Branding', options: ['Company Mascot', 'Chatbot Avatar', 'Sticker Pack', 'Favicon'] }
    ]
  },
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
    id: 'lighting',
    title: 'Lighting',
    icon: <Aperture size={20} />,
    description: 'Mood & Illumination',
    subcategories: [
      { name: 'Studio', options: ['Three-Point Lighting', 'Rim Lighting', 'Softbox', 'Butterfly Lighting', 'Rembrandt'] },
      { name: 'Environmental', options: ['Volumetric Fog', 'Bioluminescence', 'Neon Glow', 'Golden Hour', 'Moonlight'] }
    ]
  },
  {
    id: 'material',
    title: 'Material & Texture',
    icon: <Box size={20} />,
    description: 'Skin & Surface details',
    subcategories: [
      { name: 'Skin/Organic', options: ['Subsurface Scattering', 'Porous Skin', 'Hyper-realistic', 'Scales', 'Fur'] },
      { name: 'Artificial', options: ['Plasticine', 'Matte Plastic', 'Brushed Metal', 'Holographic', 'Porcelain'] }
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