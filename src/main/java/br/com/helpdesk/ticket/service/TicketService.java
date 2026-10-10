package br.com.helpdesk.ticket.service;

import br.com.helpdesk.ticket.dto.CreateTicketRequest;
import br.com.helpdesk.ticket.dto.TicketResponse;
import br.com.helpdesk.ticket.model.Ticket;
import br.com.helpdesk.ticket.repository.TicketRepository;
import br.com.helpdesk.triage.service.TriageClient;
import br.com.helpdesk.triage.exception.TriageUnavailableException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {
    private static final Logger log = LoggerFactory.getLogger(TicketService.class);
    private final TicketRepository repository;
    private final TriageClient triageClient;

    public TicketResponse create(CreateTicketRequest request) {
        // A primeira transação termina antes da chamada externa ao modelo.
        Ticket ticket = repository.saveAndFlush(new Ticket(request.title(), request.description()));
        try {
            ticket.applySuggestion(triageClient.suggest(ticket.getTitle(), ticket.getDescription()));
        } catch (TriageUnavailableException exception) {
            log.warn("Triagem indisponível para o chamado {}; mantido como PENDING: {}",
                    ticket.getId(), exception.getMessage());
            return TicketResponse.from(ticket);
        }
        return TicketResponse.from(repository.saveAndFlush(ticket));
    }

    public TicketResponse findById(UUID id) {
        return repository.findById(id).map(TicketResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chamado não encontrado"));
    }
}
