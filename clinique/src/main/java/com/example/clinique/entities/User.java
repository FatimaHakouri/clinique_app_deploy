package com.example.clinique.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nom;
    private String prenom;
    private String email;
    private String mot_de_passe;

    // --------- SUPPRIMEZ la relation bidirectionnelle ---------
    // COMMENTEZ ou SUPPRIMEZ ces lignes :
    // @OneToOne(mappedBy = "user")
    // @JsonManagedReference
    // private Medecin medecin;

    // Supprimez aussi les getters/setters pour medecin
    // public Medecin getMedecin() { return medecin; }
    // public void setMedecin(Medecin medecin) { this.medecin = medecin; }

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role {
        admin, medecin, secretaire, patient
    }

    // Getters et Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMot_de_passe() { return mot_de_passe; }
    public void setMot_de_passe(String mot_de_passe) { this.mot_de_passe = mot_de_passe; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}