package com.mock;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@RestController
public class WeatherController {

    @GetMapping("/weather")
    public Map<String, Object> weather() throws InterruptedException {
        // Simulate variable backend latency (5–20ms)
        Thread.sleep(ThreadLocalRandom.current().nextInt(5, 20));
        return Map.of(
                "city", "Hanoi",
                "tempC", ThreadLocalRandom.current().nextInt(20, 35),
                "humidity", ThreadLocalRandom.current().nextInt(60, 90),
                "condition", "Sunny"
        );
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
