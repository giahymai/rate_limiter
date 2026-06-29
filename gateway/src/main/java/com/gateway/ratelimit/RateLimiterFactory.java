package com.gateway.ratelimit;

import com.gateway.config.GatewayProperties;
import org.springframework.stereotype.Component;

@Component
public class RateLimiterFactory {

    private final GatewayProperties props;
    private volatile RateLimiter current;

    public RateLimiterFactory(GatewayProperties props) {
        this.props = props;
        // TODO: build initial RateLimiter from props
    }

    public RateLimiter get() {
        return current;
    }

    public synchronized void reconfigure(String algorithm, int limit, int windowSeconds) {
        // TODO: rebuild current based on algorithm string
    }
}
