import axios from "axios";

// URL de ton backend Spring Boot
const API_URL = "http://localhost:8080/api/users";

// 📌 Récupérer tous les utilisateurs
export const getAllUsers = () => {
    return axios.get(API_URL);
};


// 📌 Récupérer un utilisateur par son ID
export const getUserById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

// 📌 Créer un nouvel utilisateur
export const createUser = (user) => {

    // Si c'est un médecin → endpoint spécial
    if (user.role === "medecin") {
        return axios.post(`${API_URL}/create-medecin`, user);
    }

    // Sinon → création normale
    return axios.post(API_URL, user);
};


// 📌 Mettre à jour un utilisateur existant
export const updateUser = (id, user) => {
    return axios.put(`${API_URL}/${id}`, user);
};

export const deleteUser = (id) => {
    return axios.delete(`http://localhost:8080/api/users/${id}`);
};
