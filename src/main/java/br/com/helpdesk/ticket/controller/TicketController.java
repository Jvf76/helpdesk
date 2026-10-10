package br.com.helpdesk.ticket.controller;

import br.com.helpdesk.ticket.dto.CreateTicketRequest;
import br.com.helpdesk.ticket.dto.TicketResponse;
import br.com.helpdesk.ticket.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService service;

    @PostMapping
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody CreateTicketRequest request) {
        TicketResponse response = service.create(request);
        return ResponseEntity.created(URI.create("/api/tickets/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public TicketResponse findById(@PathVariable UUID id) {
        return service.findById(id);
    }
}
