package br.com.helpdesk;

import br.com.helpdesk.ticket.dto.CreateTicketRequest;
import br.com.helpdesk.ticket.model.TriageStatus;
import br.com.helpdesk.ticket.repository.TicketRepository;
import br.com.helpdesk.ticket.service.TicketService;
import br.com.helpdesk.triage.exception.TriageUnavailableException;
import br.com.helpdesk.triage.model.Category;
import br.com.helpdesk.triage.model.Priority;
import br.com.helpdesk.triage.model.TriageSuggestion;
import br.com.helpdesk.triage.service.TriageClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@EnabledIfEnvironmentVariable(named = "TEST_DB_URL", matches = ".+")
@SpringBootTest(properties = {
        "spring.datasource.url=${TEST_DB_URL}",
        "spring.datasource.username=${TEST_DB_USERNAME:helpdesk}",
        "spring.datasource.password=${TEST_DB_PASSWORD:}"
})
class HelpdeskApplicationTests {
    @Autowired TicketService service;
    @Autowired TicketRepository repository;
    @MockitoBean TriageClient triageClient;

    @Test
    void persistsAndReloadsSuggestionInPostgres() {
        when(triageClient.suggest(anyString(), anyString()))
                .thenReturn(new TriageSuggestion(Priority.HIGH, Category.NETWORK, 0.91, "Usuário sem acesso à rede"));
        var created = service.create(new CreateTicketRequest("Teste integração", "Sem rede"));
        try {
            var saved = service.findById(created.id());
            assertThat(saved.suggestedPriority()).isEqualTo(Priority.HIGH);
            assertThat(saved.suggestedCategory()).isEqualTo(Category.NETWORK);
            assertThat(saved.triageConfidence()).isEqualByComparingTo("0.91");
            assertThat(saved.triageJustification()).isEqualTo("Usuário sem acesso à rede");
            assertThat(saved.triageStatus()).isEqualTo(TriageStatus.COMPLETED);
        } finally {
            repository.deleteById(created.id());
        }
    }

    @Test
    void persistsPendingTicketWhenAiFails() {
        when(triageClient.suggest(anyString(), anyString()))
                .thenThrow(new TriageUnavailableException("timeout"));
        var created = service.create(new CreateTicketRequest("Teste integração", "Sem rede"));
        try {
            var saved = service.findById(created.id());
            assertThat(saved.triageStatus()).isEqualTo(TriageStatus.PENDING);
            assertThat(saved.suggestedPriority()).isNull();
            assertThat(saved.suggestedCategory()).isNull();
            assertThat(saved.triageConfidence()).isNull();
            assertThat(saved.triageJustification()).isNull();
        } finally {
            repository.deleteById(created.id());
        }
    }
}
