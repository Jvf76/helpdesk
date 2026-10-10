package br.com.helpdesk.triage;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

final class UrlConnectionGeminiTransport implements GeminiTransport {
    private final Duration connectTimeout;

    UrlConnectionGeminiTransport(Duration connectTimeout) {
        this.connectTimeout = connectTimeout;
    }

    @Override
    public GeminiTransportResponse post(URI uri, Duration timeout, String apiKey, String body) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) uri.toURL().openConnection();
        try {
            connection.setRequestMethod("POST");
            connection.setConnectTimeout(toMilliseconds(connectTimeout));
            connection.setReadTimeout(toMilliseconds(timeout));
            connection.setRequestProperty("x-goog-api-key", apiKey);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);
            connection.getOutputStream().write(body.getBytes(StandardCharsets.UTF_8));

            int statusCode = connection.getResponseCode();
            if (statusCode != HttpURLConnection.HTTP_OK) {
                InputStream error = connection.getErrorStream();
                if (error == null) {
                    return new GeminiTransportResponse(statusCode, "");
                }
                try (error) {
                    return new GeminiTransportResponse(statusCode,
                            new String(error.readAllBytes(), StandardCharsets.UTF_8));
                }
            }
            try (InputStream input = connection.getInputStream()) {
                return new GeminiTransportResponse(statusCode,
                        new String(input.readAllBytes(), StandardCharsets.UTF_8));
            }
        } finally {
            connection.disconnect();
        }
    }

    private static int toMilliseconds(Duration duration) {
        return Math.toIntExact(Math.min(duration.toMillis(), Integer.MAX_VALUE));
    }
}
