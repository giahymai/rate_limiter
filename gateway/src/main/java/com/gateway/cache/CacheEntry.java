package com.gateway.cache;

public class CacheEntry {
    public final String body;
    public final int statusCode;
    public final long expiresAt;

    public CacheEntry(String body, int statusCode, long ttlMs) {
        this.body = body;
        this.statusCode = statusCode;
        this.expiresAt = System.currentTimeMillis() + ttlMs;
    }

    public boolean isExpired() {
        // TODO
        return false;
    }
}
