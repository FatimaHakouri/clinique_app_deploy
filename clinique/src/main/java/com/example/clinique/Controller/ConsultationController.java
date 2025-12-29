package com.example.clinique.Controller;

import com.example.clinique.dto.ConsultationDto; // ← Important
import com.example.clinique.entities.Consultation;
import com.example.clinique.entities.Patient;
import com.example.clinique.repository.ConsultationRepository;
import com.example.clinique.repository.PatientRepository; // ← Vous l'utilisez mais ne l'importiez pas
import java.util.UUID; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map; // ← Pour Map
import java.util.Optional; // ← Pour Optional

// Pas besoin de @Query ici — c'est pour les repositories

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    @Autowired
    private ConsultationRepository consultationRepository;
    @Autowired
    private PatientRepository patientRepository; // ← Vous l'utilisez mais ne l'injectiez pas

    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;



@GetMapping("/dossier-patient/{patientId}")
public ResponseEntity<Map<String, Object>> getDossierPatient(@PathVariable Integer patientId) {
    try {
        // 1. Récupérer le patient
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Patient patient = patientOpt.get();

        // 2. Récupérer les consultations via le repository (la requête est DANS le repository)
        List<ConsultationDto> consultations = consultationRepository.findConsultationsWithMedecinByPatientId(patientId);

        // 3. Construire la réponse
        Map<String, Object> response = new HashMap<>();
        response.put("patient", patient);
        response.put("consultations", consultations);

        return ResponseEntity.ok(response);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).build();
    }
}
    @PostMapping("/nouvelle")
    public ResponseEntity<?> ajouterConsultation(
            @RequestParam Integer patientId,
            @RequestParam Integer medecinId,
            @RequestParam String motif,
            @RequestParam(required = false) String traitement,
            @RequestParam(value = "fichiers", required = false) List<MultipartFile> fichiers
    ) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Consultation consultation = new Consultation();
            consultation.setPatientId(patientId);
            consultation.setMedecinId(medecinId);
            consultation.setMotif(motif);
            consultation.setTraitement(traitement != null ? traitement : "");
            consultation.setDateConsultation(LocalDateTime.now());

            List<String> nomsFichiers = new ArrayList<>();

            if (fichiers != null && !fichiers.isEmpty()) {
                for (MultipartFile fichier : fichiers) {
                    if (!fichier.isEmpty()) {
                        String originalFilename = StringUtils.cleanPath(fichier.getOriginalFilename());
                        String extension = "";
                        if (originalFilename.contains(".")) {
                            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                        }
                        String nomUnique = UUID.randomUUID().toString() + extension;
                        Path filePath = uploadPath.resolve(nomUnique);
                        fichier.transferTo(filePath);
                        nomsFichiers.add(nomUnique);
                    }
                }
            }

            consultation.setFichier(nomsFichiers.isEmpty() ? List.of() : nomsFichiers);
            Consultation saved = consultationRepository.save(consultation);
            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'upload des fichiers : " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur serveur : " + e.getMessage());
        }
    }
}