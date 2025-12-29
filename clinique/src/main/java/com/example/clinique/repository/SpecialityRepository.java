package com.example.clinique.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.clinique.entities.Speciality;

// SpecialityRepository.java
public interface SpecialityRepository extends JpaRepository<Speciality, Long> {}
