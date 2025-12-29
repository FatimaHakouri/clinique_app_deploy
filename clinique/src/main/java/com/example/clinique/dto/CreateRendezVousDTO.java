package com.example.clinique.dto;

public class CreateRendezVousDTO {
    private String date;
    private String slot;
    private Integer patientId;
    private Integer doctorId;

    // Constructeurs
    public CreateRendezVousDTO() {}

    public CreateRendezVousDTO(String date, String slot, Integer patientId, Integer doctorId) {
        this.date = date;
        this.slot = slot;
        this.patientId = patientId;
        this.doctorId = doctorId;
    }

    // Getters et Setters
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getSlot() { return slot; }
    public void setSlot(String slot) { this.slot = slot; }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }

    @Override
    public String toString() {
        return "CreateRendezVousDTO{" +
                "date='" + date + '\'' +
                ", slot='" + slot + '\'' +
                ", patientId=" + patientId +
                ", doctorId=" + doctorId +
                '}';
    }
}