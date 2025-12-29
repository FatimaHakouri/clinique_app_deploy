// src/main/java/com/example/clinique/repository/ConsultationRepository.java
package com.example.clinique.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.clinique.entities.Consultation;
import com.example.clinique.entities.Patient;
import com.example.clinique.dto.ConsultationDto;

public interface ConsultationRepository extends JpaRepository<Consultation, Integer> {

    // ✅ Requêtes NATIVES
    @Query(value = "SELECT COUNT(*) FROM consultation c WHERE c.medecin_id = :medecinId", 
           nativeQuery = true)
    long countByMedecinId(@Param("medecinId") Integer medecinId);

    @Query(value = "SELECT COUNT(*) FROM consultation c " +
                   "WHERE c.medecin_id = :medecinId AND c.traitement IS NULL", 
           nativeQuery = true)
    long countByMedecinIdAndTraitementIsNull(@Param("medecinId") Integer medecinId);

    @Query(value = "SELECT COUNT(*) FROM consultation c " +
                   "WHERE c.medecin_id = :medecinId AND DATE(c.date_consultation) = :date", 
           nativeQuery = true)
    long countByMedecinIdAndDate(@Param("medecinId") Integer medecinId, @Param("date") LocalDate date);

    // ✅ Requête par patientId (méthode dérivée)
    List<Consultation> findByPatientId(Integer patientId);

    // ✅ Requête DTO personnalisée (gardez-la, elle est correcte)
    @Query("""
    SELECT new com.example.clinique.dto.ConsultationDto(
        c.id, c.dateConsultation, c.motif, c.traitement, c.fichier,
        m.id, u.nom, u.prenom, s.title
    )
    FROM Consultation c
    JOIN Medecin m ON c.medecinId = m.id
    JOIN User u ON m.user.id = u.id
    JOIN Speciality s ON m.specialite.id = s.id
    WHERE c.patientId = :patientId
    ORDER BY c.dateConsultation DESC
    """)
    List<ConsultationDto> findConsultationsWithMedecinByPatientId(@Param("patientId") Integer patientId);

    // ✅ Ajoutez cette méthode dans ConsultationRepository.java
    @Query(value = "SELECT DISTINCT p.* FROM patient p " +
                "JOIN consultation c ON p.id = c.patient_id " +
                "WHERE c.medecin_id = :medecinId", 
        nativeQuery = true)
    List<Patient> findPatientsByMedecinIdNative(@Param("medecinId") Integer medecinId);

    // ❌ SUPPRIMER TOUT LE RESTE :
    // - findPatientsByMedecinId
    // - findMedecinIdByUserId
    // - TOUTES les méthodes avec "countByMedecinUserId"
}