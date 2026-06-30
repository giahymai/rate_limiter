package com.gateway.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.Comparator;
import java.util.Deque;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TrafficLogger {

    private static final Logger log = LoggerFactory.getLogger(TrafficLogger.class);
    private static final int MAX_LOG_SIZE = 10_000;

    private final AtomicLong idCounter = new AtomicLong();
    private final Deque<RequestRecord> buffer = new ArrayDeque<>();

    public synchronized void record(RequestRecord r) {
        if (buffer.size() >= MAX_LOG_SIZE) {
            buffer.pollFirst();
        }
        buffer.addLast(r);
        log.info("[{}] {} {} {}ms cache={}", r.status, r.clientId, r.path, r.latencyMs, r.cache);
    }

    public synchronized List<RequestRecord> getRecent(int limit, String clientId) {
        return buffer.stream()
            .filter(r -> clientId == null || clientId.isBlank() || r.clientId.equals(clientId))
            .sorted(Comparator.comparing((RequestRecord r) -> r.timestamp).reversed())
            .limit(limit)
            .toList();
    }

    public String nextId() {
        return "req_" + idCounter.incrementAndGet();
    }
}
