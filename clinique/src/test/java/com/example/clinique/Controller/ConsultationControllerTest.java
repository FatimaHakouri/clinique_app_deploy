package com.example.clinique.Controller;

import com.example.clinique.entities.Consultation;
import com.example.clinique.entities.Patient;
import com.example.clinique.dto.ConsultationDto;
import com.example.clinique.repository.ConsultationRepository;
import com.example.clinique.repository.PatientRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ConsultationController.class)
class ConsultationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ConsultationRepository consultationRepository;

    @MockBean
    private PatientRepository patientRepository;

    // ----------------- GET dossier patient -----------------
    @Test
    void shouldReturnDossierPatient() throws Exception {
        Integer patientId = 1;
        Patient patient = new Patient();
        patient.setId(patientId);
        patient.setNom("Dupont");

        ConsultationDto dto = new ConsultationDto(
            1,
            LocalDateTime.now(),
            "Checkup",
            "",
            List.of(),
            10,
            "Dupont",
            "Jean",
            "Cardiologie"
        );

        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(consultationRepository.findConsultationsWithMedecinByPatientId(patientId))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/api/consultations/dossier-patient/{patientId}", patientId))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.patient.nom").value("Dupont"))
               .andExpect(jsonPath("$.consultations[0].motif").value("Checkup"));

        verify(patientRepository, times(1)).findById(patientId);
        verify(consultationRepository, times(1)).findConsultationsWithMedecinByPatientId(patientId);
    }

    @Test
    void shouldReturn404WhenPatientNotFound() throws Exception {
        Integer patientId = 1;
        when(patientRepository.findById(patientId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/consultations/dossier-patient/{patientId}", patientId))
               .andExpect(status().isNotFound());

        verify(patientRepository, times(1)).findById(patientId);
        verify(consultationRepository, never()).findConsultationsWithMedecinByPatientId(any());
    }

    // ----------------- POST nouvelle consultation -----------------
    @Test
    void shouldAddNewConsultationWithoutFiles() throws Exception {
        Integer patientId = 1;
        Integer medecinId = 2;

        Consultation consultation = new Consultation();
        consultation.setPatientId(patientId);
        consultation.setMedecinId(medecinId);
        consultation.setMotif("Checkup");

        when(consultationRepository.save(any(Consultation.class))).thenReturn(consultation);

        mockMvc.perform(multipart("/api/consultations/nouvelle")
                .param("patientId", patientId.toString())
                .param("medecinId", medecinId.toString())
                .param("motif", "Checkup"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.motif").value("Checkup"));

        verify(consultationRepository, times(1)).save(any(Consultation.class));
    }

    @Test
    void shouldAddNewConsultationWithFiles() throws Exception {
        Integer patientId = 1;
        Integer medecinId = 2;

        MockMultipartFile file = new MockMultipartFile(
                "fichiers",
                "test.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "Hello World".getBytes()
        );

        Consultation consultation = new Consultation();
        consultation.setPatientId(patientId);
        consultation.setMedecinId(medecinId);
        consultation.setMotif("Checkup");
        consultation.setFichier(List.of("test.txt"));

        when(consultationRepository.save(any(Consultation.class))).thenReturn(consultation);

        mockMvc.perform(multipart("/api/consultations/nouvelle")
                .file(file)
                .param("patientId", patientId.toString())
                .param("medecinId", medecinId.toString())
                .param("motif", "Checkup"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.motif").value("Checkup"));

        verify(consultationRepository, times(1)).save(any(Consultation.class));
    }
}