// src/pages/patient/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../../components/StatCard";
import { User, CalendarDays, FileText, Clock, Stethoscope, Activity, AlertCircle } from "lucide-react";
import SidebarP from "../../components/SidebarP";
import TopBar from "../../components/TopBar";
import { useAuth } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [rendezVous, setRendezVous] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({
    totalConsultations: 0,
    rendezVousProchains: 0,
    totalDocuments: 0,
    consultationsMois: 0,
    differentDoctors: 0,
    specialitesUniques: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === 'patient') {
      console.log("👤 User:", user);
      fetchPatientData(user.email);
    }
  }, [user]);

  const fetchPatientData = async (email) => {
    try {
      console.log("🔍 Fetching patient data for email:", email);
      const response = await fetch(`http://localhost:8080/api/patients/email/${email}`);
      if (response.ok) {
        const patientData = await response.json();
        console.log("✅ Patient data:", patientData);
        setPatient(patientData);
        // Charger les données en parallèle
        await Promise.all([
          fetchRendezVous(patientData.id),
          fetchConsultations(patientData.id)
        ]);
      } else {
        setError("Patient non trouvé");
        setLoading(false);
      }
    } catch (error) {
      console.error("💥 Error loading patient:", error);
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  };

  const fetchRendezVous = async (patientId) => {
    try {
      console.log("🔄 Fetching rendez-vous for patient ID:", patientId);
      const response = await fetch(`http://localhost:8080/rendezvous/patient/${patientId}`);
      
      if (response.ok) {
        const rdvData = await response.json();
        console.log("✅ Rendez-vous data received:", rdvData.length, "items");
        setRendezVous(rdvData);
        
        // Calcul des rendez-vous à venir
        const aujourdHui = new Date();
        const prochains = rdvData.filter(rdv => {
          try {
            const dateRdv = new Date(rdv.date);
            return dateRdv >= aujourdHui;
          } catch (e) {
            return false;
          }
        }).length;

        setStats(prev => ({
          ...prev,
          rendezVousProchains: prochains
        }));
      } else {
        console.warn("⚠️ Aucun rendez-vous trouvé ou erreur API");
      }
    } catch (error) {
      console.error("💥 Fetch error:", error);
    }
  };

  const fetchConsultations = async (patientId) => {
    try {
      console.log("📋 Fetching consultations for patient ID:", patientId);
      const response = await fetch(`http://localhost:8080/api/consultations/dossier-patient/${patientId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Données consultations brutes:", data);
        
        let consultationsData = [];
        if (data.consultations) {
          consultationsData = data.consultations;
        } else if (Array.isArray(data)) {
          consultationsData = data;
        } else if (data && typeof data === 'object') {
          // Si c'est un objet avec des propriétés de consultation
          consultationsData = Object.values(data).filter(item => 
            item && typeof item === 'object' && item.dateConsultation
          );
        }
        
        console.log("✅ Consultations traitées:", consultationsData.length, "items");
        setConsultations(consultationsData);
        
        if (consultationsData.length > 0) {
          calculateStatistics(consultationsData);
          prepareChartData(consultationsData);
        } else {
          // Données par défaut quand il n'y a pas de consultations
          setDefaultChartData();
        }
      } else {
        console.warn("⚠️ Aucune consultation trouvée ou erreur API");
        setDefaultChartData();
      }
    } catch (error) {
      console.error("💥 Error fetching consultations:", error);
      setDefaultChartData();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultChartData = () => {
    // Données par défaut pour les graphiques
    const defaultChartData = [
      { name: "Jan", consultations: 0 },
      { name: "Fév", consultations: 0 },
      { name: "Mar", consultations: 0 },
      { name: "Avr", consultations: 0 },
      { name: "Mai", consultations: 0 },
      { name: "Jun", consultations: 0 },
    ];
    
    setChartData(defaultChartData);
  };

  const calculateStatistics = (consultationsData) => {
    const aujourdHui = new Date();
    const debutMois = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1);

    // Calcul des consultations ce mois
    const consultationsMois = consultationsData.filter(consultation => {
      if (!consultation.dateConsultation) return false;
      try {
        const dateConsultation = new Date(consultation.dateConsultation);
        return dateConsultation >= debutMois && dateConsultation <= aujourdHui;
      } catch (e) {
        return false;
      }
    }).length;

    // Calcul des documents totaux
    const totalDocuments = consultationsData.reduce((total, consultation) => {
      return total + (Array.isArray(consultation.fichier) ? consultation.fichier.length : 0);
    }, 0);

    // Calcul des médecins différents
    const medecinsIds = consultationsData
      .map(c => c.medecinId)
      .filter(id => id && id !== null && id !== undefined);
    const differentDoctors = new Set(medecinsIds).size;

    // Calcul des spécialités différentes
    const specialites = consultationsData
      .map(c => c.specialite)
      .filter(s => s && s.trim() !== '');
    const specialitesUniques = new Set(specialites).size;

    console.log("📈 Statistiques calculées:", {
      total: consultationsData.length,
      mois: consultationsMois,
      documents: totalDocuments,
      medecins: differentDoctors,
      specialites: specialitesUniques
    });

    setStats(prev => ({
      ...prev,
      totalConsultations: consultationsData.length,
      totalDocuments,
      consultationsMois,
      differentDoctors,
      specialitesUniques
    }));
  };

  const prepareChartData = (consultationsData) => {
    // Grouper par mois pour les 6 derniers mois
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const aujourdHui = new Date();
    const sixMoisData = [];
    
    // Initialiser les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(aujourdHui.getFullYear(), aujourdHui.getMonth() - i, 1);
      const moisKey = `${date.getFullYear()}-${date.getMonth()}`;
      sixMoisData.push({
        moisKey,
        name: mois[date.getMonth()],
        consultations: 0,
        fullName: mois[date.getMonth()] + ' ' + date.getFullYear()
      });
    }

    // Compter les consultations par mois
    consultationsData.forEach(consultation => {
      if (!consultation.dateConsultation) return;
      
      try {
        const dateConsultation = new Date(consultation.dateConsultation);
        const moisKey = `${dateConsultation.getFullYear()}-${dateConsultation.getMonth()}`;
        
        const moisData = sixMoisData.find(item => item.moisKey === moisKey);
        if (moisData) {
          moisData.consultations += 1;
        }
      } catch (e) {
        console.warn("⚠️ Date invalide pour le graphique:", consultation.dateConsultation);
      }
    });

    // Formater pour le graphique
    const formattedData = sixMoisData.map(item => ({
      name: item.name,
      consultations: item.consultations,
      fullName: item.fullName
    }));

    console.log("📊 Données graphique:", formattedData);
    setChartData(formattedData);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return "";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
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
      return "";
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

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="fixed left-0 top-0 h-full z-30 w-64">
          <SidebarP />
        </div>
        <div className="flex-1 flex flex-col ml-64">
          <div className="fixed top-0 right-0 left-64 z-20">
            <TopBar />
          </div>
          <div className="pt-16 p-6 flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Chargement de votre tableau de bord...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar Patient */}
      <div className="fixed left-0 top-0 h-full z-30 w-64">
        <SidebarP />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col ml-64">
        <div className="fixed top-0 right-0 left-64 z-20">
          <TopBar />
        </div>

        <main className="pt-16 p-6 space-y-6">
          {/* En-tête personnalisé */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Bienvenue, {patient ? `${patient.prenom} ${patient.nom}` : user.email}
                </h1>
                <p className="text-blue-100">
                  Votre espace santé personnel - Gérez vos rendez-vous et consultations
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Dernière connexion</p>
                <p className="font-semibold">Aujourd'hui</p>
              </div>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-3" size={24} />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Consultations Totales"
              value={stats.totalConsultations.toString()}
              subtitle={`${stats.consultationsMois} ce mois`}
              icon={<FileText size={24} />}
              color="blue"
            />
            <StatCard
              title="Rendez-vous à Venir"
              value={stats.rendezVousProchains.toString()}
              subtitle="Prochainement"
              icon={<CalendarDays size={24} />}
              color="green"
            />
            <StatCard
              title="Documents Médicaux"
              value={stats.totalDocuments.toString()}
              subtitle="Fichiers accessibles"
              icon={<Activity size={24} />}
              color="purple"
            />
            <StatCard
              title="Médecins Consultés"
              value={stats.differentDoctors.toString()}
              subtitle={`${stats.specialitesUniques} spécialités`}
              icon={<Stethoscope size={24} />}
              color="teal"
            />
          </div>

          {/* Graphique des consultations */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  Activité des 6 derniers mois
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Évolution de vos consultations médicales
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-800">
                  {chartData.reduce((sum, item) => sum + item.consultations, 0)} consultations
                </p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} consultation(s)`, "Nombre"]}
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.name === label);
                      return item?.fullName || label;
                    }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Bar 
                    dataKey="consultations" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    name="Consultations"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dernières consultations et prochains rendez-vous */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dernières consultations */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Dernières consultations
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Vos consultations médicales récentes
                  </p>
                </div>
                {consultations.length > 0 && (
                  <button 
                    onClick={() => navigate('/patient/dossier-medical')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center"
                  >
                    Voir tout le dossier
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {consultations.slice(0, 4).map((consultation, index) => (
                  <div key={consultation.id || index} className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors hover:shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-2">
                          {consultation.motif ? 
                            (consultation.motif.length > 70 ? consultation.motif.substring(0, 70) + '...' : consultation.motif) 
                            : "Consultation générale"}
                        </p>
                        <div className="flex items-center flex-wrap gap-2 mt-2">
                          <span className="text-sm text-gray-600 flex items-center">
                            <User size={14} className="mr-2" />
                            Dr. {consultation.medecinPrenom || ""} {consultation.medecinNom || ""}
                          </span>
                          {consultation.specialite && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {consultation.specialite}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-gray-500">
                            {formatDateTime(consultation.dateConsultation)}
                          </p>
                          {consultation.fichier?.length > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              {consultation.fichier.length} document(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {consultations.length === 0 && (
                  <div className="text-center py-10">
                    <FileText size={56} className="text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                      Aucune consultation enregistrée
                    </h4>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Vous n'avez pas encore de consultation médicale dans votre dossier.
                    </p>
                    <button
                      onClick={() => window.open('/medecins', '_blank')}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Prendre un premier rendez-vous
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Prochains rendez-vous */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Prochains Rendez-vous
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Vos rendez-vous médicaux programmés
                  </p>
                </div>
                {rendezVous.filter(rdv => new Date(rdv.date) >= new Date()).length > 0 && (
                  <button 
                    onClick={() => navigate('/patient/rendezvous')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center"
                  >
                    Voir l'agenda complet
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {rendezVous
                  .filter(rdv => {
                    try {
                      return new Date(rdv.date) >= new Date();
                    } catch (e) {
                      return false;
                    }
                  })
                  .slice(0, 4)
                  .map((rdv) => (
                    <div key={rdv.id} className="p-4 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-semibold text-green-800">
                              Dr. {rdv.medecin?.user?.prenom || ""} {rdv.medecin?.user?.nom || "Médecin"}
                            </p>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              new Date(rdv.date).toDateString() === new Date().toDateString() 
                                ? "bg-orange-100 text-orange-800" 
                                : "bg-green-100 text-green-800"
                            }`}>
                              {new Date(rdv.date).toDateString() === new Date().toDateString() 
                                ? "Aujourd'hui" 
                                : "À venir"}
                            </span>
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 mb-3">
                            <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                              {formatDate(rdv.date)}
                            </span>
                            <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                              {rdv.slot || "Heure non précisée"}
                            </span>
                            {rdv.medecin?.specialite?.title && (
                              <span className="text-xs bg-green-200 text-green-900 px-2 py-1 rounded-full">
                                {rdv.medecin.specialite.title}
                              </span>
                            )}
                          </div>
                          
                          {rdv.motif && (
                            <p className="text-sm text-gray-600 mt-2 border-t border-green-200 pt-2">
                              <strong>Motif :</strong> {rdv.motif.length > 80 ? rdv.motif.substring(0, 80) + '...' : rdv.motif}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                {rendezVous.filter(rdv => new Date(rdv.date) >= new Date()).length === 0 && (
                  <div className="text-center py-10">
                    <CalendarDays size={56} className="text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                      Aucun rendez-vous à venir
                    </h4>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Vous n'avez pas de rendez-vous médical programmé pour le moment.
                    </p>
                    <button
                      onClick={() => window.open('/medecins', '_blank')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Prendre un rendez-vous
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations personnelles et résumé */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations personnelles */}
            <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Mes Informations Personnelles
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Vos coordonnées et informations de contact
                  </p>
                </div>
                <button
                  onClick={() => navigate('/patient/profil')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Modifier mon profil
                </button>
              </div>
              
              {patient ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Nom complet</p>
                      <p className="font-medium text-gray-900 text-lg">{patient.nom} {patient.prenom}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{patient.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">CIN</p>
                      <p className="font-medium text-gray-900">{patient.cin || "Non renseigné"}</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                      <p className="font-medium text-gray-900">{patient.tel || "Non renseigné"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Adresse</p>
                      <p className="font-medium text-gray-900">{patient.adresse || "Non renseignée"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Membre depuis</p>
                      <p className="font-medium text-gray-900">{formatDate(patient.createdAt) || "Récemment"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Chargement des informations...</p>
              )}
            </div>

            {/* Résumé santé */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-xl shadow-sm text-white">
              <div className="flex items-center mb-6">
                <Activity size={24} className="mr-3" />
                <h3 className="text-lg font-semibold">Résumé santé</h3>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center">
                    <FileText size={18} className="mr-3 opacity-90" />
                    <span>Consultations totales</span>
                  </div>
                  <span className="font-bold text-xl">{stats.totalConsultations}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center">
                    <Stethoscope size={18} className="mr-3 opacity-90" />
                    <span>Médecins consultés</span>
                  </div>
                  <span className="font-bold text-xl">{stats.differentDoctors}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center">
                    <Activity size={18} className="mr-3 opacity-90" />
                    <span>Documents médicaux</span>
                  </div>
                  <span className="font-bold text-xl">{stats.totalDocuments}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center">
                    <CalendarDays size={18} className="mr-3 opacity-90" />
                    <span>Rendez-vous à venir</span>
                  </div>
                  <span className="font-bold text-xl">{stats.rendezVousProchains}</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-teal-400">
                <div className="mb-4">
                  <p className="text-sm text-teal-100 mb-1">Ce mois-ci</p>
                  <p className="text-lg font-semibold">
                    {stats.consultationsMois > 0 
                      ? `✓ ${stats.consultationsMois} consultation(s)`
                      : "Aucune consultation"}
                  </p>
                </div>
                
                <button
                  onClick={() => navigate('/patient/dossier-medical')}
                  className="w-full px-4 py-3 bg-white text-teal-600 hover:bg-teal-50 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md"
                >
                  <FileText size={18} className="mr-2" />
                  Voir mon dossier médical complet
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;