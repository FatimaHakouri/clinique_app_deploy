package com.example.clinique.services;

import com.example.clinique.dto.LoginRequest;
import com.example.clinique.dto.LoginResponse;
import com.example.clinique.entities.Patient;
import com.example.clinique.entities.User;
import com.example.clinique.repository.PatientRepository;
import com.example.clinique.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    public LoginResponse authenticate(LoginRequest loginRequest) {

        System.out.println("🔐 Tentative de connexion pour: " + loginRequest.getEmail());

        /* =========================
           1️⃣ Vérification USERS
        ========================== */
        Optional<User> userOptional =
                userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {

            User user = userOptional.get();
            System.out.println("✅ Utilisateur trouvé (USERS): "
                    + user.getEmail() + " - Role: " + user.getRole());

            if (!user.getMot_de_passe().equals(loginRequest.getPassword())) {
                System.out.println("❌ Mot de passe incorrect (USERS)");
                return new LoginResponse(false, "Mot de passe incorrect");
            }

            String token = generateToken(user);
            String redirectUrl = determineRedirectUrl(user.getRole());

            System.out.println("✅ Connexion USERS réussie → " + redirectUrl);

            return new LoginResponse(
                    true,
                    "Connexion réussie",
                    token,
                    user,
                    redirectUrl
            );
        }

       /* =========================
   2️⃣ Vérification PATIENTS
========================== */
Optional<Patient> patientOptional =
        patientRepository.findByEmail(loginRequest.getEmail());

if (patientOptional.isPresent()) {

    Patient patient = patientOptional.get();
    System.out.println("✅ Patient trouvé (PATIENTS): "
            + patient.getNom() + " " + patient.getPrenom());

    if (!patient.getMotDePasse().equals(loginRequest.getPassword())) {
        System.out.println("❌ Mot de passe incorrect (PATIENTS)");
        return new LoginResponse(false, "Mot de passe incorrect");
    }

    String token = "token-patient-" + patient.getId();

    // ✅ FAKE USER OBLIGATOIRE
    User fakeUser = new User();
    fakeUser.setId(patient.getId());
    fakeUser.setEmail(patient.getEmail());      // 🔥 TRÈS IMPORTANT
    fakeUser.setNom(patient.getNom());
    fakeUser.setPrenom(patient.getPrenom());
    fakeUser.setRole(User.Role.patient);

    System.out.println("✅ Connexion PATIENT réussie → /patient/dashboard");

    return new LoginResponse(
            true,
            "Connexion réussie",
            token,
            fakeUser,
            "/patient/dashboard"
    );
}

        /* =========================
           3️⃣ Aucun trouvé
        ========================== */
        System.out.println("❌ Email non trouvé dans USERS ni PATIENTS");
        return new LoginResponse(false, "Email non trouvé");
    }

    /* =========================
       MÉTHODES UTILES
    ========================== */

    private String generateToken(User user) {
        return "token-" + user.getId() + "-" + System.currentTimeMillis();
    }

    private String determineRedirectUrl(User.Role role) {
        switch (role) {
            case admin:
                return "/admin/dashboard";
            case medecin:
                return "/medecin/dashboard";
            case secretaire:
                return "/secretaire/dashboard";
            case patient:
                return "/patient/dashboard";
            default:
                return "/";
        }
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}
