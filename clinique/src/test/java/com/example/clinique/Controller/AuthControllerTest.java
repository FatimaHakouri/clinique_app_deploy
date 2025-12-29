package com.example.clinique.Controller;

import com.example.clinique.dto.LoginRequest;
import com.example.clinique.dto.LoginResponse;
import com.example.clinique.entities.User;
import com.example.clinique.services.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    void shouldAuthenticateSuccessfully() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("1234");

        LoginResponse response = new LoginResponse();
        response.setSuccess(true);
        response.setMessage("Login réussi");

        when(authService.authenticate(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.success").value(true))
               .andExpect(jsonPath("$.message").value("Login réussi"));

        verify(authService, times(1)).authenticate(any(LoginRequest.class));
    }

    @Test
    void shouldFailWhenPasswordIncorrect() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("wrongpassword");

        LoginResponse response = new LoginResponse();
        response.setSuccess(false);
        response.setMessage("Mot de passe incorrect");

        when(authService.authenticate(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.success").value(false))
               .andExpect(jsonPath("$.message").value("Mot de passe incorrect"));

        verify(authService, times(1)).authenticate(any(LoginRequest.class));
    }

    @Test
    void shouldReturnEmailExistsTrue() throws Exception {
        String email = "test@test.com";

        // Crée un vrai utilisateur pour simuler la présence de l'email
        User user = new User();
        user.setEmail(email);
        user.setMot_de_passe("1234");
        user.setRole(User.Role.patient);

        when(authService.findByEmail(email)).thenReturn(user);

        mockMvc.perform(get("/api/auth/check-email/{email}", email))
               .andExpect(status().isOk())
               .andExpect(content().string("true"));

        verify(authService, times(1)).findByEmail(email);
    }

    @Test
    void shouldReturnEmailExistsFalse() throws Exception {
        String email = "notfound@test.com";

        when(authService.findByEmail(email)).thenReturn(null);

        mockMvc.perform(get("/api/auth/check-email/{email}", email))
               .andExpect(status().isOk())
               .andExpect(content().string("false"));

        verify(authService, times(1)).findByEmail(email);
    }
}
