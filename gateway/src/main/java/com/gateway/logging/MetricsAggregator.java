package com.gateway.logging;

import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class MetricsAggregator {

    private final AtomicLong totalRequests    = new AtomicLong();
    private final AtomicLong blockedRequests  = new AtomicLong();
    private final AtomicLong totalLatencyMs   = new AtomicLong();
    private volatile double  lastRps          = 0;

    // Rolling 1-second window for RPS estimation
    private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
    private final AtomicLong windowCount = new AtomicLong();

    public void record(boolean allowed, long latencyMs) {
        totalRequests.incrementAndGet();
        if (!allowed) blockedRequests.incrementAndGet();
        totalLatencyMs.addAndGet(latencyMs);

        long now   = System.currentTimeMillis();
        long start = windowStart.get();
        long elapsed = now - start;

        if (elapsed >= 1000) {
            if (windowStart.compareAndSet(start, now)) {
                lastRps = (double) windowCount.getAndSet(1) / (elapsed / 1000.0);
            } else {
                windowCount.incrementAndGet();
            }
        } else {
            windowCount.incrementAndGet();
        }
    }

    public double getRequestsPerSecond() { return lastRps; }
    public long   getTotalRequests()     { return totalRequests.get(); }
    public long   getBlockedRequests()   { return blockedRequests.get(); }

    public double getBlockedRatio() {
        long total = totalRequests.get();
        return total == 0 ? 0.0 : (double) blockedRequests.get() / total;
    }

    public double getAvgLatencyMs() {
        long total = totalRequests.get();
        return total == 0 ? 0.0 : (double) totalLatencyMs.get() / total;
    }
}
