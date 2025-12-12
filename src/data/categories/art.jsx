import React from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Palette, 
  Camera, 
  MonitorPlay, 
  Aperture,
  Settings,
  Terminal
} from 'lucide-react';

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