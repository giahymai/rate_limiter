package com.gateway.ratelimit;

import java.util.concurrent.ConcurrentHashMap;

public class TokenBucketRateLimiter implements RateLimiter {

    private volatile int capacity;
    private volatile int windowSeconds;
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public TokenBucketRateLimiter(int capacity, int windowSeconds) {
        this.capacity = capacity;
        this.windowSeconds = windowSeconds;
    }

    @Override
    public boolean tryAcquire(String clientId) {
        Bucket bucket = buckets.computeIfAbsent(clientId, k -> new Bucket(capacity, windowSeconds));
        synchronized (bucket) {
            if (System.currentTimeMillis() >= bucket.nextRefillAt) {
                bucket.tokens = capacity;
                bucket.nextRefillAt = System.currentTimeMillis() + (long) windowSeconds * 1000;
            }
            if (bucket.tokens > 0) {
                bucket.tokens--;
                return true;
            }
            return false;
        }
    }

    @Override
    public void updateConfig(int limit, int windowSeconds) {
        this.capacity = limit;
        this.windowSeconds = windowSeconds;
        buckets.clear();
    }

    private static class Bucket {
        int tokens;
        long nextRefillAt;

        Bucket(int capacity, int windowSeconds) {
            this.tokens = capacity;
            this.nextRefillAt = System.currentTimeMillis() + (long) windowSeconds * 1000;
        }
    }
}
