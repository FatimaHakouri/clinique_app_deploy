package com.example.clinique.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.clinique.entities.RendezVous;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    long countByDateAndMedecinId(LocalDate date, Integer medecinId);
        // ✅ Requête NATIVE (sécurisée)
    @Query(value = "SELECT COUNT(*) FROM rendezvous r " +
                   "WHERE r.medecin_id = :medecinId AND r.date = :date", 
           nativeQuery = true)
    long countByDateAndMedecinId(@Param("medecinId") Integer medecinId, @Param("date") LocalDate date);

    // ✅ Requêtes par medecinId (méthode dérivée - OK si champ "medecinId" existe)
    List<RendezVous> findByMedecinId(Integer medecinId);
    List<RendezVous> findByPatientId(Integer patientId);

    // Trouver tous les rendez-vous d'un médecin pour une date donnée
    
    // Alias
    @Query("SELECT r FROM RendezVous r WHERE r.medecin.id = :medecinId AND r.date = :date")
    List<RendezVous> findByMedecinIdAndDate(@Param("medecinId") Integer medecinId, @Param("date") LocalDate date);

    // Dans RendezVousRepository.java
@Query(value = "SELECT * FROM rendezvous r WHERE r.medecin_id = :medecinId AND r.date = :date", nativeQuery = true)
List<RendezVous> findNativeByMedecinIdAndDate(@Param("medecinId") Integer medecinId, @Param("date") LocalDate date);

}