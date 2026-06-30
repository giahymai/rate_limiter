package com.gateway.proxy;

import com.gateway.cache.CacheEntry;
import com.gateway.cache.CacheService;
import com.gateway.config.GatewayProperties;
import com.gateway.logging.MetricsAggregator;
import com.gateway.logging.RequestRecord;
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
        long start = System.currentTimeMillis();

        // Step 1: rate limit check
        boolean allowed = rateLimiterFactory.get().tryAcquire(clientId);
        if (!allowed) {
            long latency = System.currentTimeMillis() - start;
            metrics.record(false, latency);
            trafficLogger.record(new RequestRecord(
                trafficLogger.nextId(), clientId, path, latency, "BLOCKED", "SKIP"));
            return ResponseEntity.status(429).body("Too Many Requests");
        }

        // Step 2: cache check — key is the request path
        CacheEntry cached = cacheService.get(path);
        if (cached != null) {
            long latency = System.currentTimeMillis() - start;
            metrics.record(true, latency);
            trafficLogger.record(new RequestRecord(
                trafficLogger.nextId(), clientId, path, latency, "ALLOWED", "HIT"));
            return ResponseEntity.status(cached.statusCode).body(cached.body);
        }

        // Step 3: forward to backend — strip the /api prefix the gateway adds
        String backendPath = path.replaceFirst("^/api", "");
        String url = props.getBackendUrl() + backendPath;
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                cacheService.put(path, response.getBody(), response.getStatusCode().value());
            }
            long latency = System.currentTimeMillis() - start;
            metrics.record(true, latency);
            trafficLogger.record(new RequestRecord(
                trafficLogger.nextId(), clientId, path, latency, "ALLOWED", "MISS"));
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            metrics.record(true, latency);
            trafficLogger.record(new RequestRecord(
                trafficLogger.nextId(), clientId, path, latency, "ALLOWED", "MISS"));
            return ResponseEntity.status(502).body("Bad Gateway: " + e.getMessage());
        }
    }
}
