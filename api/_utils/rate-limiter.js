// Lightweight Rate Limiter for Vercel Serverless Functions
// Prevents abuse of your paid API keys.

const rateLimitMap = new Map();

export function checkRateLimit(req, limit = 10, windowMs = 60 * 1000) {
    // 1. Identify the User (IP Address)
    // Vercel passes the real IP in the 'x-forwarded-for' header
    const ip = req.headers['x-forwarded-for'] || 'unknown-ip';

    const now = Date.now();
    const record = rateLimitMap.get(ip);

    // 2. First request from this IP
    if (!record) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return { success: true };
    }

    // 3. Check if window has passed (Reset)
    if (now - record.startTime > windowMs) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return { success: true };
    }

    // 4. Check limit
    if (record.count >= limit) {
        return { 
            success: false, 
            error: `Rate limit exceeded. Try again in ${Math.ceil((windowMs - (now - record.startTime)) / 1000)} seconds.` 
        };
    }

    // 5. Increment count
    record.count += 1;
    return { success: true };
}

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
        if (now - record.startTime > 300000) { // 5 mins
            rateLimitMap.delete(ip);
        }
    }
}, 300000);