package br.com.helpdesk.ticket;

import br.com.helpdesk.triage.Category;
import br.com.helpdesk.triage.Priority;

import java.time.Instant;
import java.util.UUID;

public record TicketResponse(UUID id, String title, String description,
                             Priority suggestedPriority, Category suggestedCategory,
                             TriageStatus triageStatus, Instant createdAt) {
    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(ticket.getId(), ticket.getTitle(), ticket.getDescription(),
            ticket.getSuggestedPriority(), ticket.getSuggestedCategory(),
            ticket.getTriageStatus(), ticket.getCreatedAt());
    }
}
