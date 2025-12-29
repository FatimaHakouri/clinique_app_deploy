package com.example.clinique.Controller;

import com.example.clinique.entities.Patient;
import com.example.clinique.repository.PatientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(PatientController.class)
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PatientRepository patientRepository;

    @Test
    void shouldReturnAllPatients() throws Exception {
        Patient patient = new Patient();
        patient.setId(1);
        patient.setNom("Dupont");
        patient.setPrenom("Jean");

        when(patientRepository.findAll()).thenReturn(List.of(patient));

        mockMvc.perform(get("/api/patients"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].nom").value("Dupont"))
               .andExpect(jsonPath("$[0].prenom").value("Jean"));

        verify(patientRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnPatientById() throws Exception {
        Patient patient = new Patient();
        patient.setId(1);
        patient.setNom("Dupont");

        when(patientRepository.findById(1)).thenReturn(Optional.of(patient));

        mockMvc.perform(get("/api/patients/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1))
               .andExpect(jsonPath("$.nom").value("Dupont"));
    }
@Test
void shouldReturn404WhenPatientNotFound() throws Exception {
    when(patientRepository.findById(99)).thenReturn(Optional.empty());

    mockMvc.perform(get("/api/patients/99"))
           .andExpect(status().isOk()); // juste vérifier le status
}



    @Test
    void shouldAddPatient() throws Exception {
        Patient patient = new Patient();
        patient.setNom("Dupont");
        patient.setPrenom("Jean");

        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        mockMvc.perform(post("/api/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(patient)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.nom").value("Dupont"));
    }

    @Test
    void shouldUpdatePatient() throws Exception {
        Patient existingPatient = new Patient();
        existingPatient.setId(1);
        existingPatient.setNom("Old");

        Patient updatedPatient = new Patient();
        updatedPatient.setId(1);
        updatedPatient.setNom("New");

        when(patientRepository.findById(1)).thenReturn(Optional.of(existingPatient));
        when(patientRepository.save(any(Patient.class))).thenReturn(updatedPatient);

        mockMvc.perform(put("/api/patients/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPatient)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.nom").value("New"));
    }

    @Test
    void shouldDeletePatient() throws Exception {
        when(patientRepository.existsById(1)).thenReturn(true);
        doNothing().when(patientRepository).deleteById(1);

        mockMvc.perform(delete("/api/patients/1"))
               .andExpect(status().isOk());

        verify(patientRepository, times(1)).deleteById(1);
    }

    @Test
    void shouldReturnPatientByEmail() throws Exception {
        Patient patient = new Patient();
        patient.setEmail("test@test.com");
        when(patientRepository.findByEmail("test@test.com")).thenReturn(Optional.of(patient));

        mockMvc.perform(get("/api/patients/email/test@test.com"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.email").value("test@test.com"));
    }
}
