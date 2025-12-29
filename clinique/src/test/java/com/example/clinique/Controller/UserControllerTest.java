package com.example.clinique.Controller;

import com.example.clinique.dto.MedecinRequest;
import com.example.clinique.entities.User;
import com.example.clinique.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    void shouldReturnAllUsers() throws Exception {
        User user = new User();
        user.setId(1);
        user.setNom("Jean");
        user.setPrenom("Dupont");

        when(userService.getAllUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/users"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].nom").value("Jean"))
               .andExpect(jsonPath("$[0].prenom").value("Dupont"));
    }

    @Test
    void shouldReturnUserById() throws Exception {
        User user = new User();
        user.setId(1);
        user.setNom("Jean");

        when(userService.getUserById(1)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/users/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.nom").value("Jean"));
    }

    @Test
    void shouldReturn404WhenUserNotFound() throws Exception {
        when(userService.getUserById(99)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/users/99"))
               .andExpect(status().isNotFound());
    }

    @Test
    void shouldCreateUser() throws Exception {
        User user = new User();
        user.setNom("Alice");

        when(userService.saveUser(any(User.class))).thenReturn(user);

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.nom").value("Alice"));
    }

    @Test
    void shouldUpdateUser() throws Exception {
        User existing = new User();
        existing.setId(1);
        existing.setNom("Old");

        User update = new User();
        update.setNom("New");

        when(userService.getUserById(1)).thenReturn(Optional.of(existing));
        when(userService.saveUser(any(User.class))).thenReturn(update);

        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(update)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.nom").value("New"));
    }

    @Test
    void shouldDeleteUser() throws Exception {
        when(userService.deleteUser(1)).thenReturn(ResponseEntity.ok().build());

        mockMvc.perform(delete("/api/users/1"))
               .andExpect(status().isOk());

        verify(userService, times(1)).deleteUser(1);
    }

 @Test
void shouldCreateMedecin() throws Exception {
    MedecinRequest request = new MedecinRequest();

    // Utiliser le cast générique pour Mockito
    Mockito.<ResponseEntity<?>>when(userService.createMedecin(any(MedecinRequest.class)))
           .thenReturn(ResponseEntity.ok("Médecin créé"));

    mockMvc.perform(post("/api/users/create-medecin")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
           .andExpect(status().isOk())
           .andExpect(content().string("Médecin créé"));
}

@Test
void shouldUpdateMedecin() throws Exception {
    MedecinRequest request = new MedecinRequest();

    // Utiliser le cast générique pour Mockito
    Mockito.<ResponseEntity<?>>when(userService.updateMedecin(eq(1), any(MedecinRequest.class)))
           .thenReturn(ResponseEntity.ok("Médecin mis à jour"));

    mockMvc.perform(put("/api/users/update-medecin/1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
           .andExpect(status().isOk())
           .andExpect(content().string("Médecin mis à jour"));
}

}
