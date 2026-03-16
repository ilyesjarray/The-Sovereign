type CacheEntry<T> = {
    data: T;
    timestamp: number;
};

const cache = new Map<string, CacheEntry<any>>();
const TTL = 30000; // 30 seconds

export async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < TTL) {
        console.log(`[Cache Hit] ${key}`);
        return cached.data;
    }

    console.log(`[Cache Miss] ${key}`);
    const data = await fetcher();
    cache.set(key, { data, timestamp: now });
    return data;
}

export const clearCache = (key?: string) => {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
};
