package br.com.backend.controller;

import br.com.backend.kafka.KafkaProducerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/kafka")
@ConditionalOnProperty(name = "app.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaController {

    private final KafkaProducerService producerService;

    @Value("${app.kafka.topic:test-topic}")
    private String defaultTopic;

    @Autowired
    public KafkaController(KafkaProducerService producerService) {
        this.producerService = producerService;
    }

    @GetMapping("/publish")
    public ResponseEntity<?> publishViaGet(@RequestParam(name = "message", defaultValue = "hello-from-browser") String message,
                                           @RequestParam(name = "topic", required = false) String topic,
                                           @RequestParam(name = "key", required = false) String key) {
        String t = (topic == null || topic.isBlank()) ? defaultTopic : topic;
        producerService.send(t, key, message);
        return ResponseEntity.accepted().body(Map.of("status", "queued", "topic", t));
    }

    @PostMapping("/publish")
    public ResponseEntity<?> publish(@RequestBody Map<String, String> body) {
        String topic = body.getOrDefault("topic", defaultTopic);
        String key = body.getOrDefault("key", null);
        String message = body.getOrDefault("message", "");
        producerService.send(topic, key, message);
        return ResponseEntity.accepted().body(Map.of("status", "queued", "topic", topic));
    }
}


