package br.com.helpdesk.triage.exception;

public class TriageUnavailableException extends RuntimeException {
    public TriageUnavailableException(String message) {
        super(message);
    }
}
