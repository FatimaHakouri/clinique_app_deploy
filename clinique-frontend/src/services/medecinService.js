import axios from 'axios';

const API_URL = 'http://localhost:8080/api/medecins'; // ton endpoint Spring Boot

export const getDoctors = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des médecins :", error);
    return [];
  }
};

export const getDoctorById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data; // objet médecin détaillé
};