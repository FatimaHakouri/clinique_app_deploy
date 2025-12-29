package com.example.clinique.dto;

public class MedecinRequest {
    private Long userId;
    private String nom;
    private String prenom;
    private String email;
    private String mot_de_passe;
    private String image;
    private String experiences;
    private String languages;
    private Long specialiteId;


    public Long getUserId() { return userId; }
public void setUserId(Long userId) { this.userId = userId; }
    // Getters et setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMot_de_passe() { return mot_de_passe; }
    public void setMot_de_passe(String mot_de_passe) { this.mot_de_passe = mot_de_passe; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getExperiences() { return experiences; }
    public void setExperiences(String experiences) { this.experiences = experiences; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public Long getSpecialiteId() { return specialiteId; }
    public void setSpecialiteId(Long specialiteId) { this.specialiteId = specialiteId; }
}
