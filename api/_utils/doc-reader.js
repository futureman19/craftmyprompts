import fs from 'fs';
import path from 'path';

/**
 * Reads the prompting guide for a specific provider.
 * @param {string} provider - 'openai', 'anthropic', 'google'
 * @returns {string} - The raw markdown content
 */
export const getProviderGuide = (provider) => {
    try {
        const safeProvider = (provider || 'openai').toLowerCase();
        // Map UI names to filenames
        let filename = `${safeProvider}.md`;
        if (safeProvider.includes('claude')) filename = 'anthropic.md';
        if (safeProvider.includes('gemini')) filename = 'google.md';
        if (safeProvider.includes('gpt')) filename = 'openai.md';

        const filePath = path.join(process.cwd(), 'src', 'data', 'docs', filename);

        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8');
        }
        return "No specific documentation found for this provider.";
    } catch (error) {
        console.error(`Error reading doc for ${provider}:`, error);
        return "";
    }
};
