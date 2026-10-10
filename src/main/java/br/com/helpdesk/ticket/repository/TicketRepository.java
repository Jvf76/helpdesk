package br.com.helpdesk.ticket.repository;

import br.com.helpdesk.ticket.model.Ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
}
