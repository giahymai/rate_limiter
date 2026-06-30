package com.gateway.cache;

import com.gateway.config.GatewayProperties;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class CacheService {

    private volatile long ttlMs;
    private volatile LRUCache<String, CacheEntry> cache;
    private final AtomicLong hits = new AtomicLong();
    private final AtomicLong misses = new AtomicLong();

    public CacheService(GatewayProperties props) {
        this.ttlMs = props.getCache().getTtlSeconds() * 1000L;
        this.cache = new LRUCache<>(props.getCache().getMaxSize());
    }

    public CacheEntry get(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null) {
            misses.incrementAndGet();
            return null;
        }
        if (entry.isExpired()) {
            cache.remove(key);
            misses.incrementAndGet();
            return null;
        }
        hits.incrementAndGet();
        return entry;
    }

    public void put(String key, String body, int statusCode) {
        cache.put(key, new CacheEntry(body, statusCode, ttlMs));
    }

    public double hitRate() {
        long h = hits.get(), m = misses.get();
        return (h + m == 0) ? 0.0 : (double) h / (h + m);
    }

    public void updateConfig(int ttlSeconds, int maxSize) {
        this.ttlMs = ttlSeconds * 1000L;
        this.cache = new LRUCache<>(maxSize);
        hits.set(0);
        misses.set(0);
    }
}
