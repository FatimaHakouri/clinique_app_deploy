import React, { useState, useEffect } from 'react';
import { createAppointment } from "../../../services/rendezVousService";

const PlanifierRendezVousS = () => {
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    slot: ''
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Créneaux horaires disponibles
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  // Fonction sécurisée pour obtenir le titre de la spécialité
  const getSpecialiteTitle = (specialite) => {
    if (!specialite) return 'Généraliste';
    if (typeof specialite === 'object') {
      return specialite.title || specialite.nom || specialite.name || 'Généraliste';
    }
    if (typeof specialite === 'string') {
      return specialite;
    }
    return 'Généraliste';
  };

  // Fonction sécurisée pour formater les données patient
  const formatPatient = (patient) => {
    if (!patient || typeof patient !== 'object') return 'Patient inconnu';
    return `${patient.nom || ''} ${patient.prenom || ''} - ${patient.cin || 'N/A'}`.trim();
  };

  // Fonction sécurisée pour formater les données médecin
  const formatDoctor = (doctor) => {
    if (!doctor || typeof doctor !== 'object') return 'Médecin inconnu';
    const nom = doctor.nom || '';
    const prenom = doctor.prenom || '';
    const specialite = getSpecialiteTitle(doctor.specialite);
    return `Dr. ${nom} ${prenom} - ${specialite}`.trim();
  };

  useEffect(() => {
    // Charger la liste des patients
    const loadPatients = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/patients');
        if (!response.ok) throw new Error('Erreur réseau patients');
        const data = await response.json();
        console.log('👥 Patients reçus:', data);
        setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Erreur patients:', err);
        setError('Erreur de chargement des patients: ' + err.message);
      }
    };

    // Charger la liste des médecins
    const loadDoctors = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/medecins');
        if (!response.ok) throw new Error('Erreur réseau médecins');
        const data = await response.json();
        console.log('👨‍⚕️ Médecins reçus:', data);
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Erreur médecins:', err);
        setError('Erreur de chargement des médecins: ' + err.message);
      }
    };

    loadPatients();
    loadDoctors();
  }, []);

  useEffect(() => {
    const loadOccupiedSlots = async () => {
      if (!form.doctorId || !form.date) {
        console.log('⏸️ Conditions non remplies pour créneaux');
        setOccupiedSlots([]);
        setLoadingSlots(false);
        return;
      }

      console.log('🔄 Chargement créneaux pour médecin:', form.doctorId, 'date:', form.date);
      setLoadingSlots(true);
      setError('');

      try {
        // URL CORRIGÉE : sans /api
        const url = `http://localhost:8080/rendezvous/occupied-slots/${form.doctorId}/${form.date}`;
        console.log('🌐 Appel API:', url);

        const response = await fetch(url);
        console.log('📡 Réponse - Status:', response.status, 'OK:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Créneaux occupés reçus:', data);
        
        if (Array.isArray(data)) {
          console.log(`📊 ${data.length} créneau(x) occupé(s) trouvé(s)`);
          setOccupiedSlots(data);
        } else {
          console.warn('⚠️ Les données ne sont pas un array:', data);
          setOccupiedSlots([]);
        }

      } catch (err) {
        console.error('❌ Erreur chargement créneaux:', err);
        
        // Fallback avec IP directe
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          console.log('🔄 Tentative avec IP directe...');
          try {
            const fallbackUrl = `http://127.0.0.1:8080/rendezvous/occupied-slots/${form.doctorId}/${form.date}`;
            const fallbackResponse = await fetch(fallbackUrl);
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setOccupiedSlots(Array.isArray(fallbackData) ? fallbackData : []);
              console.log('✅ Fallback réussi avec IP directe');
              return;
            }
          } catch (fallbackError) {
            console.error('❌ Fallback échoué:', fallbackError);
          }
        }

        setError('Erreur de chargement des créneaux occupés: ' + err.message);
        setOccupiedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadOccupiedSlots();
  }, [form.doctorId, form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Changement ${name}:`, value);
    
    setForm(prev => ({ 
      ...prev, 
      [name]: value,
      ...((name === 'doctorId' || name === 'date') && { slot: '' })
    }));
  };

  const handleTimeSlotSelect = (slot) => {
    if (!isSlotOccupied(slot)) {
      setForm(prev => ({ ...prev, slot }));
      setShowTimeSlots(false);
      setError('');
    } else {
      setError('Ce créneau est déjà réservé. Veuillez en choisir un autre.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation finale
    if (!form.patientId || !form.doctorId || !form.date || !form.slot) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setIsLoading(false);
      return;
    }

    if (isSlotOccupied(form.slot)) {
      setError('Ce créneau a été réservé entre-temps. Veuillez choisir un autre créneau.');
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        patientId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
        date: form.date,
        slot: form.slot
      };

      console.log('📤 Envoi des données:', requestBody);

      const response = await createAppointment(requestBody);
      
      console.log('✅ Rendez-vous créé avec succès:', response);
      
      setSuccess(true);
      setForm({ patientId: '', doctorId: '', date: '', slot: '' });
      setOccupiedSlots([]);
      
      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      console.error('❌ Erreur création RDV:', err);
      
      let errorMessage = 'Erreur lors de la planification: ';
      
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage += `
          Impossible de se connecter au serveur. 
          Vérifiez que:
          1. Le serveur Spring Boot est démarré sur le port 8080
          2. L'URL http://localhost:8080 est accessible
          3. Il n'y a pas de problème de firewall ou antivirus
        `;
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += err.message || 'Erreur inconnue';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isSlotOccupied = (slot) => {
    const normalizedSlot = slot.trim();
    const isOccupied = Array.isArray(occupiedSlots) && 
                      occupiedSlots.some(occupiedSlot => 
                        occupiedSlot.trim() === normalizedSlot
                      );
    return isOccupied;
  };

  const isFormValid = form.patientId && form.doctorId && form.date && form.slot && !isSlotOccupied(form.slot);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Fonction pour obtenir les dates des 7 prochains jours
  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      dates.push(formattedDate);
    }
    return dates;
  };

  const weekDates = getNextWeekDates();
  
  // Noms des jours en français
  const weekDays = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

  return (
    <div className="min-h-fit bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Messages d'alerte */}
        {success && (
          <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm transition-all duration-300">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-green-800 font-semibold">Rendez-vous planifié avec succès !</p>
                <p className="text-green-700 text-sm mt-1">Le patient a été notifié et le créneau est maintenant réservé.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm transition-all duration-300">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-red-800 font-semibold">Erreur de planification</p>
                <p className="text-red-700 text-sm mt-1 whitespace-pre-line">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* En-tête de la carte */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nouveau Rendez-vous
            </h3>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Colonne gauche - Informations de base */}
              <div className="space-y-6">
                {/* Sélection du patient */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Patient *
                  </label>
                  <select
                    name="patientId"
                    value={form.patientId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                    required
                  >
                    <option value="">Choisir un patient...</option>
                    {Array.isArray(patients) && patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {formatPatient(patient)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sélection du médecin */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Médecin *
                  </label>
                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                    required
                  >
                    <option value="">Choisir un médecin...</option>
                    {Array.isArray(doctors) && doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {formatDoctor(doctor)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Colonne droite - Date et heure */}
              <div className="space-y-6">
                {/* Calendrier rapide */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date du rendez-vous *
                  </label>
                  
                  {/* Sélecteur de date rapide */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Dates disponibles cette semaine :</p>
                    <div className="grid grid-cols-7 gap-1">
                      {weekDates.map((date, index) => {
                        const dayNumber = new Date(date).getDate();
                        const isSelected = form.date === date;
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, date, slot: '' }))}
                            className={`p-2 rounded-lg text-center transition-all duration-200 ${
                              isSelected 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                            }`}
                          >
                            <div className="text-xs font-medium">{weekDays[index]}</div>
                            <div className="text-sm font-semibold">{dayNumber}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sélecteur de date classique */}
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    min={getTodayDate()}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                    required
                  />
                </div>

                {/* Sélecteur de créneau amélioré */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Créneau horaire *
                  </label>
                  
                  {/* Bouton pour ouvrir la modale des créneaux */}
                  <button
                    type="button"
                    onClick={() => setShowTimeSlots(true)}
                    disabled={!form.doctorId || !form.date}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-left transition-all duration-200 flex justify-between items-center ${
                      !form.doctorId || !form.date
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : form.slot
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-500'
                    }`}
                  >
                    <span>{form.slot || 'Choisir un créneau...'}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {form.doctorId && form.date && (
                    <p className="text-xs text-gray-500 mt-2">
                      {loadingSlots ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-3 w-3 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Chargement des créneaux...
                        </span>
                      ) : (
                        `${occupiedSlots.length} créneau(x) réservé(s) • ${timeSlots.length - occupiedSlots.length} disponible(s)`
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center shadow-lg ${
                  !isFormValid || isLoading
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Planification en cours...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confirmer le Rendez-vous</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Modale des créneaux horaires */}
        {showTimeSlots && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden">
              {/* En-tête de la modale */}
              <div className="bg-blue-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Choisir un créneau</h3>
                  <button
                    onClick={() => setShowTimeSlots(false)}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-blue-100 text-sm mt-1">
                  {form.date} • {loadingSlots ? 'Chargement...' : `${occupiedSlots.length} créneau(x) réservé(s)`}
                </p>
              </div>

              {/* Grille des créneaux */}
              <div className="p-6 max-h-64 overflow-y-auto">
                {loadingSlots ? (
                  <div className="p-4 text-center text-gray-500">
                    <svg className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Chargement des créneaux...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((slot) => {
                      const occupied = isSlotOccupied(slot);
                      const isSelected = form.slot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleTimeSlotSelect(slot)}
                          disabled={occupied}
                          className={`p-4 rounded-xl text-center transition-all duration-200 font-medium ${
                            occupied
                              ? 'bg-red-50 text-red-400 cursor-not-allowed border-2 border-red-200'
                              : isSelected
                              ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-600'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 border-2 border-blue-200'
                          }`}
                        >
                          <div className="font-semibold">{slot}</div>
                          {occupied && (
                            <div className="text-xs mt-1 text-red-500 flex items-center justify-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Occupé
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanifierRendezVousS;