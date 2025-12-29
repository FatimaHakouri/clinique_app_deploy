import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import {
  Heart,
  Eye,
  Brain,
  Stethoscope,
  Baby,
  Microscope,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  Star
} from 'lucide-react';

// ** BACKEND **
import { getPatientByEmail, createPatient } from '../services/patientService';
import { createAppointment } from '../services/rendezVousService';
import { getDoctors } from '../services/medecinService';

// Mapping des icônes : clé = iconName (venant de la BDD), valeur = composant Lucide
const iconMap = {
  heart: <Heart size={32} />,
  skin: <Eye size={32} />,
  child: <Baby size={32} />,
  brain: <Brain size={32} />,
  microscope: <Microscope size={32} />,
  default: <Stethoscope size={32} />,
};


const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour la modal de rendez-vous
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [specialtyDoctors, setSpecialtyDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [step, setStep] = useState(0); // 0 = aucun, 1 = choix médecin, 2 = infos patient, 3 = date/creneau, 4 = confirmation
  const [patientForm, setPatientForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
     cin: '',           // ← Ajouté
  mot_de_passe: ''   // ← Ajouté
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const frenchDays = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  const frenchMonths = [
    'Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
  ];

  const weekdaySlots = [
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '14:30','15:00','15:30','16:00','16:30','17:00',
  ];

  const saturdaySlots = ['09:00','09:30','10:00','10:30','11:00','11:30'];

  // Fonctions pour la modal de rendez-vous
  const fetchOccupiedSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    
    try {
      setLoadingSlots(true);
      const formattedDate = date.toISOString().split('T')[0];
      const response = await fetch(`http://localhost:8080/rendezvous/occupied-slots/${doctorId}/${formattedDate}`);
      if (response.ok) {
        const slots = await response.json();
        setOccupiedSlots(slots);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des créneaux occupés:", error);
      setOccupiedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const isSlotAvailable = (slot) => {
    return !occupiedSlots.includes(slot);
  };

  const getSlotsForDate = (date) => {
    const day = date.getDay();
    if (day === 0) return [];
    if (day === 6) return saturdaySlots;
    return weekdaySlots;
  };

  const getWeekDays = (baseDate) => {
    const days = [];
    const start = new Date();
    if (baseDate > start) start.setTime(baseDate.getTime());
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const goToPrevMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    const now = new Date();
    if (d.getMonth() < now.getMonth() && d.getFullYear() <= now.getFullYear()) return;
    setSelectedDate(d);
    setSelectedSlot('');
  };

  const goToNextMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    setSelectedDate(d);
    setSelectedSlot('');
  };

  const handleTakeAppointment = async (specialty) => {
    try {
      setSelectedSpecialty(specialty);
      
      // Charger les médecins de cette spécialité
      const allDoctors = await getDoctors();
      const filteredDoctors = allDoctors.filter(doc => 
        doc.specialite?.title === specialty
      );
      
      if (filteredDoctors.length === 0) {
        alert(`Aucun médecin disponible pour la spécialité ${specialty}`);
        return;
      }
      
      setSpecialtyDoctors(filteredDoctors);
      setStep(1); // Passer à l'étape de sélection du médecin
    } catch (error) {
      console.error("Erreur lors de la recherche des médecins:", error);
      alert("Erreur lors de la prise de rendez-vous");
    }
  };

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2); // Passer à l'étape des informations patient
  };

  const handleCloseModal = () => {
  setSelectedSpecialty(null);
  setSpecialtyDoctors([]);
  setSelectedDoctor(null);
  setStep(0);
  setPatientForm({ 
    nom:'', 
    prenom:'', 
    email:'', 
    telephone:'', 
    cin:'',           // ← Ajouté
    mot_de_passe:''   // ← Ajouté
  });
  setSelectedDate(new Date());
  setSelectedSlot('');
  setOccupiedSlots([]);
};

 const confirmAppointment = async () => {
  try {
    console.log("🔍 Recherche du patient avec email:", patientForm.email);
    
    let patient = await getPatientByEmail(patientForm.email);
    console.log("📋 Patient trouvé:", patient);
    
    if (!patient) {
      console.log("➕ Création d'un nouveau patient");
      patient = await createPatient(patientForm);
      console.log("✅ Patient créé avec ID:", patient.id);
    }

    const appointmentData = {
      date: selectedDate.toISOString().split('T')[0],
      slot: selectedSlot,
      patientId: patient.id,
      doctorId: selectedDoctor.id
    };

    console.log("📅 Données du rendez-vous envoyées:", appointmentData);
    await createAppointment(appointmentData);

    alert("✅ Rendez-vous confirmé avec succès !");
    handleCloseModal();
  } catch (error) {
    console.error("❌ Erreur détaillée:", error);
    
    if (error.response) {
      console.error("📡 Status:", error.response.status);
      console.error("📡 Données d'erreur:", error.response.data);
      
      // Vérification spécifique pour l'erreur de CIN dupliqué
      const errorMessage = error.response.data?.message || '';
      const errorDetails = JSON.stringify(error.response.data).toLowerCase();
      
      if (errorMessage.includes('CIN') || errorDetails.includes('cin') || 
          errorMessage.includes('duplicate') || errorDetails.includes('unique') ||
          errorMessage.includes('déjà') || errorDetails.includes('existe')) {
        alert("❌ Erreur : Ce numéro CIN est déjà utilisé par un autre patient. Veuillez utiliser un CIN différent ou vous connecter avec votre compte existant.");
      } else if (error.response.status === 500) {
        alert("❌ Erreur serveur : Le numéro CIN existe peut-être déjà dans notre système. Veuillez vérifier vos informations ou contacter le support.");
      } else {
        alert("❌ Erreur lors de la confirmation du rendez-vous: " + (errorMessage || 'Veuillez réessayer.'));
      }
    } else {
      alert("Erreur de connexion. Veuillez vérifier votre internet et réessayer.");
    }
  }
};

  // Charger les créneaux occupés quand la date ou le médecin change
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchOccupiedSlots(selectedDoctor.id, selectedDate);
    }
  }, [selectedDate, selectedDoctor]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/specialities');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();

        const transformed = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          details: typeof item.details === 'string'
            ? item.details.split(',').map(d => d.trim())
            : item.details || [],
          iconName: item.iconName || 'Stethoscope',
        }));

        setServices(transformed);
      } catch (err) {
        console.error('Erreur lors du chargement des spécialités:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Chargement des services médicaux...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>Erreur : {error}</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />

      {/* Header */}
      <header style={{
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        padding: '1rem 0',
        marginBottom: '2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <Link to="/" style={{
            background: '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500'
          }}>
            ← Retour à l'accueil
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Nos Services Médicaux</h1>
        </div>
      </header>

      {/* Contenu principal */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Des Soins Complets pour Toute la Famille
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            Découvrez notre gamme complète de services médicaux prodigués par des professionnels expérimentés.
          </p>
        </motion.div>

        {/* Grille des services */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem',
        }}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{
                background: '#dbeafe',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                marginBottom: '1.5rem',
              }}>
               {iconMap[service.iconName?.toLowerCase()] || iconMap.default}
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                {service.title}
              </h3>

              <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {service.description}
              </p>

              <ul style={{ color: '#6b7280', marginBottom: '1.5rem', paddingLeft: '1rem' }}>
                {service.details.map((detail, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>{detail}</li>
                ))}
              </ul>

              <button 
                onClick={() => handleTakeAppointment(service.title)}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '50px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
              >
                Prendre RDV <Calendar size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Section CTA */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white',
            padding: '3rem 2rem',
            borderRadius: '1rem',
            textAlign: 'center'
          }}
        >
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Besoin d'un Service Spécifique ?</h3>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: '0.9' }}>
            Notre équipe est à votre écoute pour répondre à tous vos besoins médicaux.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button style={{
              background: '#fbbf24',
              color: '#1f2937',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '50px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Nous Contacter <ArrowRight size={16} />
            </button>
            <button style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '1rem 2rem',
              borderRadius: '50px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              0536-50-06-01
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal prise de rendez-vous */}
      {selectedSpecialty && step > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: step === 1 ? '600px' : '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ✕
            </button>

            {/* Étape 1 : Sélection du médecin */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                  Choisissez votre médecin - {selectedSpecialty}
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                  Sélectionnez le médecin avec lequel vous souhaitez prendre rendez-vous
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {specialtyDoctors.map((doctor) => (
                    <motion.div
                      key={doctor.id}
                      whileHover={{ scale: 1.02 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleSelectDoctor(doctor)}
                    >
                      <div style={{
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: '#dbeafe',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#2563eb',
  flexShrink: 0
}}>
  {doctor.image ? (
    <img 
      src={doctor.image} 
      alt={`${doctor.nom} ${doctor.prenom}`}
      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
    />
  ) : (
    <span style={{ fontSize: '24px' }}>👨‍⚕️</span>
  )}
</div>

                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                          Dr {doctor.nom} {doctor.prenom}
                        </h3>
                        <p style={{ color: '#6b7280', margin: '0.25rem 0', fontSize: '0.875rem' }}>
                          {doctor.specialite?.title}
                        </p>
                        <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                          Expérience: {doctor.experiences}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                          ))}
                        </div>
                      </div>
                      <ArrowRight size={20} color="#6b7280" />
                    </motion.div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button 
                    onClick={handleCloseModal}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
{/* Étape 2 : Informations patient */}
{step === 2 && (
  <div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: '#dbeafe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#2563eb'
      }}>
       {selectedDoctor.image ? (
  <img 
    src={selectedDoctor.image} 
    alt={`${selectedDoctor.nom} ${selectedDoctor.prenom}`}
    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
  />
) : (
  <span style={{ fontSize: '32px' }}>👨‍⚕️</span>
)}

      </div>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          Dr {selectedDoctor.nom} {selectedDoctor.prenom}
        </h3>
        <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
          {selectedDoctor.specialite?.title}
        </p>
      </div>
    </div>

    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
      Vos informations
    </h3>
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      
      // Validation avancée
      const errors = [];
      
      if (!patientForm.nom.trim()) errors.push('Le nom est obligatoire');
      if (!patientForm.prenom.trim()) errors.push('Le prénom est obligatoire');
      if (!patientForm.email.trim()) errors.push('L\'email est obligatoire');
      if (!patientForm.telephone.trim()) errors.push('Le téléphone est obligatoire');
      if (!patientForm.cin.trim()) errors.push('Le CIN est obligatoire');
      if (!patientForm.mot_de_passe.trim()) {
        errors.push('Le mot de passe est obligatoire');
      } else if (patientForm.mot_de_passe.length < 6) {
        errors.push('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      if (errors.length > 0) {
        alert('Veuillez corriger les erreurs suivantes :\n' + errors.join('\n'));
        return;
      }
      
      setStep(3); 
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Nom * :
          </label>
          <input 
            type="text" 
            value={patientForm.nom} 
            onChange={(e) => setPatientForm({ ...patientForm, nom: e.target.value })} 
            required 
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Prénom * :
          </label>
          <input 
            type="text" 
            value={patientForm.prenom} 
            onChange={(e) => setPatientForm({ ...patientForm, prenom: e.target.value })} 
            required 
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
          Email * :
        </label>
        <input 
          type="email" 
          value={patientForm.email} 
          onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} 
          required 
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
          Téléphone * :
        </label>
        <input 
          type="tel" 
          value={patientForm.telephone} 
          onChange={(e) => setPatientForm({ ...patientForm, telephone: e.target.value })} 
          required 
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            CIN * :
          </label>
          <input 
            type="text" 
            value={patientForm.cin} 
            onChange={(e) => setPatientForm({ ...patientForm, cin: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Mot de passe * :
          </label>
          <input 
            type="password" 
            value={patientForm.mot_de_passe} 
            onChange={(e) => setPatientForm({ ...patientForm, mot_de_passe: e.target.value })}
            required
            minLength="6"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
          />
          <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
            Minimum 6 caractères
          </small>
        </div>
      </div>

      <div style={{ 
        color: '#dc3545', 
        fontSize: '0.75rem', 
        textAlign: 'center',
        marginBottom: '1rem',
        padding: '8px',
        backgroundColor: '#f8d7da',
        borderRadius: '4px'
      }}>
        ⚠️ Chaque numéro CIN doit être unique. Si vous avez déjà un compte, utilisez le même CIN.
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <button 
          type="button" 
          onClick={() => setStep(1)}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          ⬅ Retour
        </button>
        <button 
          type="submit"
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Continuer
        </button>
      </div>
    </form>
  </div>
)}
            {/* Étape 3 : Date et créneau */}
            {step === 3 && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb'
                  }}>
                   {selectedDoctor.image ? (
  <img 
    src={selectedDoctor.image} 
    alt={`${selectedDoctor.nom} ${selectedDoctor.prenom}`}
    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
  />
) : (
  <span style={{ fontSize: '32px' }}>👨‍⚕️</span>
)}

                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                      Dr {selectedDoctor.nom} {selectedDoctor.prenom}
                    </h3>
                    <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      {selectedDoctor.specialite?.title}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <button type="button" onClick={goToPrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>
                      {frenchMonths[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </span>
                    <button type="button" onClick={goToNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {getWeekDays(selectedDate).map((d) => {
                      const isSelected = d.toDateString() === selectedDate.toDateString();
                      const isSunday = d.getDay() === 0;
                      const isPast = d < new Date(new Date().setHours(0,0,0,0));
                      return (
                        <button 
                          key={d.toISOString()} 
                          type="button"
                          onClick={() => { if(!isSunday && !isPast){ setSelectedDate(d); setSelectedSlot(''); } }}
                          disabled={isSunday || isPast}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            background: isSelected ? '#2563eb' : (isSunday || isPast ? '#f3f4f6' : 'white'),
                            color: isSelected ? 'white' : (isSunday || isPast ? '#9ca3af' : '#1f2937'),
                            borderRadius: '0.5rem',
                            cursor: (isSunday || isPast) ? 'not-allowed' : 'pointer',
                            opacity: (isSunday || isPast) ? 0.6 : 1
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>{frenchDays[d.getDay()]}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{d.getDate()}</div>
                        </button>
                      );
                    })}
                  </div>

                  {loadingSlots && (
                    <div style={{ textAlign: 'center', color: '#666', margin: '10px 0' }}>
                      Chargement des disponibilités...
                    </div>
                  )}

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    {getSlotsForDate(selectedDate).map(slot => {
                      const isOccupied = !isSlotAvailable(slot);
                      const isSelected = selectedSlot === slot;
                      
                      return (
                        <button 
                          key={slot} 
                          type="button"
                          onClick={() => {
                            if (!isOccupied) {
                              setSelectedSlot(slot);
                            }
                          }}
                          disabled={isOccupied}
                          style={{
                            padding: '0.75rem',
                            border: `1px solid ${isSelected ? '#2563eb' : (isOccupied ? '#e5e7eb' : '#d1d5db')}`,
                            background: isSelected ? '#2563eb' : (isOccupied ? '#f8f9fa' : 'white'),
                            color: isSelected ? 'white' : (isOccupied ? '#6c757d' : '#1f2937'),
                            borderRadius: '0.5rem',
                            cursor: isOccupied ? 'not-allowed' : 'pointer',
                            opacity: isOccupied ? 0.6 : 1,
                            fontSize: '0.875rem'
                          }}
                        >
                          {slot}
                          {isOccupied && <span style={{
                            fontSize: '0.7em',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            marginLeft: '5px'
                          }}>Occupé</span>}
                        </button>
                      );
                    })}
                  </div>

                  {occupiedSlots.length > 0 && (
                    <div style={{
                      textAlign: 'center',
                      color: '#856404',
                      backgroundColor: '#fff3cd',
                      padding: '8px',
                      borderRadius: '4px',
                      margin: '10px 0',
                      fontSize: '0.9em'
                    }}>
                      {occupiedSlots.length} créneau(x) déjà réservé(s) pour cette date
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                    <button 
                      type="button" 
                      onClick={()=>setStep(2)}
                      style={{
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      ⬅ Retour
                    </button>
                    <button 
                      type="button" 
                      onClick={()=>{ 
                        if(!selectedSlot){
                          alert('Veuillez choisir un créneau');
                          return;
                        } 
                        setStep(4); 
                      }}
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 4 : Confirmation */}
            {step === 4 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                  Confirmation du rendez-vous
                </h3>
               <div style={{ marginBottom: '1.5rem' }}>
  <p><strong>Docteur :</strong> {selectedDoctor.nom} {selectedDoctor.prenom}</p>
  <p><strong>Spécialité :</strong> {selectedDoctor.specialite?.title}</p>
  <p><strong>Patient :</strong> {patientForm.prenom} {patientForm.nom}</p>
  <p><strong>Email :</strong> {patientForm.email}</p>
  <p><strong>Téléphone :</strong> {patientForm.telephone}</p>
  {patientForm.cin && <p><strong>CIN :</strong> {patientForm.cin}</p>}
  {patientForm.mot_de_passe && <p><strong>Mot de passe :</strong> ••••••••</p>}
  <p><strong>Date :</strong> {selectedDate.toLocaleDateString('fr-FR')}</p>
  <p><strong>Créneau :</strong> {selectedSlot}</p>
</div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                  <button 
                    type="button" 
                    onClick={()=>setStep(3)}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    ⬅ Modifier
                  </button>
                  <button 
                    type="button" 
                    onClick={confirmAppointment}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Confirmer le rendez-vous
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;