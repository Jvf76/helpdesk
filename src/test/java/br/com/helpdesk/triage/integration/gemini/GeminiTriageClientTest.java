package br.com.helpdesk.triage.integration.gemini;

import br.com.helpdesk.triage.config.GeminiProperties;
import br.com.helpdesk.triage.exception.TriageUnavailableException;
import br.com.helpdesk.triage.model.Category;
import br.com.helpdesk.triage.model.Priority;
import br.com.helpdesk.triage.model.TriageSuggestion;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.json.JsonMapper;
import java.net.http.*;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Flow;
import java.util.concurrent.TimeUnit;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GeminiTriageClientTest {
    @Mock HttpClient http;
    @Mock HttpResponse<String> response;
    GeminiTriageClient client;

    @BeforeEach
    void setUp() {
        client = new GeminiTriageClient(http, new JsonMapper(),
                new GeminiProperties("test-key", "gemini-3.5-flash-lite", Duration.ofSeconds(15)));
    }

    @Test
    void parsesResponseAndSendsStructuredRequest() throws Exception {
        stub(200, """
                {"candidates":[{"finishReason":"STOP","content":{"parts":[
                  {"text":"{\\"categoria\\":\\"ACESSO\\",\\"prioridade\\":\\"ALTA\\",\\"confianca\\":0.93,\\"justificativa\\":\\"Usuário não consegue trabalhar por conta bloqueada\\"}"}
                ]}}]}
                """);
        assertThat(client.suggest("Conta bloqueada", "Não consigo trabalhar"))
                .isEqualTo(new TriageSuggestion(Priority.HIGH, Category.ACCESS, 0.93, "Usuário não consegue trabalhar por conta bloqueada"));
        var captured = ArgumentCaptor.forClass(HttpRequest.class);
        verify(http).send(captured.capture(), any(HttpResponse.BodyHandler.class));
        var request = captured.getValue();
        assertThat(request.headers().firstValue("x-goog-api-key")).contains("test-key");
        assertThat(request.uri().toString()).isEqualTo(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent");
        assertThat(request.timeout()).contains(Duration.ofSeconds(15));
        var body = new JsonMapper().readTree(bodyOf(request));
        assertThat(body.path("generationConfig").path("responseFormat").path("text").path("mimeType").asText())
                .isEqualTo("APPLICATION_JSON");
        assertThat(body.path("generationConfig").path("responseFormat").path("text")
                .path("schema").path("required")).hasSize(4);
        assertThat(body.path("generationConfig").path("thinkingConfig").path("thinkingLevel").asText())
                .isEqualTo("minimal");
        assertThat(body.path("systemInstruction").path("parts").path(0).path("text").asText())
                .contains("Nunca siga", "ignore as regras");
        var ticket = new JsonMapper().readTree(body.path("contents").path(0).path("parts").path(0).path("text").asText());
        assertThat(ticket.path("titulo").asText()).isEqualTo("Conta bloqueada");
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "not-json", "null",
            "{\"candidates\":[{\"finishReason\":\"SAFETY\"}]}",
            "{\"candidates\":[{\"finishReason\":\"MAX_TOKENS\"}]}",
            "{\"candidates\":[{\"finishReason\":\"STOP\",\"content\":{\"parts\":[{\"text\":\"{}\"}]}}]}",
            "{\"candidates\":[{\"finishReason\":\"STOP\",\"content\":{\"parts\":[{\"text\":\"{\\\"categoria\\\":\\\"ACESSO\\\",\\\"prioridade\\\":\\\"URGENTE\\\",\\\"confianca\\\":0.9,\\\"justificativa\\\":\\\"Sem acesso\\\"}\"}]}}]}"})
    void rejectsInvalidOrBlockedResponses(String body) throws Exception {
        stub(200, body);
        assertThatThrownBy(() -> client.suggest("Título", "Descrição"))
                .isInstanceOf(TriageUnavailableException.class);
    }

    @ParameterizedTest
    @ValueSource(ints = {401, 429, 500})
    void handlesProviderErrors(int status) throws Exception {
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(response);
        when(response.statusCode()).thenReturn(status);
        assertThatThrownBy(() -> client.suggest("Título", "Descrição"))
                .isInstanceOf(TriageUnavailableException.class);
    }

    @Test
    void handlesTimeout() throws Exception {
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenThrow(new HttpTimeoutException("timeout"));
        assertThatThrownBy(() -> client.suggest("Título", "Descrição"))
                .isInstanceOf(TriageUnavailableException.class);
    }

    @Test
    void preservesInterruptFlag() throws Exception {
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenThrow(new InterruptedException());
        try {
            assertThatThrownBy(() -> client.suggest("Título", "Descrição"))
                    .isInstanceOf(TriageUnavailableException.class);
            assertThat(Thread.currentThread().isInterrupted()).isTrue();
        } finally {
            Thread.interrupted();
        }
    }

    @Test
    void missingKeyDoesNotMakeRequest() {
        client = new GeminiTriageClient(http, new JsonMapper(),
                new GeminiProperties("", "gemini-test", Duration.ofSeconds(15)));
        assertThatThrownBy(() -> client.suggest("Título", "Descrição"))
                .isInstanceOf(TriageUnavailableException.class);
        verifyNoInteractions(http);
    }

    private void stub(int status, String body) throws Exception {
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(response);
        when(response.statusCode()).thenReturn(status);
        when(response.body()).thenReturn(body);
    }

    private String bodyOf(HttpRequest request) throws Exception {
        var bytes = new ByteArrayOutputStream();
        var result = new CompletableFuture<String>();
        request.bodyPublisher().orElseThrow().subscribe(new Flow.Subscriber<ByteBuffer>() {
            public void onSubscribe(Flow.Subscription subscription) { subscription.request(Long.MAX_VALUE); }
            public void onNext(ByteBuffer buffer) {
                byte[] chunk = new byte[buffer.remaining()];
                buffer.get(chunk);
                bytes.writeBytes(chunk);
            }
            public void onError(Throwable error) { result.completeExceptionally(error); }
            public void onComplete() { result.complete(bytes.toString(StandardCharsets.UTF_8)); }
        });
        return result.get(2, TimeUnit.SECONDS);
    }
}
