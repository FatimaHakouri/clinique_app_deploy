package com.example.clinique.services;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.clinique.dto.CreateRendezVousDTO;
import com.example.clinique.dto.RendezVousRequest;
import com.example.clinique.entities.Medecin;
import com.example.clinique.entities.Patient;
import com.example.clinique.entities.RendezVous;
import com.example.clinique.repository.MedecinRepository;
import com.example.clinique.repository.PatientRepository;
import com.example.clinique.repository.RendezVousRepository;

@Service
public class RendezVousService {

    @Autowired
    private RendezVousRepository rendezVousRepo;

    @Autowired
    private MedecinRepository medecinRepo;

    @Autowired
    private PatientRepository patientRepo;

    // MÉTHODE CORRIGÉE - Utilise Long
    public RendezVous getRendezVousById(Long id) {
        System.out.println("🔍 Service - Recherche du rendez-vous avec ID: " + id);
        
        RendezVous rendezVous = rendezVousRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé avec ID: " + id));
        
        // Forcez le chargement des relations
        if (rendezVous.getPatient() != null) {
            System.out.println("📋 Patient: " + rendezVous.getPatient().getNom() + " " + rendezVous.getPatient().getPrenom());
        }
        
        if (rendezVous.getMedecin() != null) {
            System.out.println("👨‍⚕️ Médecin ID: " + rendezVous.getMedecin().getId());
        }
        
        System.out.println("✅ Rendez-vous trouvé - Date: " + rendezVous.getDate() + ", Slot: " + rendezVous.getSlot());
        
        return rendezVous;
    }
    // Dans RendezVousService.java
    public List<RendezVous> getRendezVousByMedecinId(Integer medecinId) {
        Optional<Medecin> medecin = medecinRepo.findById(medecinId);
        if (medecin.isEmpty()) {
            return List.of();
        }
        return rendezVousRepo.findByMedecinId(medecinId); // ✅ Maintenant ça marche !
    }

    public List<RendezVous> getRendezVousByUserId(Integer userId) {
        System.out.println("🔍 Recherche des RDV pour user ID: " + userId);
    
        var medecinOpt = medecinRepo.findByUserId(userId);
        if (medecinOpt.isEmpty()) {
            return List.of();
        }
        Integer medecinId = medecinOpt.get().getId();
        
        return rendezVousRepo.findByMedecinId(medecinId);
}

