package com.gateway.proxy;

import com.gateway.cache.CacheService;
import com.gateway.config.GatewayProperties;
import com.gateway.logging.MetricsAggregator;
import com.gateway.logging.TrafficLogger;
import com.gateway.ratelimit.RateLimiterFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class ProxyService {

    private final GatewayProperties props;
    private final RateLimiterFactory rateLimiterFactory;
    private final CacheService cacheService;
    private final TrafficLogger trafficLogger;
    private final MetricsAggregator metrics;
    private final RestTemplate restTemplate = new RestTemplate();

    public ProxyService(GatewayProperties props, RateLimiterFactory rateLimiterFactory,
                        CacheService cacheService, TrafficLogger trafficLogger,
                        MetricsAggregator metrics) {
        this.props = props;
        this.rateLimiterFactory = rateLimiterFactory;
        this.cacheService = cacheService;
        this.trafficLogger = trafficLogger;
        this.metrics = metrics;
    }

    public ResponseEntity<String> handle(String clientId, String path, HttpServletRequest request) {
        // TODO 1: check rate limiter → return 429 if blocked, log BLOCKED
        // TODO 2: check cache → return cached response if HIT, log HIT
        // TODO 3: forward to backend via RestTemplate → cache 2xx response, log MISS
        // TODO 4: record metrics (allowed/blocked, latency)
        return ResponseEntity.ok("TODO");
    }
}
