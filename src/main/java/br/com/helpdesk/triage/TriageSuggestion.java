package br.com.helpdesk.triage;

import java.util.Objects;

public record TriageSuggestion(Priority priority, Category category) {
    public TriageSuggestion {
        Objects.requireNonNull(priority, "priority");
        Objects.requireNonNull(category, "category");
    }
}