    // NOUVELLE méthode pour mettre à jour un rendez-vous
    public RendezVous updateRendezVous(Long id, CreateRendezVousDTO req) {
        System.out.println("🔄 Mise à jour du rendez-vous ID: " + id);
        
        // Récupérer le rendez-vous existant
        RendezVous existingRendezVous = rendezVousRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé avec ID: " + id));

        // Récupérer le médecin
        Medecin medecin = medecinRepo.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Médecin introuvable avec ID: " + req.getDoctorId()));

        // Récupérer le patient
        Patient patient = patientRepo.findById(req.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient introuvable avec ID: " + req.getPatientId()));

        // Parser la date
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate date = LocalDate.parse(req.getDate(), formatter);

        // Mettre à jour le rendez-vous
        existingRendezVous.setPatient(patient);
        existingRendezVous.setMedecin(medecin);
        existingRendezVous.setDate(date);
        existingRendezVous.setSlot(req.getSlot());

        System.out.println("✅ Rendez-vous mis à jour: " + existingRendezVous.getId());
        return rendezVousRepo.save(existingRendezVous);
    }

    // NOUVELLE méthode pour supprimer un rendez-vous
    public void deleteRendezVous(Long id) {
        System.out.println("🗑️ Suppression du rendez-vous ID: " + id);
        
        if (!rendezVousRepo.existsById(id)) {
            throw new RuntimeException("Rendez-vous non trouvé avec ID: " + id);
        }
        
        rendezVousRepo.deleteById(id);
        System.out.println("✅ Rendez-vous supprimé: " + id);
    }

    public RendezVous createRendezVousWithPatientId(CreateRendezVousDTO req) {
        System.out.println("📥 Création RDV avec patientId: " + req);

        if (req.getDoctorId() == null) {
            throw new IllegalArgumentException("L'identifiant du médecin est requis.");
        }
        if (req.getPatientId() == null) {
            throw new IllegalArgumentException("L'identifiant du patient est requis.");
        }
        if (req.getDate() == null || req.getDate().isEmpty()) {
            throw new IllegalArgumentException("La date du rendez-vous est requise.");
        }
        if (req.getSlot() == null || req.getSlot().isEmpty()) {
            throw new IllegalArgumentException("Le créneau horaire est requis.");
        }

        Medecin medecin = medecinRepo.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Médecin introuvable avec ID: " + req.getDoctorId()));

        Patient patient = patientRepo.findById(req.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient introuvable avec ID: " + req.getPatientId()));

        System.out.println("✅ Patient trouvé: " + patient.getNom() + " " + patient.getPrenom());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate date = LocalDate.parse(req.getDate(), formatter);

        RendezVous rdv = new RendezVous();
        rdv.setPatient(patient);
        rdv.setMedecin(medecin);
        rdv.setDate(date);
        rdv.setSlot(req.getSlot());

        System.out.println("✅ Création RDV réussie: medecinId=" + medecin.getId() +
                       ", patientId=" + patient.getId() +
                       ", date=" + date +
                       ", slot=" + req.getSlot());

        return rendezVousRepo.save(rdv);
    }

    public RendezVous createRendezVous(RendezVousRequest req) {
        System.out.println("📥 Création RDV avec infos patient: " + req);

        if (req.getDoctorId() == null) {
            throw new IllegalArgumentException("L'identifiant du médecin est requis.");
        }

        Medecin medecin = medecinRepo.findById(req.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        Patient patient = null;
        if (req.getEmail() != null && !req.getEmail().isEmpty()) {
            Optional<Patient> existingPatient = patientRepo.findByEmail(req.getEmail());
            if (existingPatient.isPresent()) {
                patient = existingPatient.get();
                System.out.println("✅ Patient existant trouvé par email: " + patient.getEmail());
            }
        }

        if (patient == null) {
            patient = new Patient();
            patient.setNom(req.getNom() != null ? req.getNom() : "Inconnu");
            patient.setPrenom(req.getPrenom() != null ? req.getPrenom() : "Inconnu");
            patient.setEmail(req.getEmail() != null ? req.getEmail() : "");
            patient.setTel(req.getTelephone() != null ? req.getTelephone() : "");
            patient.setAdresse(req.getAdresse() != null ? req.getAdresse() : "");
            patient.setCin(req.getCin() != null ? req.getCin() : "");
            patient.setMotDePasse(req.getMotDePasse() != null ? req.getMotDePasse() : "");

            patient = patientRepo.save(patient);
            System.out.println("✅ Nouveau patient créé: " + patient.getNom() + " " + patient.getPrenom());
        }

        if (req.getDate() == null || req.getDate().isEmpty()) {
            throw new IllegalArgumentException("La date du rendez-vous est requise.");
        }
        if (req.getSlot() == null || req.getSlot().isEmpty()) {
            throw new IllegalArgumentException("Le créneau horaire est requis.");
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate date = LocalDate.parse(req.getDate(), formatter);

        RendezVous rdv = new RendezVous();
        rdv.setPatient(patient);
        rdv.setMedecin(medecin);
        rdv.setDate(date);
        rdv.setSlot(req.getSlot());

        System.out.println("✅ Création RDV réussie: medecinId=" + medecin.getId() +
                       ", patientId=" + patient.getId() +
                       ", date=" + date +
                       ", slot=" + req.getSlot());

        return rendezVousRepo.save(rdv);
    }

    // Méthode pour récupérer les créneaux occupés


    // NOUVELLE MÉTHODE : Récupérer les rendez-vous d'un patient
    public List<RendezVous> getRendezVousByPatientId(Integer patientId) {
        System.out.println("🔍 Recherche des rendez-vous pour patient ID: " + patientId);
        
        // Vérifier si le patient existe
        Optional<Patient> patient = patientRepo.findById(patientId);
        if (patient.isEmpty()) {
            System.out.println("❌ Patient non trouvé avec ID: " + patientId);
            return List.of(); // Retourne une liste vide si patient non trouvé
        }

        List<RendezVous> rendezVousList = rendezVousRepo.findByPatientId(patientId);
        System.out.println("✅ " + rendezVousList.size() + " rendez-vous trouvés pour patient ID: " + patientId);
        
        return rendezVousList;
    }

    public List<RendezVous> getAllRendezVous() {
        System.out.println("🔍 Service - Récupération de tous les rendez-vous avec relations");
        
        List<RendezVous> rendezVousList = rendezVousRepo.findAll();
        
        for (RendezVous rdv : rendezVousList) {
            if (rdv.getPatient() != null) {
                rdv.getPatient().getNom();
                rdv.getPatient().getPrenom();
            }
            
            if (rdv.getMedecin() != null) {
                if (rdv.getMedecin().getUser() != null) {
                    rdv.getMedecin().getUser().getNom();
                    rdv.getMedecin().getUser().getPrenom();
                }
                
                if (rdv.getMedecin().getSpecialite() != null) {
                    rdv.getMedecin().getSpecialite().getTitle();
                }
            }
        }
        
        return rendezVousList;
    }

    public List<String> getOccupiedSlots(Integer medecinId, LocalDate date) {
        List<RendezVous> rendezVousList = rendezVousRepo.findNativeByMedecinIdAndDate(medecinId, date);
        return rendezVousList.stream()
            .map(RendezVous::getSlot)
            .collect(Collectors.toList());
    }
}