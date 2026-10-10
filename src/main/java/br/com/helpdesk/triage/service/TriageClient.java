package br.com.helpdesk.triage.service;

import br.com.helpdesk.triage.model.TriageSuggestion;

public interface TriageClient {
    TriageSuggestion suggest(String title, String description);
}
