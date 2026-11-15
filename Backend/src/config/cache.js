const Redis = require("ioredis");

let redisClient = null;
let isConnected = false;
const inMemoryCache = new Map();

try {
  const host = (process.env.REDIS_HOST || "").trim();
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);
  const password = (process.env.REDIS_PASSWORD || "").trim();

  if (host) {
    const RedisConstructor = typeof Redis === "function" ? Redis : Redis.default;
    redisClient = new RedisConstructor({
      host,
      port,
      password: password || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 4000,
      retryStrategy(times) {
        if (times > 3) {
          // Stop retrying if host unreachable
          return null;
        }
        return Math.min(times * 1000, 3000);
      },
    });

    redisClient.on("connect", () => {
      isConnected = true;
      console.log("Redis connected successfully");
    });

    redisClient.on("ready", () => {
      isConnected = true;
    });

    redisClient.on("error", (err) => {
      isConnected = false;
      // Do not throw; log as warning and keep app running via fallback
      console.warn("Redis warning (using fallback cache):", err.message);
    });

    redisClient.connect().catch((err) => {
      isConnected = false;
      console.warn("Redis initial connect skipped:", err.message);
    });
  }
} catch (err) {
  console.warn("Failed to initialize Redis client:", err.message);
}

// Wrapper interface providing set, get, del with automatic in-memory fallback
const cacheService = {
  async set(key, value, mode, duration) {
    if (isConnected && redisClient) {
      try {
        if (mode && duration) {
          return await redisClient.set(key, value, mode, duration);
        }
        return await redisClient.set(key, value);
      } catch (err) {
        console.warn("Redis set failed, saving in fallback:", err.message);
      }
    }
    const expiresAt = duration ? Date.now() + duration * 1000 : null;
    inMemoryCache.set(key, { value, expiresAt });
    return "OK";
  },

  async get(key) {
    if (isConnected && redisClient) {
      try {
        return await redisClient.get(key);
      } catch (err) {
        console.warn("Redis get failed, querying fallback:", err.message);
      }
    }
    const entry = inMemoryCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      inMemoryCache.delete(key);
      return null;
    }
    return entry.value;
  },

  async del(key) {
    if (isConnected && redisClient) {
      try {
        return await redisClient.del(key);
      } catch (err) {
        console.warn("Redis del failed:", err.message);
      }
    }
    inMemoryCache.delete(key);
    return 1;
  },

  isRedisConnected() {
    return isConnected;
  },
};

module.exports = cacheService;
