package com.example.clinique.Controller;

import com.example.clinique.dto.CreateRendezVousDTO;
import com.example.clinique.dto.RendezVousRequest;
import com.example.clinique.entities.RendezVous;
import com.example.clinique.services.RendezVousService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RendezVousController.class)
class RendezVousControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RendezVousService rendezVousService;

    @Test
    void shouldReturnAllRendezVous() throws Exception {
        RendezVous rv = new RendezVous();
        rv.setId(1L);

        when(rendezVousService.getAllRendezVous()).thenReturn(List.of(rv));

        mockMvc.perform(get("/rendezvous"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void shouldReturnRendezVousById() throws Exception {
        RendezVous rv = new RendezVous();
        rv.setId(1L);

        when(rendezVousService.getRendezVousById(1L)).thenReturn(rv);

        mockMvc.perform(get("/rendezvous/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void shouldReturn404WhenRendezVousNotFound() throws Exception {
        when(rendezVousService.getRendezVousById(99L)).thenThrow(new RuntimeException("Non trouvé"));

        mockMvc.perform(get("/rendezvous/99"))
               .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateRendezVous() throws Exception {
        CreateRendezVousDTO req = new CreateRendezVousDTO();
        RendezVous rv = new RendezVous();
        rv.setId(1L);

        when(rendezVousService.createRendezVousWithPatientId(any(CreateRendezVousDTO.class)))
                .thenReturn(rv);

        mockMvc.perform(post("/rendezvous")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void shouldUpdateRendezVous() throws Exception {
        CreateRendezVousDTO req = new CreateRendezVousDTO();
        RendezVous rv = new RendezVous();
        rv.setId(1L);

        when(rendezVousService.updateRendezVous(eq(1L), any(CreateRendezVousDTO.class)))
                .thenReturn(rv);

        mockMvc.perform(put("/rendezvous/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void shouldDeleteRendezVous() throws Exception {
        doNothing().when(rendezVousService).deleteRendezVous(1L);

        mockMvc.perform(delete("/rendezvous/1"))
               .andExpect(status().isOk());

        verify(rendezVousService, times(1)).deleteRendezVous(1L);
    }
}
