package br.com.backend.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "app.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class KafkaConfig {

    @Value("${app.kafka.topic:test-topic}")
    private String topicName;

    @Bean
    public NewTopic createDefaultTopic() {
        return new NewTopic(topicName, 1, (short) 1);
    }
}



