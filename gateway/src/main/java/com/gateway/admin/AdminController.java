package com.gateway.admin;

import com.gateway.cache.CacheService;
import com.gateway.config.GatewayProperties;
import com.gateway.logging.MetricsAggregator;
import com.gateway.logging.RequestRecord;
import com.gateway.logging.TrafficLogger;
import com.gateway.ratelimit.RateLimiterFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class AdminController {

    private final MetricsAggregator metrics;
    private final CacheService cacheService;
    private final TrafficLogger trafficLogger;
    private final RateLimiterFactory rateLimiterFactory;
    private final GatewayProperties props;

    public AdminController(MetricsAggregator metrics, CacheService cacheService,
                           TrafficLogger trafficLogger, RateLimiterFactory rateLimiterFactory,
                           GatewayProperties props) {
        this.metrics = metrics;
        this.cacheService = cacheService;
        this.trafficLogger = trafficLogger;
        this.rateLimiterFactory = rateLimiterFactory;
        this.props = props;
    }

    @GetMapping("/metrics")
    public Map<String, Object> getMetrics() {
        return Map.of(
            "requestsPerSecond", metrics.getRequestsPerSecond(),
            "totalRequests",     metrics.getTotalRequests(),
            "blockedRequests",   metrics.getBlockedRequests(),
            "blockedRatio",      metrics.getBlockedRatio(),
            "avgLatencyMs",      metrics.getAvgLatencyMs(),
            "cacheHitRate",      cacheService.hitRate()
        );
    }

    @GetMapping("/logs")
    public List<RequestRecord> getLogs(
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(required = false) String clientId) {
        return trafficLogger.getRecent(limit, clientId);
    }

    @GetMapping("/config")
    public Map<String, Object> getConfig() {
        return Map.of(
            "algorithm",       props.getRateLimit().getAlgorithm(),
            "limit",           props.getRateLimit().getLimit(),
            "windowSeconds",   props.getRateLimit().getWindowSeconds(),
            "cacheTtlSeconds", props.getCache().getTtlSeconds()
        );
    }

    @PutMapping("/config")
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody Map<String, Object> body) {
        String algorithm     = (String)  body.getOrDefault("algorithm",       props.getRateLimit().getAlgorithm());
        int    limit         = ((Number) body.getOrDefault("limit",           props.getRateLimit().getLimit())).intValue();
        int    windowSeconds = ((Number) body.getOrDefault("windowSeconds",   props.getRateLimit().getWindowSeconds())).intValue();
        int    cacheTtl      = ((Number) body.getOrDefault("cacheTtlSeconds", props.getCache().getTtlSeconds())).intValue();
        int    cacheMaxSize  = ((Number) body.getOrDefault("cacheMaxSize",    props.getCache().getMaxSize())).intValue();

        rateLimiterFactory.reconfigure(algorithm, limit, windowSeconds);
        cacheService.updateConfig(cacheTtl, cacheMaxSize);
        props.getCache().setTtlSeconds(cacheTtl);

        return ResponseEntity.ok(Map.of(
            "algorithm",       algorithm,
            "limit",           limit,
            "windowSeconds",   windowSeconds,
            "cacheTtlSeconds", cacheTtl
        ));
    }
}
