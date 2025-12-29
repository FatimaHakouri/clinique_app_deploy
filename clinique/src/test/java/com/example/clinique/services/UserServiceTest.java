package com.example.clinique.services;

import com.example.clinique.dto.MedecinRequest;
import com.example.clinique.entities.Medecin;
import com.example.clinique.entities.Speciality;
import com.example.clinique.entities.User;
import com.example.clinique.repository.MedecinRepository;
import com.example.clinique.repository.SpecialityRepository;
import com.example.clinique.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MedecinRepository medecinRepository;

    @Mock
    private SpecialityRepository specialityRepository;

    @InjectMocks
    private UserService userService;

    private User user;
    private Medecin medecin;

    @BeforeEach
    void setup() {
        user = new User();
        user.setId(1);
        user.setNom("Test");
        user.setPrenom("User");
        user.setEmail("test@test.com");
        user.setRole(User.Role.medecin);

        medecin = new Medecin();
        medecin.setId(1);
        medecin.setUser(user);
    }

    // ------------------------------------
    // ✅ getAllUsers
    // ------------------------------------
    @Test
    void shouldReturnAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        List<User> result = userService.getAllUsers();

        assertEquals(1, result.size());
        verify(userRepository).findAll();
    }

    // ------------------------------------
    // ✅ getUserById
    // ------------------------------------
    @Test
    void shouldReturnUserById() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        Optional<User> result = userService.getUserById(1);

        assertTrue(result.isPresent());
        assertEquals("test@test.com", result.get().getEmail());
    }

    // ------------------------------------
    // ✅ saveUser
    // ------------------------------------
    @Test
    void shouldSaveUser() {
        when(userRepository.save(user)).thenReturn(user);

        User saved = userService.saveUser(user);

        assertNotNull(saved);
        verify(userRepository).save(user);
    }

    // ------------------------------------
    // ✅ createMedecin
    // ------------------------------------
    @Test
    void shouldCreateMedecinSuccessfully() {
        MedecinRequest request = new MedecinRequest();
        request.setNom("Ali");
        request.setPrenom("Ahmed");
        request.setEmail("ali@test.com");
        request.setMot_de_passe("1234");
        request.setSpecialiteId(1L); // ✅ Long

        Speciality speciality = new Speciality();

        when(userRepository.save(any(User.class))).thenReturn(user);
        when(specialityRepository.findById(anyLong())).thenReturn(Optional.of(speciality));
        when(medecinRepository.save(any(Medecin.class))).thenReturn(medecin);

        ResponseEntity<?> response = userService.createMedecin(request);

        assertEquals(200, response.getStatusCodeValue());
        verify(userRepository).save(any(User.class));
        verify(medecinRepository).save(any(Medecin.class));
    }

    // ------------------------------------
    // ✅ updateMedecin
    // ------------------------------------
   @Test
void shouldUpdateMedecinSuccessfully() {
    // Création de la requête avec un specialiteId non null
    MedecinRequest request = new MedecinRequest();
    request.setNom("Updated");
    request.setPrenom("Name");
    request.setEmail("updated@test.com");
    request.setSpecialiteId(1L); // ✅ Important pour éviter null

    // Création d'une spécialité pour le stub
    Speciality speciality = new Speciality();
    speciality.setId(1L);

    // Stub des repositories
    when(medecinRepository.findById(1)).thenReturn(Optional.of(medecin));
    when(specialityRepository.findById(1L)).thenReturn(Optional.of(speciality));
    when(userRepository.save(any(User.class))).thenReturn(user);
    when(medecinRepository.save(any(Medecin.class))).thenReturn(medecin);

    // Appel de la méthode
    ResponseEntity<?> response = userService.updateMedecin(1, request);

    // Vérifications
    assertEquals(200, response.getStatusCodeValue());
    verify(userRepository).save(any(User.class));
    verify(medecinRepository).save(any(Medecin.class));
}

    // ------------------------------------
    // ❌ updateMedecin NOT FOUND
    // ------------------------------------
    @Test
    void shouldReturn404WhenMedecinNotFound() {
        when(medecinRepository.findById(99)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userService.updateMedecin(99, new MedecinRequest());

        assertEquals(404, response.getStatusCodeValue());
    }

    // ------------------------------------
    // ✅ deleteUser
    // ------------------------------------
    @Test
    void shouldDeleteUserSuccessfully() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(medecinRepository.findByUserId(1)).thenReturn(Optional.of(medecin));

        ResponseEntity<?> response = userService.deleteUser(1);

        assertEquals(200, response.getStatusCodeValue());
        verify(medecinRepository).delete(medecin);
        verify(userRepository).delete(user);
    }

    // ------------------------------------
    // ❌ deleteUser NOT FOUND
    // ------------------------------------
    @Test
    void shouldReturn404WhenDeletingUnknownUser() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userService.deleteUser(99);

        assertEquals(404, response.getStatusCodeValue());
    }
}
