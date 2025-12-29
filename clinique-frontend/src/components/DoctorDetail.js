import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Star, Clock, MapPin, 
  Phone, Mail, Award, Users, Clock4
} from 'lucide-react';
import styles from './CliniqueInfo.module.css';

const DoctorDetail = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Données des médecins (en vrai, ça viendrait d'une API)
  const doctors = {
    1: { 
      id: 1, 
      name: "Dr. Ahmed Khan", 
      specialty: "Cardiologie", 
      experience: "15 ans", 
      image: "👨‍⚕️",
      education: "Doctorat en Médecine - Université de Paris",
      languages: ["Français", "Arabe", "Anglais"],
      awards: ["Prix d'Excellence Médicale 2022", "Médecin de l'Année 2020"],
      about: `Le Dr. Ahmed Khan est un cardiologue renommé avec plus de 15 ans d'expérience. 
              Spécialiste en cardiologie interventionnelle, il se consacre à offrir les meilleurs soins à ses patients.`
    },
    2: { 
      id: 2, 
      name: "Dr. Sophie Martin", 
      specialty: "Pédiatrie", 
      experience: "12 ans", 
      image: "👩‍⚕️",
      education: "Doctorat en Pédiatrie - Université de Montréal",
      languages: ["Français", "Anglais"],
      awards: ["Prix de la Meilleure Pédiatre 2021"],
      about: `Le Dr. Sophie Martin est une pédiatre dévouée avec 12 ans d'expérience. 
              Elle est spécialisée dans les soins aux enfants et adolescents.`
    },
    // ... autres docteurs
  };

  const doctor = doctors[doctorId];

  if (!doctor) {
    return (
      <div className={styles.doctorDetailPage}>
        <div className={styles.errorPage}>
          <h2>Médecin non trouvé</h2>
          <p>Le médecin que vous recherchez n'existe pas.</p>
          <Link to="/medecins" className={styles.backButton}>
            ← Retour aux médecins
          </Link>
        </div>
      </div>
    );
  }

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  const handleBookAppointment = () => {
    // Ouvrir modal ou rediriger vers page de réservation
    alert(`Rendez-vous avec ${doctor.name} le ${selectedDate} à ${selectedTime}`);
  };

  return (
    <div className={styles.doctorDetailPage}>
      {/* Header avec navigation */}
      <header className={styles.doctorHeader}>
        <div className={styles.doctorNav}>
          <Link to="/medecins" className={styles.backButton}>
            <ArrowLeft size={20} />
            Retour aux médecins
          </Link>
          <h1>Profil du Docteur</h1>
        </div>
      </header>

      {/* Le reste du contenu de DoctorDetail reste le même */}
      {/* ... */}
    </div>
  );
};

export default DoctorDetail;