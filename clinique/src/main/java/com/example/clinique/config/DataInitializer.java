package com.example.clinique.config;

import com.example.clinique.entities.User;
import com.example.clinique.entities.Speciality;
import com.example.clinique.repository.UserRepository;
import com.example.clinique.repository.SpecialityRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UserRepository userRepository, SpecialityRepository specialityRepository) {
        return args -> {

            // --- Création de l'admin ---
            String adminEmail = "admin@clinique.com";
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setNom("Admin");
                admin.setPrenom("System");
                admin.setEmail(adminEmail);
                admin.setMot_de_passe("admin123"); // ou hashé si spring-security-crypto est utilisé
                admin.setRole(User.Role.admin);

                userRepository.save(admin);
                System.out.println("✅ Admin créé : " + adminEmail);
            } else {
                System.out.println("ℹ️ Admin déjà existant");
            }

            // --- Création de spécialités ---
            if (specialityRepository.count() == 0) {
                Speciality s1 = new Speciality();
                s1.setTitle("Cardiologie");
                s1.setDescription("Spécialité du cœur");
                s1.setDetails("Traitement des maladies cardiaques");
                s1.setIconName("heart");

                Speciality s2 = new Speciality();
                s2.setTitle("Dermatologie");
                s2.setDescription("Spécialité de la peau");
                s2.setDetails("Soins et traitement des maladies cutanées");
                s2.setIconName("skin");

                Speciality s3 = new Speciality();
                s3.setTitle("Pédiatrie");
                s3.setDescription("Spécialité des enfants");
                s3.setDetails("Soins des enfants de 0 à 16 ans");
                s3.setIconName("child");

                specialityRepository.save(s1);
                specialityRepository.save(s2);
                specialityRepository.save(s3);

                System.out.println("✅ Spécialités initiales créées");
            } else {
                System.out.println("ℹ️ Spécialités déjà existantes");
            }
        };
    }
}
