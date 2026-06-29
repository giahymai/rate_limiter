package com.gateway.ratelimit;

import java.util.concurrent.ConcurrentHashMap;

public class TokenBucketRateLimiter implements RateLimiter {

    private volatile int capacity;
    private volatile int windowSeconds;
    private final ConcurrentHashMap<String, Object> buckets = new ConcurrentHashMap<>();

    public TokenBucketRateLimiter(int capacity, int windowSeconds) {
        this.capacity = capacity;
        this.windowSeconds = windowSeconds;
    }

    @Override
    public boolean tryAcquire(String clientId) {
        // TODO: get or create bucket for clientId, refill if window elapsed, consume 1 token
        return false;
    }

    @Override
    public void updateConfig(int limit, int windowSeconds) {
        // TODO: update capacity and window, clear all buckets
    }
}
