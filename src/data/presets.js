import { GENERAL_PRESETS } from './presets/general';
import { CODING_PRESETS } from './presets/coding';
import { SOCIAL_PRESETS } from './presets/social';
import { ART_PRESETS } from './presets/art';
import { VIDEO_PRESETS } from './presets/video';
import { AVATAR_PRESETS } from './presets/avatar';

// This file aggregates all specialized preset modules.
// It maps the data to the keys expected by the Builder UI.

export const PRESETS = {
    // TEXT MODES
    general: GENERAL_PRESETS, // Combines "General" and "Writing"
    coding: CODING_PRESETS,
    social: SOCIAL_PRESETS,   // The new Viral Architecture presets
    
    // Legacy support: Map 'writing' to general in case the UI requests it before update
    writing: GENERAL_PRESETS, 

    // VISUAL MODES
    art: ART_PRESETS,
    video: VIDEO_PRESETS,
    avatar: AVATAR_PRESETS
};