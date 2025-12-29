import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditAppointmentS = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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

  // Fonction sécurisée pour formater les données patient
  const formatPatient = (patient) => {
    if (!patient || typeof patient !== 'object') return 'Patient inconnu';
    return `${patient.nom || ''} ${patient.prenom || ''} - ${patient.cin || 'N/A'}`.trim();
  };

  // Fonction sécurisée pour formater les données médecin
  const formatDoctor = (doctor) => {
    if (!doctor || typeof doctor !== 'object') return 'Médecin inconnu';
    
    let nomComplet = 'Médecin inconnu';
    let specialite = 'Généraliste';
    
    // Gérer le nom (depuis user ou directement)
    if (doctor.user) {
      const prenom = doctor.user.prenom || '';
      const nom = doctor.user.nom || '';
      nomComplet = `Dr. ${prenom} ${nom}`.trim();
    } else if (doctor.prenom || doctor.nom) {
      const prenom = doctor.prenom || '';
      const nom = doctor.nom || '';
      nomComplet = `Dr. ${prenom} ${nom}`.trim();
    }
    
    // Gérer la spécialité
    if (doctor.specialite) {
      if (typeof doctor.specialite === 'object') {
        specialite = doctor.specialite.title || doctor.specialite.nom || 'Généraliste';
      } else {
        specialite = doctor.specialite;
      }
    }
    
    return `${nomComplet} - ${specialite}`;
  };

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        console.log('🔄 Chargement des données pour le rendez-vous:', id);

        // Charger les patients, médecins et rendez-vous en parallèle
        const [patientsResponse, doctorsResponse, appointmentResponse] = await Promise.all([
          fetch('http://localhost:8080/api/patients'),
          fetch('http://localhost:8080/api/medecins'),
          fetch(`http://localhost:8080/rendezvous/${id}`)
        ]);

        // Vérifier les réponses
        if (!patientsResponse.ok) throw new Error('Erreur chargement patients');
        if (!doctorsResponse.ok) throw new Error('Erreur chargement médecins');
        if (!appointmentResponse.ok) {
          if (appointmentResponse.status === 404) {
            throw new Error('Rendez-vous non trouvé');
          } else {
            throw new Error(`Erreur serveur: ${appointmentResponse.status}`);
          }
        }

        const [patientsData, doctorsData, appointmentData] = await Promise.all([
          patientsResponse.json(),
          doctorsResponse.json(),
          appointmentResponse.json()
        ]);

        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);

        console.log('✅ Rendez-vous chargé:', appointmentData);

        // Formater la date pour l'input (convertir LocalDate en format YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          // Si la date est déjà au format YYYY-MM-DD, la retourner directement
          if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
          }
          // Si c'est un tableau [année, mois, jour], le formater
          if (Array.isArray(dateString)) {
            const [year, month, day] = dateString;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
          return dateString;
        };

        setForm({
          patientId: appointmentData.patient?.id?.toString() || '',
          doctorId: appointmentData.medecin?.id?.toString() || '',
          date: formatDateForInput(appointmentData.date) || '',
          slot: appointmentData.slot || ''
        });

      } catch (err) {
        console.error('❌ Erreur chargement données:', err);
        setError('Erreur de chargement: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadInitialData();
    }
  }, [id]);

  // Charger les créneaux occupés
  useEffect(() => {
    const loadOccupiedSlots = async () => {
      if (!form.doctorId || !form.date) {
        setOccupiedSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const url = `http://localhost:8080/rendezvous/occupied-slots/${form.doctorId}/${form.date}`;
        console.log('🔄 Chargement créneaux occupés:', url);
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          setOccupiedSlots(Array.isArray(data) ? data : []);
          console.log('✅ Créneaux occupés:', data);
        } else {
          console.error('❌ Erreur réponse créneaux:', response.status);
          setOccupiedSlots([]);
        }
      } catch (err) {
        console.error('❌ Erreur chargement créneaux:', err);
        setOccupiedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    // Délai pour éviter les appais trop rapides
    const timer = setTimeout(() => {
      loadOccupiedSlots();
    }, 300);

    return () => clearTimeout(timer);
  }, [form.doctorId, form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value,
      ...((name === 'doctorId' || name === 'date') && { slot: '' })
    }));
  };

  const handleTimeSlotSelect = (slot) => {
    setForm(prev => ({ ...prev, slot }));
    setShowTimeSlots(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!form.patientId || !form.doctorId || !form.date || !form.slot) {
      setError('Veuillez remplir tous les champs obligatoires.');
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

      console.log('📤 Mise à jour du rendez-vous:', requestBody);

      const response = await fetch(`http://localhost:8080/rendezvous/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur lors de la mise à jour');
      }

      console.log('✅ Rendez-vous modifié avec succès');
      setSuccess(true);
      setTimeout(() => {
        navigate('/secretaire/dashboard/appointments');
      }, 1500);

    } catch (err) {
      console.error('❌ Erreur modification RDV:', err);
      setError('Erreur lors de la modification: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isSlotOccupied = (slot) => {
    return Array.isArray(occupiedSlots) && occupiedSlots.includes(slot);
  };

  const isFormValid = form.patientId && form.doctorId && form.date && form.slot;

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Fonction pour vérifier si un créneau est disponible
  const isSlotAvailable = (slot) => {
    // Si c'est le créneau actuellement sélectionné, il est disponible
    if (form.slot === slot) return true;
    // Sinon, vérifier s'il n'est pas occupé
    return !isSlotOccupied(slot);
  };

  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du rendez-vous...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-green-800 font-semibold">Opération réussie !</p>
                <p className="text-green-700 text-sm mt-1">Redirection en cours...</p>
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
                <p className="text-red-800 font-semibold">Erreur</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* En-tête de la carte - Style amélioré */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/secretaire/dashboard/appointments')}
                  className="mr-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier le Rendez-vous
                  </h3>
                </div>
              </div>
              
              {/* Bouton Modifier dans l'en-tête */}
              
            </div>
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
                    {patients.map((patient) => (
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
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {formatDoctor(doctor)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Colonne droite - Date et heure */}
              <div className="space-y-6">
                {/* Date */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date du rendez-vous *
                  </label>
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

                {/* Créneau horaire */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Créneau horaire *
                  </label>
                  
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
                      {loadingSlots ? 'Chargement des créneaux...' : `${occupiedSlots.length} créneau(x) réservé(s)`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons d'action - Style compact */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
              {/* Bouton Retour */}
              <button
                type="button"
                onClick={() => navigate('/secretaire/dashboard/appointments')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour
              </button>

              {/* Bouton Modifier */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center shadow-lg ${
                  !isFormValid || isLoading
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Modification...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Modifier le Rendez-vous</span>
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
                  {form.date} • {occupiedSlots.length} créneau(x) réservé(s)
                </p>
              </div>

              <div className="p-6 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => {
                    const occupied = isSlotOccupied(slot);
                    const isSelected = form.slot === slot;
                    const isAvailable = isSlotAvailable(slot);
                    
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => isAvailable && handleTimeSlotSelect(slot)}
                        disabled={!isAvailable}
                        className={`p-4 rounded-xl text-center transition-all duration-200 font-medium ${
                          !isAvailable
                            ? 'bg-red-50 text-red-400 cursor-not-allowed border-2 border-red-200'
                            : isSelected
                            ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-600'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-400 border-2 border-blue-200'
                        }`}
                      >
                        <div className="font-semibold">{slot}</div>
                        {occupied && !isSelected && (
                          <div className="text-xs mt-1 text-red-500">Occupé</div>
                        )}
                        {isSelected && (
                          <div className="text-xs mt-1 text-blue-200">Sélectionné</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setShowTimeSlots(false)}
                  className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditAppointmentS;