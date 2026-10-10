package br.com.helpdesk.triage.model;

import java.util.Objects;

public record TriageSuggestion(Priority priority, Category category,
                               double confidence, String justification) {
    public TriageSuggestion {
        Objects.requireNonNull(priority, "priority");
        Objects.requireNonNull(category, "category");
        Objects.requireNonNull(justification, "justification");
        justification = justification.strip();
        if (!Double.isFinite(confidence) || confidence < 0.0 || confidence > 1.0) {
            throw new IllegalArgumentException("confidence must be between 0.0 and 1.0");
        }
        if (justification.isBlank() || justification.length() > 500) {
            throw new IllegalArgumentException("justification must contain between 1 and 500 characters");
        }
    }
}