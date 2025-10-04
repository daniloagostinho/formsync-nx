package br.com.backend.kafka;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaConsumer {

    @Value("${app.kafka.topic:test-topic}")
    private String topicName;

    @KafkaListener(topics = "${app.kafka.topic:test-topic}", groupId = "${SPRING_KAFKA_CONSUMER_GROUP_ID:backend-group}")
    public void listen(@Payload String message,
                       @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                       @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        System.out.printf("[KAFKA] Consumed topic=%s key=%s message=%s%n", topic, key, message);
    }
}



