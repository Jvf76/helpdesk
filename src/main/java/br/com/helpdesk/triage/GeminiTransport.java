package br.com.helpdesk.triage;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;

interface GeminiTransport {
    GeminiTransportResponse post(URI uri, Duration timeout, String apiKey, String body)
            throws IOException, InterruptedException;
}

record GeminiTransportResponse(int statusCode, String body) {
}
