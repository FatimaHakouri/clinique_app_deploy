package com.example.clinique.Controller;

import com.example.clinique.dto.MedecinRequest;
import com.example.clinique.entities.Medecin;
import com.example.clinique.entities.User;
import com.example.clinique.repository.MedecinRepository;
import com.example.clinique.services.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MedecinController.class)
class MedecinControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MedecinRepository medecinRepository;

    @MockBean
    private UserService userService;

    @Test
    void shouldReturnAllMedecins() throws Exception {
        Medecin medecin = new Medecin();
        medecin.setId(1);
        User user = new User();
        user.setNom("Jean");
        user.setPrenom("Dupont");
        medecin.setUser(user);
        when(medecinRepository.findAll()).thenReturn(List.of(medecin));

        mockMvc.perform(get("/api/medecins"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].id").value(1))
               .andExpect(jsonPath("$[0].nom").value("Jean"))
               .andExpect(jsonPath("$[0].prenom").value("Dupont"));

        verify(medecinRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnMedecinById() throws Exception {
        Medecin medecin = new Medecin();
        medecin.setId(1);
        User user = new User();
        user.setNom("Jean");
        user.setPrenom("Dupont");
        user.setEmail("jean.dupont@test.com");
        medecin.setUser(user);

        when(medecinRepository.findById(1)).thenReturn(Optional.of(medecin));

        mockMvc.perform(get("/api/medecins/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1))
               .andExpect(jsonPath("$.nom").value("Jean"))
               .andExpect(jsonPath("$.prenom").value("Dupont"))
               .andExpect(jsonPath("$.email").value("jean.dupont@test.com"));
    }

    @Test
    void shouldReturn404WhenMedecinNotFound() throws Exception {
        when(medecinRepository.findById(99)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/medecins/99"))
               .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnMedecinByUserId() throws Exception {
        Medecin medecin = new Medecin();
        medecin.setId(1);
        when(medecinRepository.findByUserId(1)).thenReturn(Optional.of(medecin));

        mockMvc.perform(get("/api/medecins/user/1"))
               .andExpect(status().isOk());
    }

@Test
void shouldCreateMedecin() throws Exception {
    MedecinRequest request = new MedecinRequest();
    request.setUserId(1L);
    request.setNom("Jean");
    request.setPrenom("Dupont");
    request.setEmail("jean.dupont@test.com");
    request.setMot_de_passe("1234");
    request.setImage("image.png");
    request.setExperiences("5 ans");
    request.setLanguages("Français,Anglais");
    request.setSpecialiteId(2L);

    // Mock du service avec cast si nécessaire
    when(userService.createMedecin(any(MedecinRequest.class)))
            .thenReturn((ResponseEntity) ResponseEntity.ok("Médecin créé"));

    mockMvc.perform(post("/api/medecins")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
           .andExpect(status().isOk())
           .andExpect(content().string("Médecin créé"));
}


   @Test
void shouldUpdateMedecin() throws Exception {
    MedecinRequest request = new MedecinRequest();
    request.setNom("Jean");
    request.setPrenom("Dupont");
    request.setEmail("jean.dupont@test.com");
    request.setMot_de_passe("1234");
    request.setImage("image.png");
    request.setExperiences("5 ans");
    request.setLanguages("Français,Anglais");
    request.setSpecialiteId(2L);

    // Mock du service avec cast si nécessaire
    when(userService.updateMedecin(eq(1), any(MedecinRequest.class)))
            .thenReturn((ResponseEntity) ResponseEntity.ok("Médecin mis à jour"));

    mockMvc.perform(put("/api/medecins/1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
           .andExpect(status().isOk())
           .andExpect(content().string("Médecin mis à jour"));
}


    @Test
    void shouldDeleteMedecin() throws Exception {
        Medecin medecin = new Medecin();
        medecin.setId(1);
        when(medecinRepository.findById(1)).thenReturn(Optional.of(medecin));

        mockMvc.perform(delete("/api/medecins/1"))
               .andExpect(status().isOk())
               .andExpect(content().string("Médecin supprimé avec succès"));

        verify(medecinRepository, times(1)).delete(medecin);
    }

    @Test
    void shouldReturn404WhenDeletingNonExistingMedecin() throws Exception {
        when(medecinRepository.findById(99)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/medecins/99"))
               .andExpect(status().isNotFound());
    }
}
