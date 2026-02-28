import { redis } from "@/lib/redis";

interface CacheOptions {
  ttlSeconds: number;
}

/**
 * Fetch a URL with Redis caching. Returns cached data if available,
 * otherwise fetches, stores, and returns fresh data.
 */
export async function cachedFetch<T>(
  key: string,
  url: string,
  opts: CacheOptions
): Promise<T> {
  // Try cache first
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch {
    // Redis unavailable — proceed to fetch
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as T;

    // Store in cache (fire-and-forget)
    try {
      await redis.set(key, JSON.stringify(data), { ex: opts.ttlSeconds });
    } catch {
      // Redis unavailable — data still returned
    }

    return data;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/**
 * Invalidate a cached entry by key.
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // Redis unavailable
  }
}
