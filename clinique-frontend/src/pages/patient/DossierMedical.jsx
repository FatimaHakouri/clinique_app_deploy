// src/pages/patient/DossierMedical.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarP from "../../components/SidebarP";
import TopBar from "../../components/TopBar";
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, Calendar, User, Stethoscope, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

const PatientDossierMedical = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedConsultation, setExpandedConsultation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === 'patient') {
      fetchPatientData(user.email);
    }
  }, [user]);

  const fetchPatientData = async (email) => {
    try {
      const response = await fetch(`http://localhost:8080/api/patients/email/${email}`);
      if (response.ok) {
        const patientData = await response.json();
        setPatient(patientData);
        fetchConsultations(patientData.id);
      } else {
        setError("Patient non trouvé");
        setLoading(false);
      }
    } catch (error) {
      console.error("💥 Erreur lors du chargement du patient:", error);
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  const fetchConsultations = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/consultations/dossier-patient/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("📥 Données reçues de l'API:", data);
        
        if (data.consultations) {
          setConsultations(data.consultations);
        } else if (Array.isArray(data)) {
          setConsultations(data);
        } else {
          setConsultations([]);
        }
        setError(null);
      } else {
        setError("Impossible de charger les consultations");
      }
    } catch (error) {
      console.error("💥 Erreur lors du chargement des consultations:", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date non disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Erreur de formatage de date:", dateString);
      return "Date invalide";
    }
  };

  const toggleConsultation = (id) => {
    setExpandedConsultation(expandedConsultation === id ? null : id);
  };

  const downloadFile = async (filename) => {
    console.log(`🚀 Tentative de téléchargement: ${filename}`);
    
    try {
      // URL directe vers le fichier
      const fileUrl = `http://localhost:8080/uploads/${filename}`;
      
      // Méthode 1: Forcer le téléchargement via blob
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Récupérer le blob
      const blob = await response.blob();
      
      // Créer une URL pour le blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Créer un élément d'ancre
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Extraire le nom de fichier propre
      const cleanFilename = filename.split('/').pop(); // Enlever les chemins
      link.download = cleanFilename;
      
      // Simuler un clic
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      console.log(`✅ Téléchargement initié pour: ${cleanFilename}`);
      
    } catch (error) {
      console.error('💥 Erreur lors du téléchargement:', error);
      
      // Méthode 2: Ouvrir dans un nouvel onglet (fallback)
      const fileUrl = `http://localhost:8080/uploads/${filename}`;
      
      // Afficher une notification avec instructions
      const confirmed = window.confirm(
        `Le téléchargement automatique a échoué.\n\n` +
        `Voulez-vous ouvrir le fichier dans un nouvel onglet ?\n` +
        `Vous pourrez ensuite le sauvegarder avec Ctrl+S ou clic droit > "Enregistrer sous..."\n\n` +
        `Fichier: ${filename}`
      );
      
      if (confirmed) {
        window.open(fileUrl, '_blank');
      }
    }
  };

  // Redirection si pas patient
  useEffect(() => {
    if (user && user.role !== 'patient') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'patient') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calcul des statistiques avec gestion des erreurs
  const totalConsultations = consultations?.length || 0;
  const totalDocuments = consultations?.reduce((total, cons) => {
    return total + (cons.fichier?.length || 0);
  }, 0) || 0;
  
  const uniqueDoctors = new Set(consultations?.map(c => c.medecinId).filter(id => id)).size || 0;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full z-30">
        <SidebarP />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col ml-64">
        {/* TopBar */}
        <div className="fixed top-0 right-0 left-64 z-20">
          <TopBar />
        </div>

        {/* Contenu */}
        <div className="pt-16 p-6">
          <div className="max-w-6xl mx-auto">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white mb-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Mon Dossier Médical</h1>
                    <p className="text-blue-100">
                      Consultez votre historique médical et vos documents
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-200">Patient</p>
                  <p className="font-semibold">
                    {patient ? `${patient.prenom} ${patient.nom}` : user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <div className="flex items-center">
                  <AlertCircle className="text-red-500 mr-3" size={24} />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Chargement du dossier médical...</p>
              </div>
            ) : (
              <>
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Calendar className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Consultations</p>
                        <p className="text-xl font-bold text-gray-800">{totalConsultations}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <FileText className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Documents</p>
                        <p className="text-xl font-bold text-gray-800">{totalDocuments}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Stethoscope className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Médecins consultés</p>
                        <p className="text-xl font-bold text-gray-800">{uniqueDoctors}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste des consultations */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Historique des consultations</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Cliquez sur une consultation pour voir les détails
                    </p>
                  </div>

                  {!consultations || consultations.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Aucune consultation enregistrée
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Vous n'avez pas encore de consultation dans votre dossier médical.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {consultations.map((consultation) => (
                        <div key={consultation.id} className="hover:bg-gray-50 transition-colors">
                          <div 
                            className="p-4 cursor-pointer"
                            onClick={() => toggleConsultation(consultation.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Calendar size={18} className="text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-800">
                                    Consultation du {formatDate(consultation.dateConsultation)}
                                  </h3>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-sm text-gray-600 flex items-center">
                                      <User size={14} className="mr-1" />
                                      Dr. {consultation.medecinPrenom || ""} {consultation.medecinNom || ""}
                                    </span>
                                    {consultation.specialite && (
                                      <span className="text-sm text-blue-600 font-medium">
                                        {consultation.specialite}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                {consultation.fichier?.length > 0 && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {consultation.fichier.length} document(s)
                                  </span>
                                )}
                                <span className="text-gray-400">
                                  {expandedConsultation === consultation.id ? 
                                    <ChevronUp size={20} /> : 
                                    <ChevronDown size={20} />
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          {expandedConsultation === consultation.id && (
                            <div className="px-4 pb-4 pl-14">
                              <div className="space-y-4">
                                {/* Motif */}
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-2">Motif de consultation</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-800">
                                      {consultation.motif || "Non spécifié"}
                                    </p>
                                  </div>
                                </div>

                                {/* Traitement */}
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-2">Traitement prescrit</h4>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-gray-800 whitespace-pre-line">
                                      {consultation.traitement || "Aucun traitement prescrit"}
                                    </p>
                                  </div>
                                </div>

                                {/* Fichiers */}
                                {consultation.fichier && consultation.fichier.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Documents joints</h4>
                                    <div className="space-y-2">
                                      {consultation.fichier.map((fichier, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg">
                                          <div className="flex items-center">
                                            <FileText size={16} className="text-gray-500 mr-2" />
                                            <span className="text-gray-700 truncate max-w-xs">{fichier}</span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              downloadFile(fichier);
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center transition-colors duration-200 shadow-sm hover:shadow-md ml-4"
                                            title={`Télécharger ${fichier}`}
                                          >
                                            <Download size={16} className="mr-2" />
                                            Télécharger
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Informations générales */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                  <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="font-medium">{formatDate(consultation.dateConsultation)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Médecin</p>
                                    <p className="font-medium">
                                      Dr. {consultation.medecinPrenom || ""} {consultation.medecinNom || ""}
                                    </p>
                                  </div>
                                  {consultation.specialite && (
                                    <div>
                                      <p className="text-sm text-gray-600">Spécialité</p>
                                      <p className="font-medium">{consultation.specialite}</p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm text-gray-600">Référence</p>
                                    <p className="font-medium">
                                      CONS-{consultation.id?.toString().padStart(6, '0') || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note de bas de page */}
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <AlertCircle size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">Information importante</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        
                        <li> Votre dossier médical est confidentiel.</li>
                        <li> Seuls les médecins autorisés ont accès à vos informations.</li>
                        <li> Pour toute correction, contactez votre médecin traitant.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDossierMedical;