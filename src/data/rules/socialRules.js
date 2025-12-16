/**
 * Social Media Platform Constraints (2025)
 * This file defines the hard technical limits for each platform.
 * Used by the Virality Validator and Prompt Engine to ensure compliance.
 */

export const SOCIAL_RULES = {
    // --- X (Twitter) ---
    "X (Twitter)": {
        max_chars_free: 280,
        max_chars_premium: 25000,
        optimal_image_ratio: "16:9",
        max_images: 4,
        video_limit_sec: 140
    },

    // --- LinkedIn ---
    "LinkedIn": {
        max_chars_post: 3000,
        max_chars_article_headline: 100,
        optimal_image_ratio: "4:5 (Portrait) or 1.91:1 (Landscape)",
        carousel_format: "PDF",
        video_limit_min: 15 // minutes (varies by account type)
    },

    // --- Facebook ---
    "Facebook Group": {
        max_chars: 63206, // Technically high, but recommended < 40-80 words for ads
        optimal_image_ratio: "1.91:1",
        video_limit_min: 240
    },

    // --- Instagram ---
    "Instagram Post": {
        max_chars_caption: 2200,
        optimal_hashtags: 30, // Hard limit
        optimal_image_ratio: "4:5 (1080x1350)"
    },
    "Instagram Reels": {
        max_chars_caption: 2200,
        video_limit_sec: 90,
        aspect_ratio: "9:16"
    },

    // --- Threads ---
    "Threads": {
        max_chars: 500,
        max_images: 10,
        video_limit_min: 5
    },

    // --- TikTok ---
    "TikTok": {
        max_chars_caption: 4000, // Recent update expanded this
        video_limit_min: 10, // 10 minutes max upload
        aspect_ratio: "9:16"
    },

    // --- YouTube ---
    "YouTube Shorts": {
        max_chars_title: 100,
        video_limit_sec: 60, // Hard limit for Shorts shelf
        aspect_ratio: "9:16"
    },
    "YouTube Video": {
        max_chars_title: 100,
        max_chars_description: 5000,
        aspect_ratio: "16:9"
    },

    // --- Pinterest ---
    "Pinterest": {
        max_chars_title: 100,
        max_chars_description: 500,
        optimal_image_ratio: "2:3 (1000x1500)"
    }
};