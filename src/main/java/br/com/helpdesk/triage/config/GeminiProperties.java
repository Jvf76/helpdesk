package br.com.helpdesk.triage.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;

@ConfigurationProperties("helpdesk.ai.gemini")
public record GeminiProperties(String apiKey, String model, Duration timeout) {
}
