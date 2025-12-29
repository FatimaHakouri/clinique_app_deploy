package com.example.clinique.services;

import com.example.clinique.dto.CreateRendezVousDTO;
import com.example.clinique.entities.*;
import com.example.clinique.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RendezVousServiceTest {

    @Mock
    private RendezVousRepository rendezVousRepo;

    @Mock
    private MedecinRepository medecinRepo;

    @Mock
    private PatientRepository patientRepo;

    @InjectMocks
    private RendezVousService rendezVousService;

    @Test
    void shouldReturnRendezVousById() {
        RendezVous rdv = new RendezVous();
        rdv.setId(1L);

        when(rendezVousRepo.findById(1L))
                .thenReturn(Optional.of(rdv));

        RendezVous result = rendezVousService.getRendezVousById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void shouldCreateRendezVousWithPatientId() {
        CreateRendezVousDTO dto = new CreateRendezVousDTO();
        dto.setDoctorId(1);
        dto.setPatientId(2);
        dto.setDate("2025-01-01");
        dto.setSlot("09:00");

        when(medecinRepo.findById(1))
                .thenReturn(Optional.of(new Medecin()));

        when(patientRepo.findById(2))
                .thenReturn(Optional.of(new Patient()));

        when(rendezVousRepo.save(any(RendezVous.class)))
                .thenReturn(new RendezVous());

        RendezVous rdv = rendezVousService.createRendezVousWithPatientId(dto);

        assertNotNull(rdv);
        verify(rendezVousRepo).save(any(RendezVous.class));
    }

    @Test
    void shouldDeleteRendezVous() {
        when(rendezVousRepo.existsById(1L)).thenReturn(true);

        rendezVousService.deleteRendezVous(1L);

        verify(rendezVousRepo).deleteById(1L);
    }

    @Test
    void shouldReturnOccupiedSlots() {
        RendezVous rdv = new RendezVous();
        rdv.setSlot("10:00");

        when(rendezVousRepo.findByMedecinIdAndDate(1, LocalDate.now()))
                .thenReturn(List.of(rdv));

        List<String> slots =
                rendezVousService.getOccupiedSlots(1, LocalDate.now());

        assertEquals(1, slots.size());
        assertEquals("10:00", slots.get(0));
    }
}
