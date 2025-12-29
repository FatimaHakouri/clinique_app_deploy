package com.example.clinique.Controller;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.clinique.entities.Patient;
import com.example.clinique.repository.PatientRepository;

@CrossOrigin(origins = "http://localhost:3000") // autorise React
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    // 🔹 Liste de tous les patients
    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // 🔹 Ajouter un patient
    @PostMapping
    public Patient addPatient(@RequestBody Patient patient) {
        return patientRepository.save(patient);
    }

    // 🔹 Récupérer un patient par ID
    @GetMapping("/{id}")
    public Optional<Patient> getPatientById(@PathVariable Integer id) {
        return patientRepository.findById(id);
    }

    // Dans PatientController.java - modifiez la méthode updatePatient
@PutMapping("/{id}")
public Patient updatePatient(@PathVariable Integer id, @RequestBody Patient updatedPatient) {
    return patientRepository.findById(id)
            .map(patient -> {
                patient.setNom(updatedPatient.getNom());
                patient.setPrenom(updatedPatient.getPrenom());
                patient.setEmail(updatedPatient.getEmail());
                patient.setTel(updatedPatient.getTel());
                patient.setAdresse(updatedPatient.getAdresse());
                patient.setCin(updatedPatient.getCin()); // ← Ajoutez cette ligne
                patient.setMotDePasse(updatedPatient.getMotDePasse()); // ← Ajoutez cette ligne
                return patientRepository.save(patient);
            })
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
}

    // 🔹 Supprimer un patient
    @DeleteMapping("/{id}")
    public void deletePatient(@PathVariable Integer id) {
        patientRepository.deleteById(id);
    }

    // Dans PatientController

    @GetMapping("/search")
    public List<Patient> searchPatients(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return patientRepository.findAll();
        }
        return patientRepository.searchByKeyword(q.trim());
    }


    @GetMapping("/email/{email}")
    public ResponseEntity<Patient> getPatientByEmail(@PathVariable String email) {
        return patientRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

}

