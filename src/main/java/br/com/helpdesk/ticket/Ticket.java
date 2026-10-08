package br.com.helpdesk.ticket;

import br.com.helpdesk.triage.Category;
import br.com.helpdesk.triage.Priority;
import br.com.helpdesk.triage.TriageSuggestion;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Ticket {
    @Id
    private UUID id;
    @Setter
    @Column(nullable = false, length = 200)
    private String title;
    @Setter
    @Column(nullable = false, length = 10000)
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(name = "suggested_priority", length = 20)
    private Priority suggestedPriority;
    @Enumerated(EnumType.STRING)
    @Column(name = "suggested_category", length = 20)
    private Category suggestedCategory;
    @Enumerated(EnumType.STRING)
    @Column(name = "triage_status", nullable = false, length = 20)
    private TriageStatus triageStatus;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Ticket(String title, String description) {
        this.id = UUID.randomUUID();
        this.title = title.strip();
        this.description = description.strip();
        this.triageStatus = TriageStatus.PENDING;
        this.createdAt = Instant.now();
    }

    public void applySuggestion(TriageSuggestion suggestion) {
        this.suggestedPriority = suggestion.priority();
        this.suggestedCategory = suggestion.category();
        this.triageStatus = TriageStatus.COMPLETED;
    }
}
