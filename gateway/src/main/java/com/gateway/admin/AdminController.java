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
@CrossOrigin(origins = "http://localhost:5173")
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
        // TODO: return requestsPerSecond, totalRequests, blockedRequests,
        //       blockedRatio, avgLatencyMs, cacheHitRate
        return Map.of();
    }

    @GetMapping("/logs")
    public List<RequestRecord> getLogs(
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(required = false) String clientId) {
        // TODO: delegate to trafficLogger.getRecent(limit, clientId)
        return List.of();
    }

    @GetMapping("/config")
    public Map<String, Object> getConfig() {
        // TODO: return current algorithm, limit, windowSeconds, cacheTtlSeconds
        return Map.of();
    }

    @PutMapping("/config")
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody Map<String, Object> body) {
        // TODO: parse body, call rateLimiterFactory.reconfigure() and cacheService.updateConfig()
        return ResponseEntity.ok(Map.of());
    }
}
