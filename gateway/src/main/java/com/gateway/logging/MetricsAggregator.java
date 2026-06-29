package com.gateway.logging;

import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class MetricsAggregator {

    private final AtomicLong totalRequests = new AtomicLong();
    private final AtomicLong blockedRequests = new AtomicLong();
    private final AtomicLong totalLatencyMs = new AtomicLong();
    private volatile double lastRps = 0;

    public void record(boolean allowed, long latencyMs) {
        // TODO: increment counters, update rolling rps estimate
    }

    public double getRequestsPerSecond() { return lastRps; }
    public long getTotalRequests()       { return totalRequests.get(); }
    public long getBlockedRequests()     { return blockedRequests.get(); }

    public double getBlockedRatio() {
        // TODO
        return 0;
    }

    public double getAvgLatencyMs() {
        // TODO
        return 0;
    }
}
