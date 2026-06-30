package com.gateway.ratelimit;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

public class SlidingWindowRateLimiter implements RateLimiter {

    private volatile int limit;
    private volatile int windowSeconds;
    private final ConcurrentHashMap<String, Deque<Long>> windows = new ConcurrentHashMap<>();

    public SlidingWindowRateLimiter(int limit, int windowSeconds) {
        this.limit = limit;
        this.windowSeconds = windowSeconds;
    }

    @Override
    public boolean tryAcquire(String clientId) {
        Deque<Long> timestamps = windows.computeIfAbsent(clientId, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            long now = System.currentTimeMillis();
            long cutoff = now - (long) windowSeconds * 1000;

            while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
                timestamps.pollFirst();
            }

            if (timestamps.size() < limit) {
                timestamps.addLast(now);
                return true;
            }
            return false;
        }
    }

    @Override
    public void updateConfig(int limit, int windowSeconds) {
        this.limit = limit;
        this.windowSeconds = windowSeconds;
        windows.clear();
    }
}
