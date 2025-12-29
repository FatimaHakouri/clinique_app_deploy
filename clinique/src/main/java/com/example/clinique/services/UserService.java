package com.example.clinique.services;

import com.example.clinique.entities.Medecin;
import com.example.clinique.entities.Speciality;
import com.example.clinique.entities.User;
import com.example.clinique.dto.MedecinRequest;
import com.example.clinique.repository.MedecinRepository;
import com.example.clinique.repository.SpecialityRepository;
import com.example.clinique.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;
    private final SpecialityRepository specialityRepository;

    public UserService(UserRepository userRepository,
                       MedecinRepository medecinRepository,
                       SpecialityRepository specialityRepository) {
        this.userRepository = userRepository;
        this.medecinRepository = medecinRepository;
        this.specialityRepository = specialityRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // -------------------------------------------
    // ✔️ CRÉATION MÉDECIN
    // -------------------------------------------
    public ResponseEntity<?> createMedecin(MedecinRequest request) {

        User user = new User();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setMot_de_passe(request.getMot_de_passe());
        user.setRole(User.Role.medecin);

        User savedUser = userRepository.save(user);

        Medecin medecin = new Medecin();
        medecin.setUser(savedUser);
        medecin.setImage(request.getImage());
        medecin.setExperiences(request.getExperiences());
        medecin.setLanguages(request.getLanguages());

        Speciality speciality = specialityRepository.findById(request.getSpecialiteId())
                .orElse(null);

        medecin.setSpecialite(speciality);

        medecinRepository.save(medecin);

        return ResponseEntity.ok("Médecin créé avec succès");
    }

    
// ✔️ UPDATE MÉDECIN
// -------------------------------------------
@Transactional
public ResponseEntity<?> updateMedecin(Integer medecinId, MedecinRequest request) {
    System.out.println("🔄 Service: Mise à jour médecin ID: " + medecinId);
    
    try {
        Optional<Medecin> medecinOpt = medecinRepository.findById(medecinId);
        if (medecinOpt.isEmpty()) {
            System.out.println("❌ Médecin non trouvé ID: " + medecinId);
            return ResponseEntity.notFound().build();
        }

        Medecin medecin = medecinOpt.get();
        System.out.println("✅ Médecin trouvé: " + medecin.getId());

        // Update User
        User user = medecin.getUser();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        
        // Ne mettre à jour le mot de passe que s'il est fourni et non vide
        if (request.getMot_de_passe() != null && !request.getMot_de_passe().trim().isEmpty()) {
            user.setMot_de_passe(request.getMot_de_passe());
            System.out.println("🔑 Mot de passe mis à jour");
        }
        
        user.setRole(User.Role.medecin);
        userRepository.save(user);
        System.out.println("✅ User mis à jour: " + user.getEmail());

        // Update Medecin
        medecin.setImage(request.getImage());
        medecin.setExperiences(request.getExperiences());
        medecin.setLanguages(request.getLanguages());
        
        Speciality specialite = specialityRepository.findById(request.getSpecialiteId()).orElse(null);
        medecin.setSpecialite(specialite);
        
        medecinRepository.save(medecin);
        System.out.println("✅ Profil médecin mis à jour");

        return ResponseEntity.ok("Médecin mis à jour avec succès");

    } catch (Exception e) {
        System.err.println("💥 Erreur lors de la mise à jour du médecin: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body("Erreur lors de la mise à jour: " + e.getMessage());
    }
}
    // -------------------------------------------
    // ✔️ SUPPRESSION - CORRIGÉ
    // -------------------------------------------
    @Transactional
    public ResponseEntity<?> deleteUser(Integer id) {
        try {
            System.out.println("🚀 Suppression user ID: " + id);
            
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            System.out.println("✅ User trouvé: " + user.getEmail() + " - Role: " + user.getRole());

            // Si c'est un médecin, supprimer d'abord le profil médecin
            if (user.getRole() == User.Role.medecin) {
                System.out.println("🔍 Recherche du profil médecin...");
                
                // Utilisez la méthode du repository
                Optional<Medecin> medecinOpt = medecinRepository.findByUserId(user.getId());
                
                if (medecinOpt.isPresent()) {
                    Medecin medecin = medecinOpt.get();
                    System.out.println("✅ Médecin trouvé ID: " + medecin.getId());
                    
                    // Supprimer le médecin d'abord
                    medecinRepository.delete(medecin);
                    System.out.println("✅ Profil médecin supprimé");
                }
            }

            // Maintenant supprimer le user
            userRepository.delete(user);
            System.out.println("✅ User supprimé avec succès");

            return ResponseEntity.ok("Utilisateur supprimé avec succès");

        } catch (Exception e) {
            System.err.println("💥 ERREUR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("Erreur lors de la suppression: " + e.getMessage());
        }
    }





    // ✔️ Mise à jour DU PROFIL MÉDECIN SEULEMENT (image, exp, langues)
    @Transactional
    public ResponseEntity<?> updateMedecinProfil(Integer medecinId, MedecinRequest request) {
        System.out.println("🔄 Mise à jour DU PROFIL médecin ID: " + medecinId);
        
        Optional<Medecin> medecinOpt = medecinRepository.findById(medecinId);
        if (medecinOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Medecin medecin = medecinOpt.get();

        // 🔒 Ne mettre à jour QUE les champs du profil (PAS User, PAS spécialité)
        if (request.getImage() != null) {
            medecin.setImage(request.getImage());
        }
        if (request.getExperiences() != null) {
            medecin.setExperiences(request.getExperiences());
        }
        if (request.getLanguages() != null) {
            medecin.setLanguages(request.getLanguages());
        }

        medecinRepository.save(medecin);
        System.out.println("✅ Profil médecin mis à jour (seulement image/exp/langues)");

        return ResponseEntity.ok(medecin);
    }
}