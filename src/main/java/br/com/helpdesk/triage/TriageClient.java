package br.com.helpdesk.triage;

public interface TriageClient {
    TriageSuggestion suggest(String title, String description);
}
