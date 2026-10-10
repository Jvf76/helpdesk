package br.com.helpdesk.triage;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.json.JsonMapper;
import java.time.Duration;

@Configuration
@EnableConfigurationProperties(GeminiProperties.class)
public class GeminiConfiguration {
    @Bean
    TriageClient triageClient(GeminiProperties properties) {
        return new GeminiTriageClient(new UrlConnectionGeminiTransport(Duration.ofSeconds(5)),
                new JsonMapper(), properties);
    }
}
