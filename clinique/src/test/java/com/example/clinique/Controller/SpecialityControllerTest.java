package com.example.clinique.Controller;

import com.example.clinique.entities.Speciality;
import com.example.clinique.repository.SpecialityRepository;
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

@WebMvcTest(SpecialityController.class)
class SpecialityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SpecialityRepository specialityRepository;

    @Test
    void shouldReturnAllSpecialities() throws Exception {
        Speciality speciality = new Speciality();
        speciality.setId(1L);
        speciality.setTitle("Cardiologie");

        when(specialityRepository.findAll()).thenReturn(List.of(speciality));

        mockMvc.perform(get("/api/specialities"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].title").value("Cardiologie"));
    }

    @Test
    void shouldReturnSpecialityById() throws Exception {
        Speciality speciality = new Speciality();
        speciality.setId(1L);
        speciality.setTitle("Cardiologie");

        when(specialityRepository.findById(1L)).thenReturn(Optional.of(speciality));

        mockMvc.perform(get("/api/specialities/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.title").value("Cardiologie"));
    }

    @Test
    void shouldCreateSpeciality() throws Exception {
        Speciality speciality = new Speciality();
        speciality.setTitle("Dermatologie");

        when(specialityRepository.save(any(Speciality.class))).thenReturn(speciality);

        mockMvc.perform(post("/api/specialities")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(speciality)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.title").value("Dermatologie"));
    }

    @Test
    void shouldUpdateSpeciality() throws Exception {
        Speciality existing = new Speciality();
        existing.setId(1L);
        existing.setTitle("Old");

        Speciality updated = new Speciality();
        updated.setTitle("New");

        when(specialityRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(specialityRepository.save(any(Speciality.class))).thenReturn(updated);

        mockMvc.perform(put("/api/specialities/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updated)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.title").value("New"));
    }

    @Test
    void shouldDeleteSpeciality() throws Exception {
        doNothing().when(specialityRepository).deleteById(1L);

        mockMvc.perform(delete("/api/specialities/1"))
               .andExpect(status().isOk());

        verify(specialityRepository, times(1)).deleteById(1L);
    }
}
