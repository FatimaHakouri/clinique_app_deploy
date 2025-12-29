package com.example.clinique.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "medecins")
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // RELATION SIMPLIFIÉE - Supprimez @JsonBackReference
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "specialite_id")
    private Speciality specialite;

    private String image;        // URL ou emoji
    private String experiences;  // expériences du médecin
    private String languages;    // langues parlées séparées par virgule

    // Constructeur par défaut
    public Medecin() {}

    // Getters et Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Speciality getSpecialite() { return specialite; }
    public void setSpecialite(Speciality specialite) { this.specialite = specialite; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getExperiences() { return experiences; }
    public void setExperiences(String experiences) { this.experiences = experiences; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }
}