package com.gateway.logging;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TrafficLogger {

    private static final int MAX_LOG_SIZE = 10_000;
    private final AtomicLong idCounter = new AtomicLong();

    public synchronized void record(RequestRecord r) {
        // TODO: append to ring buffer, evict oldest when full, log via SLF4J
    }

    public synchronized List<RequestRecord> getRecent(int limit, String clientId) {
        // TODO: return newest `limit` records, filtered by clientId if provided
        return List.of();
    }

    public String nextId() {
        return "req_" + idCounter.incrementAndGet();
    }
}
