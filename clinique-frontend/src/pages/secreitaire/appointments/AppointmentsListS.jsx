import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AppointmentsListS() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // États pour les filtres
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showTable, setShowTable] = useState(false);

  // Charger les rendez-vous depuis l'API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔄 Chargement des rendez-vous depuis: http://localhost:8080/rendezvous');
        
        const response = await fetch('http://localhost:8080/rendezvous');
        
        console.log('📡 Statut de la réponse:', response.status);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Rendez-vous chargés:', data);
        
        const appointmentsArray = Array.isArray(data) ? data : [];
        setAppointments(appointmentsArray);
        setFilteredAppointments([]); // Cacher la liste au début
        
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError('Impossible de charger les rendez-vous. Vérifiez que le serveur Spring Boot est démarré.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Appliquer les filtres et le tri
  useEffect(() => {
    if (!selectedDoctor && !selectedSpecialty) {
      setFilteredAppointments([]);
      setShowTable(false);
      return;
    }

    let filtered = [...appointments];

    // Filtre par médecin
    if (selectedDoctor) {
      filtered = filtered.filter(appointment => 
        formatDoctor(appointment.medecin).nomComplet === selectedDoctor
      );
    }

    // Filtre par spécialité
    if (selectedSpecialty) {
      filtered = filtered.filter(appointment => 
        formatDoctor(appointment.medecin).specialite === selectedSpecialty
      );
    }

    // Tri par date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredAppointments(filtered);
    setShowTable(true);
  }, [appointments, selectedDoctor, selectedSpecialty, sortOrder]);

  // Fonction pour naviguer vers l'ajout
  const handleAddAppointment = () => {
    navigate('/secretaire/dashboard/appointments/add');
  };

  // Fonction pour annuler un rendez-vous
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/rendezvous/${appointmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAppointments(prev => prev.filter(app => app.id !== appointmentId));
        console.log('✅ Rendez-vous annulé');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('❌ Erreur annulation:', err);
      alert('Erreur lors de l\'annulation du rendez-vous');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  };

  // Fonction pour formater le médecin (avec User)
  const formatDoctor = (medecin) => {
    if (!medecin || typeof medecin !== 'object') {
      return { nomComplet: 'Médecin inconnu', specialite: 'Généraliste' };
    }
    
    let nomComplet = 'Médecin inconnu';
    let specialite = 'Généraliste';
    
    if (medecin.user) {
      const prenom = medecin.user.prenom || '';
      const nom = medecin.user.nom || '';
      nomComplet = `Dr. ${prenom} ${nom}`.trim();
    } else if (medecin.prenom || medecin.nom) {
      const prenom = medecin.prenom || '';
      const nom = medecin.nom || '';
      nomComplet = `Dr. ${prenom} ${nom}`.trim();
    }
    
    if (medecin.specialite) {
      if (typeof medecin.specialite === 'object') {
        specialite = medecin.specialite.title || medecin.specialite.nom || 'Généraliste';
      } else {
        specialite = medecin.specialite;
      }
    }
    
    return { nomComplet, specialite };
  };

  // Fonction pour formater le patient
  const formatPatient = (patient) => {
    if (!patient || typeof patient !== 'object') {
      return { nomComplet: 'Patient inconnu', cin: 'N/A' };
    }
    
    const prenom = patient.prenom || '';
    const nom = patient.nom || '';
    const cin = patient.cin || '';
    
    return {
      nomComplet: `${prenom} ${nom}`.trim() || 'Patient inconnu',
      cin: cin || 'N/A'
    };
  };

  // Obtenir la liste unique des médecins
  const getUniqueDoctors = () => {
    const doctors = appointments.map(appointment => formatDoctor(appointment.medecin).nomComplet);
    return [...new Set(doctors)].sort();
  };

  // Obtenir la liste unique des spécialités
  const getUniqueSpecialties = () => {
    const specialties = appointments.map(appointment => formatDoctor(appointment.medecin).specialite);
    return [...new Set(specialties)].sort();
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedDoctor('');
    setSelectedSpecialty('');
    setSortOrder('asc');
    setShowTable(false);
    setFilteredAppointments([]);
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gestion des Rendez-vous
          </h2>
         
        </div>
        
        <button
          onClick={handleAddAppointment}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouveau Rendez-vous
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold mb-2">Problème de connexion</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRE DE FILTRES */}
       <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtres de recherche
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Filtre par médecin */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Médecin
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Sélectionner un médecin</option>
              {getUniqueDoctors().map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par spécialité */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
              </svg>
              Spécialité
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="">Sélectionner une spécialité</option>
              {getUniqueSpecialties().map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Tri par date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
              Tri par date
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="asc">Plus ancien d'abord</option>
              <option value="desc">Plus récent d'abord</option>
            </select>
          </div>

          {/* Bouton réinitialiser */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-all duration-200 flex items-center justify-center transform hover:-translate-y-0.5"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Indicateurs de filtres actifs */}
        {(selectedDoctor || selectedSpecialty) && (
          <div className="mt-3 flex flex-wrap gap-1">
            {selectedDoctor && (
              <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Médecin: {selectedDoctor}
                <button
                  onClick={() => setSelectedDoctor('')}
                  className="ml-1 text-blue-600 hover:text-blue-800 transition-colors text-xs"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSpecialty && (
              <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Spécialité: {selectedSpecialty}
                <button
                  onClick={() => setSelectedSpecialty('')}
                  className="ml-1 text-green-600 hover:text-green-800 transition-colors text-xs"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tableau des rendez-vous - AFFICHAGE CONDITIONNEL */}
      {showTable && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* En-tête du tableau */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Résultats ({filteredAppointments.length} rendez-vous)
              </h3>
              <div className="text-blue-100 text-sm">
                Médecin: {selectedDoctor || 'Tous'} | Spécialité: {selectedSpecialty || 'Toutes'}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-56"> {/* Curseur dynamique avec hauteur fixe */}
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Médecin & Spécialité</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Horaire</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((appointment) => (
                  <tr 
                    key={appointment.id} 
                    className="hover:bg-blue-50 transition-colors duration-150 group"
                  >
                    {/* Patient */}
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatPatient(appointment.patient).nomComplet}
                          </div>
                          <div className="text-sm text-gray-500">
                            CIN: {formatPatient(appointment.patient).cin}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Médecin & Spécialité */}
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDoctor(appointment.medecin).nomComplet}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {formatDoctor(appointment.medecin).specialite}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4">
                      <div className="text-gray-900 font-medium">
                        {formatDate(appointment.date)}
                      </div>
                    </td>

                    {/* Horaire */}
                    <td className="p-4">
                      <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium group-hover:bg-blue-200 transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {appointment.slot}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/secretaire/dashboard/appointments/edit/${appointment.id}`}
                          className="inline-flex items-center p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="inline-flex items-center p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Message si aucun résultat après filtrage */}
          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous trouvé</h3>
              <p className="text-gray-600 mb-4">
                Aucun rendez-vous ne correspond à vos critères de recherche.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Modifier les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {/* Message d'instructions */}
      {!showTable && appointments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Rechercher des rendez-vous</h3>
          <p className="text-blue-700 mb-4">
            Utilisez les filtres ci-dessus pour afficher les rendez-vous par médecin ou spécialité.
          </p>
          <div className="text-sm text-blue-600">
            {appointments.length} rendez-vous disponibles dans la base de données
          </div>
        </div>
      )}
    </div>
  );
}