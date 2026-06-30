package com.gateway.ratelimit;

import com.gateway.config.GatewayProperties;
import org.springframework.stereotype.Component;

@Component
public class RateLimiterFactory {

    private final GatewayProperties props;
    private volatile RateLimiter current;

    public RateLimiterFactory(GatewayProperties props) {
        this.props = props;
        current = build(
            props.getRateLimit().getAlgorithm(),
            props.getRateLimit().getLimit(),
            props.getRateLimit().getWindowSeconds()
        );
    }

    public RateLimiter get() {
        return current;
    }

    public synchronized void reconfigure(String algorithm, int limit, int windowSeconds) {
        props.getRateLimit().setAlgorithm(algorithm);
        props.getRateLimit().setLimit(limit);
        props.getRateLimit().setWindowSeconds(windowSeconds);
        current = build(algorithm, limit, windowSeconds);
    }

    private RateLimiter build(String algorithm, int limit, int windowSeconds) {
        return switch (algorithm.toUpperCase()) {
            case "SLIDING_WINDOW" -> new SlidingWindowRateLimiter(limit, windowSeconds);
            default               -> new TokenBucketRateLimiter(limit, windowSeconds);
        };
    }
}
