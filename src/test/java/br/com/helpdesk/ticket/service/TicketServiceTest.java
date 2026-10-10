package br.com.helpdesk.ticket.service;

import br.com.helpdesk.ticket.dto.CreateTicketRequest;
import br.com.helpdesk.ticket.dto.TicketResponse;
import br.com.helpdesk.ticket.model.Ticket;
import br.com.helpdesk.ticket.model.TriageStatus;
import br.com.helpdesk.ticket.repository.TicketRepository;

import br.com.helpdesk.triage.exception.TriageUnavailableException;
import br.com.helpdesk.triage.model.Category;
import br.com.helpdesk.triage.model.Priority;
import br.com.helpdesk.triage.model.TriageSuggestion;
import br.com.helpdesk.triage.service.TriageClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {
    @Mock TicketRepository repository;
    @Mock TriageClient triageClient;
    @InjectMocks TicketService service;

    @Test
    void savesBeforeCallingAiThenPersistsSuggestion() {
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(triageClient.suggest("Sem rede", "Todos sem internet"))
                .thenReturn(new TriageSuggestion(Priority.CRITICAL, Category.NETWORK, 0.96, "Vários usuários sem acesso à rede"));

        TicketResponse result = service.create(new CreateTicketRequest(" Sem rede ", "Todos sem internet"));

        assertThat(result.id()).isNotNull();
        assertThat(result.triageStatus()).isEqualTo(TriageStatus.COMPLETED);
        assertThat(result.suggestedPriority()).isEqualTo(Priority.CRITICAL);
        assertThat(result.suggestedCategory()).isEqualTo(Category.NETWORK);
        assertThat(result.triageConfidence()).isEqualByComparingTo("0.96");
        assertThat(result.triageJustification()).isEqualTo("Vários usuários sem acesso à rede");
        var order = inOrder(repository, triageClient);
        order.verify(repository).saveAndFlush(any());
        order.verify(triageClient).suggest("Sem rede", "Todos sem internet");
        order.verify(repository).saveAndFlush(any());
    }

    @Test
    void preservesPendingTicketWhenAiFails() {
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(triageClient.suggest(anyString(), anyString()))
                .thenThrow(new TriageUnavailableException("timeout"));

        TicketResponse result = service.create(new CreateTicketRequest("Problema", "Descrição"));

        assertThat(result.triageStatus()).isEqualTo(TriageStatus.PENDING);
        assertThat(result.suggestedPriority()).isNull();
        assertThat(result.suggestedCategory()).isNull();
        assertThat(result.triageConfidence()).isNull();
        assertThat(result.triageJustification()).isNull();
        verify(repository, times(1)).saveAndFlush(any());
    }

    @Test
    void doesNotCallAiIfInitialSaveFails() {
        when(repository.saveAndFlush(any())).thenThrow(new IllegalStateException("database unavailable"));
        assertThatThrownBy(() -> service.create(new CreateTicketRequest("Problema", "Descrição")))
                .isInstanceOf(IllegalStateException.class);
        verifyNoInteractions(triageClient);
    }

    @Test
    void findsSavedTicketWithoutCallingAiAgain() {
        Ticket ticket = new Ticket("Problema", "Descrição");
        when(repository.findById(ticket.getId())).thenReturn(Optional.of(ticket));
        assertThat(service.findById(ticket.getId()).title()).isEqualTo("Problema");
        verifyNoInteractions(triageClient);
    }

    @Test
    void returnsNotFoundForUnknownId() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.findById(id)).isInstanceOfSatisfying(
                ResponseStatusException.class, error -> assertThat(error.getStatusCode().value()).isEqualTo(404));
    }
}
