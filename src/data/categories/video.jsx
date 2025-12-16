import React from 'react';
import { 
  Move, 
  Activity, 
  Film, 
  Ban,
  Share2,
  Wind // For Physics/Atmosphere
} from 'lucide-react';

export const VIDEO_DATA = [
    {
      id: 'platform',
      title: 'Platform',
      icon: <Share2 size={20} />,
      description: 'Where is this video going?',
      subcategories: [
        { name: 'Short Form', options: ['TikTok', 'Instagram Reels', 'YouTube Shorts'] },
        { name: 'Long Form', options: ['YouTube Video', 'Vimeo', 'TV Commercial', 'Film Festival'] }
      ]
    },
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
      id: 'physics',
      title: 'Physics & Atmosphere', // NEW: High Impact for Gen-2/Pika
      icon: <Wind size={20} />,
      description: 'World behavior & FX',
      subcategories: [
        { name: 'Environment', options: ['Zero Gravity', 'Underwater Physics', 'Windy/Stormy', 'Slow Motion Fluid', 'Explosion/Destruction'] },
        { name: 'Atmosphere', options: ['Foggy', 'Smoky', 'Hazy', 'Heat Wave Distortion', 'Rain/Snow'] }
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
      id: 'film_stock', // RENAMED: More specific
      title: 'Film Stock & Grade',
      icon: <Film size={20} />,
      description: 'Visual style of the footage',
      subcategories: [
        { name: 'Frame Rate', options: ['24fps (Cinematic)', '30fps (Standard)', '60fps (Smooth)', '12fps (Stop Motion)'] },
        { name: 'Look', options: ['VHS Glitch', '8mm Film Grain', '16mm Vintage', '4k Digital Clean', 'CCTV Footage', 'GoPro Fisheye', 'Anime Style'] }
      ]
    },
    {
      id: 'video_negative',
      title: 'Negative Prompt',
      icon: <Ban size={20} />,
      description: 'Avoid these artifacts',
      subcategories: [
        { name: 'Artifacts', options: ['Blurry', 'Distortion', 'Morphing', 'Static', 'Watermark', 'Text', 'Bad anatomy', 'Shaky Camera'] }
      ]
    }
];