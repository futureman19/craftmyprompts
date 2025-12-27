// OWNER: The Publisher Agent
// PURPOSE: Formatting, Metadata, and Platform Optimization

export const PUBLISHER_BRAIN = {
    knowledge_base: "Publishing Formats & Platform Specs",
    formats: [
        {
            id: "markdown",
            rules: ["Use # for headers", "Use ** for bold", "Use > for blockquotes"]
        },
        {
            id: "html",
            rules: ["Semantic tags (<article>, <section>)", "Alt text for images"]
        },
        {
            id: "social_thread",
            platform: "Twitter/X",
            constraints: ["280 chars per post", "Thread numbering (1/X)", "Hashtags at the end"]
        },
        {
            id: "linkedin_post",
            platform: "LinkedIn",
            constraints: ["1300-2000 chars ideal", "Professional tone", "Line breaks for readability"]
        }
    ],
    metadata_checklist: [
        "SEO Title",
        "Meta Description",
        "Tags/Categories",
        "Canonical URL",
        "Featured Image Alt Text"
    ]
};
