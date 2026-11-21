const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production.');
}

const jwtSecret = process.env.JWT_SECRET || 'dev_only_secret_change_me';
const configuredDelay = Number.parseInt(process.env.DELAY_MS || '0', 10);
const delayMs = Number.isFinite(configuredDelay) && configuredDelay > 0 ? configuredDelay : 0;

// Redis variables Vercel ka Upstash khud add karta hai
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

module.exports = { port, jwtSecret, delayMs, redisUrl, redisToken };