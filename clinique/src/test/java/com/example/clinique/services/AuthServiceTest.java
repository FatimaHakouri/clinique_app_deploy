package com.example.clinique.services;

import com.example.clinique.dto.LoginRequest;
import com.example.clinique.dto.LoginResponse;
import com.example.clinique.entities.User;
import com.example.clinique.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldFailWhenEmailNotFound() {
        LoginRequest req = new LoginRequest("test@test.com", "1234");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.empty());

        LoginResponse response = authService.authenticate(req);

        assertFalse(response.isSuccess());
        assertEquals("Email non trouvé", response.getMessage());
    }

    @Test
    void shouldFailWhenPasswordIncorrect() {
        User user = new User();
        user.setMot_de_passe("correct");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest("test@test.com", "wrong");

        LoginResponse response = authService.authenticate(req);

        assertFalse(response.isSuccess());
        assertEquals("Mot de passe incorrect", response.getMessage());
    }

    @Test
    void shouldAuthenticateSuccessfully() {
        User user = new User();
        user.setId(1);
        user.setRole(User.Role.admin);
        user.setMot_de_passe("1234");

        when(userRepository.findByEmail("admin@test.com"))
                .thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest("admin@test.com", "1234");

        LoginResponse response = authService.authenticate(req);

        assertTrue(response.isSuccess());
        assertNotNull(response.getToken());
        assertEquals("/admin/dashboard", response.getRedirectUrl());
    }
}
