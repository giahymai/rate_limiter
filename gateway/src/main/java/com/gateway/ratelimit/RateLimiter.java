package com.gateway.ratelimit;

public interface RateLimiter {
    boolean tryAcquire(String clientId);
    void updateConfig(int limit, int windowSeconds);
}
