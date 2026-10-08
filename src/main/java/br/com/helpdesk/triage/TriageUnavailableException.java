package br.com.helpdesk.triage;

public class TriageUnavailableException extends RuntimeException {
    public TriageUnavailableException(String message) {
        super(message);
    }
}
