package br.com.helpdesk.ticket;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.time.Instant;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TicketControllerTest {
    TicketService service;
    MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(TicketService.class);
        mvc = MockMvcBuilders.standaloneSetup(new TicketController(service))
                .setControllerAdvice(new TicketExceptionHandler()).build();
    }

    @Test
    void returnsCreatedAndLocation() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.create(any())).thenReturn(new TicketResponse(id, "Título", "Descrição",
                null, null, TriageStatus.PENDING, Instant.now()));
        mvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Título\",\"description\":\"Descrição\"}"))
                .andExpect(status().isCreated()).andExpect(header().string("Location", "/api/tickets/" + id))
                .andExpect(jsonPath("$.triageStatus").value("PENDING"));
    }

    @Test
    void rejectsBlankTitleBeforeCallingService() throws Exception {
        mvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"  \",\"description\":\"Descrição\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void rejectsOversizedDescription() throws Exception {
        mvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Título\",\"description\":\"" + "x".repeat(10001) + "\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void rejectsMalformedId() throws Exception {
        mvc.perform(get("/api/tickets/not-a-uuid")).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}
