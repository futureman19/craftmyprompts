// This function runs on Vercel's servers.
// It acts as a secure proxy to the YouTube Data API v3.
import { checkRateLimit } from './_utils/rate-limiter.js';

export default async function handler(req, res) {
  // 1. Rate Limit Check (Protect YouTube Quota)
  const limitStatus = checkRateLimit(req);
  if (!limitStatus.success) {
      return res.status(429).json({ error: limitStatus.error });
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { categoryId, region } = req.body;

  // 3. Determine API Key
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "YouTube API Key is missing. Please add YOUTUBE_API_KEY to Vercel settings." });
  }

  // HELPER: Sanitize logs to remove sensitive keys
  const sanitizeLog = (msg) => {
    if (typeof msg === 'string') {
        return msg.replace(/key=[^&]*/g, 'key=***');
    }
    return msg;
  };

  try {
    // 4. Construct YouTube API URL
    const baseUrl = 'https://www.googleapis.com/youtube/v3/videos';
    const params = new URLSearchParams({
        part: 'snippet,statistics',
        chart: 'mostPopular',
        maxResults: '10',
        regionCode: region || 'US',
        key: apiKey
    });

    // Add Category Filter if specific (0 = All/General)
    // Common IDs: 28 (Tech), 20 (Gaming), 27 (Education)
    if (categoryId && categoryId !== '0') {
        params.append('videoCategoryId', categoryId);
    }

    // 5. Call YouTube API
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
        console.error("YouTube API Error:", sanitizeLog(JSON.stringify(data)));
        throw new Error(data.error?.message || "Failed to fetch trends");
    }

    // 6. Transform Data for Frontend
    // We strip out the heavy JSON and return only what the UI needs
    const trends = data.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        views: item.statistics.viewCount,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt
    }));

    return res.status(200).json({ trends });

  } catch (error) {
    console.error("Trends Proxy Error:", sanitizeLog(error.message));
    return res.status(500).json({ error: "Failed to fetch trending topics." });
  }
}