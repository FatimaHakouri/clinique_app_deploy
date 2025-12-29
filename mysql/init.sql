CREATE DATABASE IF NOT EXISTS clinique_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE clinique_db;

-- Crée la table users si elle n'existe pas encore
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Insère l'utilisateur admin
INSERT INTO users (nom, prenom, email, mot_de_passe, role)
VALUES ('Admin','System','admin@clinique.com','admin123','admin');
