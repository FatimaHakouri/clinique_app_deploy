// src/components/MedecinProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctorById } from '../services/medecinService';
import Navbar from './layout/Navbar';
import { 
  MapPin, Star, ArrowLeft, Calendar, Mail, Phone, Globe, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import styles from './MedecinProfile.module.css';

// ** BACKEND **
import { getPatientByEmail, createPatient } from '../services/patientService';
import { createAppointment } from '../services/rendezVousService';

export default function MedecinProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // États pour la modal de rendez-vous
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [step, setStep] = useState(0); // 0 = aucun, 1 = infos patient, 2 = date/creneau, 3 = confirmation
  const [patientForm, setPatientForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cin: '',
    mot_de_passe: ''
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

  // Fonction pour récupérer les créneaux occupés
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

  // Fonction pour vérifier si un créneau est disponible
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

  const handleTakeAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(1);
  };

  const handleCloseModal = () => {
    setSelectedDoctor(null);
    setStep(0);
    setPatientForm({ 
      nom:'', 
      prenom:'', 
      email:'', 
      telephone:'', 
      cin:'',
      mot_de_passe:''
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
    const fetchDoctor = async () => {
      try {
        const data = await getDoctorById(id);
        setDoctor(data);
      } catch (error) {
        console.error('Erreur chargement médecin :', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.fullPageCenter}>
        <div className={styles.loader} />
        <p>Chargement du profil médecin...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className={styles.fullPageCenter}>
        <p>Médecin introuvable.</p>
        <Link to="/medecins" className={styles.backLinkSimple}>
          <ArrowLeft size={16} /> Retour à la liste des médecins
        </Link>
      </div>
    );
  }

  // Sécurité sur les champs
  const user = doctor.user || {};
  const specialite = doctor.specialite || {};

  const fullName = `Dr ${user.prenom || doctor.prenom || ''} ${user.nom || doctor.nom || ''}`.trim();
  const email = user.email || doctor.email || null;
  const phone = user.telephone || user.phone || doctor.telephone || null;

  const langues = doctor.languages
    ? (Array.isArray(doctor.languages)
        ? doctor.languages
        : doctor.languages.split(',').map((l) => l.trim()).filter(Boolean))
    : [];

  const experienceText =
    doctor.experiences ||
    `Médecin expérimenté au sein de la clinique SantéPlus, spécialisé en ${
      specialite.title || 'médecine générale'
    } et engagé pour un suivi personnalisé de ses patients.`;

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Ligne retour */}
        <div className={styles.backRow}>
          <Link to="/medecins" className={styles.backLink}>
            <ArrowLeft size={18} />
            <span>Retour à la liste des médecins</span>
          </Link>
        </div>

        <div className={styles.profileCard}>
          {/* HEADER : avatar + infos principales */}
          <div className={styles.header}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {doctor.image ? (
                  <img
                    src={doctor.image}
                    alt={fullName}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className={styles.avatarEmoji}>
                    {specialite.iconName || '👨‍⚕️'}
                  </span>
                )}
              </div>
              <div className={styles.specialityChip}>
                {specialite.title || 'Spécialité non renseignée'}
              </div>
            </div>

            <div className={styles.headerInfo}>
              <h1 className={styles.name}>{fullName}</h1>

              <p className={styles.location}>
                <MapPin size={16} />
                <span>Clinique SantéPlus, Oujda</span>
              </p>

              <div className={styles.ratingRow}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
                <span className={styles.ratingText}>4.9 / 5 • 120 avis</span>
              </div>

              <div className={styles.headerBadges}>
                <span className={styles.badge}>+10 ans d'expérience</span>
                <span className={styles.badge}>
                  {langues.length > 0 ? `${langues.length} langues parlées` : 'Français'}
                </span>
              </div>
            </div>
          </div>

          {/* BODY : 2 colonnes */}
          <div className={styles.body}>
            {/* Colonne gauche */}
            <div className={styles.leftCol}>
              {/* À propos */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>À propos</h2>
                <p className={styles.sectionText}>{experienceText}</p>
              </section>

              {/* Spécialité */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Spécialité</h2>
                <div className={styles.specialityCard}>
                  <h3>{specialite.title || 'Non renseignée'}</h3>
                  <p>
                    {specialite.description ||
                      `Consultations, diagnostics et suivi en ${specialite.title || 'médecine générale'} 
                      avec une approche centrée sur le patient.`}
                  </p>
                </div>
              </section>

              {/* Langues */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Langues parlées</h2>
                <div className={styles.chipsRow}>
                  {langues.length > 0 ? (
                    langues.map((lang) => (
                      <span key={lang} className={styles.chip}>
                        <Globe size={14} />
                        <span>{lang}</span>
                      </span>
                    ))
                  ) : (
                    <span className={styles.chip}>
                      <Globe size={14} />
                      <span>Français</span>
                    </span>
                  )}
                </div>
              </section>
            </div>

            {/* Colonne droite */}
            <div className={styles.rightCol}>
              {/* Contact rapide */}
              <section className={`${styles.section} ${styles.sectionCard}`}>
                <h2 className={styles.sectionTitle}>Contact</h2>
                <div className={styles.contactItem}>
                  <Mail size={18} />
                  <div>
                    <span className={styles.contactLabel}>Email</span>
                    <span className={styles.contactValue}>
                      {email || 'Non renseigné'}
                    </span>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <Phone size={18} />
                  <div>
                    <span className={styles.contactLabel}>Téléphone</span>
                    <span className={styles.contactValue}>
                      {phone || 'Disponible via le secrétariat'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Bloc prise de rendez-vous */}
              <section className={`${styles.section} ${styles.sectionCard}`}>
                <h2 className={styles.sectionTitle}>Prendre rendez-vous</h2>
                <p className={styles.sectionText}>
                  Réservez directement un rendez-vous en ligne avec {fullName}.
                  Choisissez la date et l'horaire qui vous conviennent.
                </p>

                <button 
                  className={styles.primaryButton}
                  onClick={() => handleTakeAppointment(doctor)}
                >
                  <Calendar size={18} />
                  <span>Prendre rendez-vous</span>
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Modal prise de rendez-vous */}
      {selectedDoctor && step > 0 && (
        <div className={styles.appointmentOverlay}>
          <div className={styles.appointmentModal}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              ✕
            </button>

            <div className={styles.doctorHeaderCard}>
              <div className={styles.doctorHeaderAvatar}>
                {selectedDoctor.image ? (
                  <img
                    src={selectedDoctor.image}
                    alt={`${selectedDoctor.nom} ${selectedDoctor.prenom}`}
                  />
                ) : (
                  <span>{selectedDoctor.specialite?.iconName || '👨‍⚕️'}</span>
                )}
              </div>
              <div className={styles.doctorHeaderInfo}>
                <h3>Dr {selectedDoctor.nom} {selectedDoctor.prenom}</h3>
                <p className={styles.headerSpecialty}>{selectedDoctor.specialite?.title}</p>
                <p className={styles.headerLocation}><MapPin size={14} /> Oujda Principal Oujda</p>
              </div>
            </div>

            <h2>Prendre rendez-vous</h2>

            {/* Étape 1 */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <h3>Vos informations</h3>
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  
                  // Validation avancée
                  const errors = [];
                  
                  if (!patientForm.nom.trim()) errors.push('Le nom est obligatoire');
                  if (!patientForm.prenom.trim()) errors.push('Le prénom est obligatoire');
                  if (!patientForm.email.trim()) errors.push("L'email est obligatoire");
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
                  
                  setStep(2); 
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <label>Nom :
                      <input 
                        type="text" 
                        value={patientForm.nom} 
                        onChange={(e) => setPatientForm({ ...patientForm, nom: e.target.value })} 
                        required 
                      />
                    </label>
                    <label>Prénom :
                      <input 
                        type="text" 
                        value={patientForm.prenom} 
                        onChange={(e) => setPatientForm({ ...patientForm, prenom: e.target.value })} 
                        required 
                      />
                    </label>
                  </div>
                  
                  <label>Email :
                    <input 
                      type="email" 
                      value={patientForm.email} 
                      onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} 
                      required 
                    />
                  </label>
                  
                  <label>Téléphone :
                    <input 
                      type="tel" 
                      value={patientForm.telephone} 
                      onChange={(e) => setPatientForm({ ...patientForm, telephone: e.target.value })} 
                      required 
                    />
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <label>CIN :
                      <input 
                        type="text" 
                        value={patientForm.cin} 
                        onChange={(e) => setPatientForm({ ...patientForm, cin: e.target.value })}
                        required
                      />
                    </label>
                    <label>Mot de passe :
                      <input 
                        type="password" 
                        value={patientForm.mot_de_passe} 
                        onChange={(e) => setPatientForm({ ...patientForm, mot_de_passe: e.target.value })}
                        required
                        minLength="6"
                      />
                    </label>
                  </div>
                  
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '0.75rem', 
                    textAlign: 'center',
                    marginBottom: '1rem'
                  }}>
                    Tous les champs sont obligatoires. Mot de passe minimum 6 caractères.
                  </div>

                  <div className={styles.stepActions}>
                    <button type="button" onClick={handleCloseModal}>Annuler</button>
                    <button type="submit">Continuer</button>
                  </div>
                </form>
              </div>
            )}

            {/* Étape 2 */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.appointmentBody}>
                  <div className={styles.calendarHeader}>
                    <button type="button" onClick={goToPrevMonth}><ChevronLeft size={18} /></button>
                    <span>{frenchMonths[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                    <button type="button" onClick={goToNextMonth}><ChevronRight size={18} /></button>
                  </div>

                  <div className={styles.daysRow}>
                    {getWeekDays(selectedDate).map((d) => {
                      const isSelected = d.toDateString() === selectedDate.toDateString();
                      const isSunday = d.getDay() === 0;
                      const isPast = d < new Date(new Date().setHours(0,0,0,0));
                      return (
                        <button key={d.toISOString()} type="button"
                          className={`${styles.dayCard} ${isSelected ? styles.dayCardSelected : ''} ${isSunday || isPast ? styles.dayCardDisabled : ''}`}
                          onClick={() => { if(!isSunday && !isPast){ setSelectedDate(d); setSelectedSlot(''); } }}
                          disabled={isSunday || isPast}>
                          <span className={styles.dayName}>{frenchDays[d.getDay()]}</span>
                          <span className={styles.dayNumber}>{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>

                  {loadingSlots && (
                    <div style={{ textAlign: 'center', color: '#666', margin: '10px 0' }}>
                      Chargement des disponibilités...
                    </div>
                  )}

                  <div className={styles.slotsGrid}>
                    {getSlotsForDate(selectedDate).map(slot => {
                      const isOccupied = !isSlotAvailable(slot);
                      const isSelected = selectedSlot === slot;
                      
                      return (
                        <button 
                          key={slot} 
                          type="button"
                          className={`${styles.slotButton} ${
                            isSelected ? styles.slotButtonSelected : ''
                          } ${
                            isOccupied ? styles.slotButtonOccupied : ''
                          }`}
                          onClick={() => {
                            if (!isOccupied) {
                              setSelectedSlot(slot);
                            }
                          }}
                          disabled={isOccupied}
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

                  <div className={styles.stepActions}>
                    <button type="button" onClick={()=>setStep(1)}>⬅ Retour</button>
                    <button type="button" onClick={()=>{ 
                      if(!selectedSlot){
                        alert('Veuillez choisir un créneau');
                        return;
                      } 
                      setStep(3); 
                    }}>Continuer</button>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 */}
            {step === 3 && (
              <div className={styles.stepContent}>
                <h3>Confirmation du rendez-vous</h3>
                <p><strong>Docteur :</strong> {selectedDoctor.nom} {selectedDoctor.prenom}</p>
                <p><strong>Spécialité :</strong> {selectedDoctor.specialite?.title}</p>
                <p><strong>Patient :</strong> {patientForm.prenom} {patientForm.nom}</p>
                <p><strong>Email :</strong> {patientForm.email}</p>
                <p><strong>Téléphone :</strong> {patientForm.telephone}</p>
                <p><strong>CIN :</strong> {patientForm.cin}</p>
                <p><strong>Mot de passe :</strong> ••••••••</p>
                <p><strong>Date :</strong> {selectedDate.toLocaleDateString('fr-FR')}</p>
                <p><strong>Créneau :</strong> {selectedSlot}</p>

                <div className={styles.stepActions}>
                  <button type="button" onClick={()=>setStep(2)}>⬅ Modifier</button>
                  <button type="button" onClick={confirmAppointment}>
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
}