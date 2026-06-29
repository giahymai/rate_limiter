package com.gateway.ratelimit;

import java.util.concurrent.ConcurrentHashMap;

public class SlidingWindowRateLimiter implements RateLimiter {

    private volatile int limit;
    private volatile int windowSeconds;
    private final ConcurrentHashMap<String, Object> windows = new ConcurrentHashMap<>();

    public SlidingWindowRateLimiter(int limit, int windowSeconds) {
        this.limit = limit;
        this.windowSeconds = windowSeconds;
    }

    @Override
    public boolean tryAcquire(String clientId) {
        // TODO: get or create timestamp queue for clientId
        //       evict timestamps older than windowSeconds
        //       if queue.size < limit → add now and return true, else false
        return false;
    }

    @Override
    public void updateConfig(int limit, int windowSeconds) {
        // TODO: update limit and window, clear all windows
    }
}
