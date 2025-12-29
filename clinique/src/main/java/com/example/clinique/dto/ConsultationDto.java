package com.example.clinique.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ConsultationDto {
    private Integer id;
    private LocalDateTime dateConsultation;
    private String motif;
    private String traitement;
    private List<String> fichier;
    private Integer medecinId;
    private String medecinNom;
    private String medecinPrenom;
    private String specialite;

    public ConsultationDto(Integer id, LocalDateTime dateConsultation, String motif, String traitement,
                          List<String> fichier, Integer medecinId, String medecinNom, String medecinPrenom, String specialite) {
        this.id = id;
        this.dateConsultation = dateConsultation;
        this.motif = motif;
        this.traitement = traitement;
        this.fichier = fichier;
        this.medecinId = medecinId;
        this.medecinNom = medecinNom;
        this.medecinPrenom = medecinPrenom;
        this.specialite = specialite;
    }
 
    // Getters
    public Integer getId() { return id; }
    public LocalDateTime getDateConsultation() { return dateConsultation; }
    public String getMotif() { return motif; }
    public String getTraitement() { return traitement; }
    public List<String> getFichier() { return fichier; }
    public Integer getMedecinId() { return medecinId; }
    public String getMedecinNom() { return medecinNom; }
    public String getMedecinPrenom() { return medecinPrenom; }
    public String getSpecialite() { return specialite; }
}