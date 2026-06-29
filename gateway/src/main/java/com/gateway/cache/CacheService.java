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
        // TODO: init ttlMs and cache from props
    }

    public CacheEntry get(String key) {
        // TODO: lookup key, evict if expired, track hit/miss
        return null;
    }

    public void put(String key, String body, int statusCode) {
        // TODO
    }

    public double hitRate() {
        // TODO: hits / (hits + misses)
        return 0;
    }

    public void updateConfig(int ttlSeconds, int maxSize) {
        // TODO: replace cache and reset counters
    }
}
