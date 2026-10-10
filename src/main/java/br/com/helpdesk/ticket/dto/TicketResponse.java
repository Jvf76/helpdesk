package br.com.helpdesk.ticket.dto;

import br.com.helpdesk.ticket.model.Ticket;
import br.com.helpdesk.ticket.model.TriageStatus;
import br.com.helpdesk.triage.model.Category;
import br.com.helpdesk.triage.model.Priority;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TicketResponse(UUID id, String title, String description,
                             Priority suggestedPriority, Category suggestedCategory,
                             BigDecimal triageConfidence, String triageJustification,
                             TriageStatus triageStatus, Instant createdAt) {
    public static TicketResponse from(Ticket ticket) {
        return new TicketResponse(ticket.getId(), ticket.getTitle(), ticket.getDescription(),
                ticket.getSuggestedPriority(), ticket.getSuggestedCategory(),
                ticket.getTriageConfidence(), ticket.getTriageJustification(),
                ticket.getTriageStatus(), ticket.getCreatedAt());
    }
}