package com.gateway.logging;

import java.time.Instant;

public class RequestRecord {
    public final String id;
    public final String clientId;
    public final Instant timestamp;
    public final String path;
    public final long latencyMs;
    public final String status;   // ALLOWED | BLOCKED
    public final String cache;    // HIT | MISS | SKIP

    public RequestRecord(String id, String clientId, String path,
                         long latencyMs, String status, String cache) {
        this.id = id;
        this.clientId = clientId;
        this.timestamp = Instant.now();
        this.path = path;
        this.latencyMs = latencyMs;
        this.status = status;
        this.cache = cache;
    }
}
