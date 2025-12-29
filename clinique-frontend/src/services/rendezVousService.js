// src/services/rendezVousService.js
import axios from "axios";

const API_URL = "http://localhost:8080/rendezvous";

export const createAppointment = (data) => {
  console.log("🚀 Données envoyées à l'API:", data);
  
  return axios.post(API_URL, data, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

export const getAppointmentsByDoctorAndDate = (doctorId, date) => {
  return axios.get(`${API_URL}/${doctorId}/${date}`);
};