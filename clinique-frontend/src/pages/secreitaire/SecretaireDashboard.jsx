import { Outlet, useLocation } from "react-router-dom";
import SidebarS from "../../components/SidebarS";
import TopBar from "../../components/TopBar";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalRendezVous: 0,
    totalPatients: 0,
    rendezVousAujourdhui: 0,
    medecinsDisponibles: 0
  });
  const [chartData, setChartData] = useState({
    rdvParMois: [],
    rdvParMedecin: [],
    patientsParSpecialite: [],
    performanceMedecins: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Récupérer toutes les données en parallèle
        const [rdvResponse, patientsResponse, medecinsResponse] = await Promise.all([
          fetch('http://localhost:8080/rendezvous'),
          fetch('http://localhost:8080/api/patients'),
          fetch('http://localhost:8080/api/medecins')
        ]);

        if (!rdvResponse.ok || !patientsResponse.ok || !medecinsResponse.ok) {
          throw new Error('Erreur de chargement des données');
        }

        const [rendezVous, patients, medecins] = await Promise.all([
          rdvResponse.json(),
          patientsResponse.json(),
          medecinsResponse.json()
        ]);

        // Calculer les statistiques de base
        const aujourdhui = new Date().toISOString().split('T')[0];
        const rdvAujourdhui = Array.isArray(rendezVous) 
          ? rendezVous.filter(rdv => rdv.date === aujourdhui).length 
          : 0;

        setStats({
          totalRendezVous: Array.isArray(rendezVous) ? rendezVous.length : 0,
          totalPatients: Array.isArray(patients) ? patients.length : 0,
          rendezVousAujourdhui: rdvAujourdhui,
          medecinsDisponibles: Array.isArray(medecins) ? medecins.length : 0
        });

        // Préparer les données pour les graphiques
        if (Array.isArray(rendezVous)) {
          // RDV par mois
          const rdvParMois = calculateRdvParMois(rendezVous);
          // Performance des médecins (RDV et patients par médecin)
          const performanceMedecins = calculatePerformanceMedecins(rendezVous, medecins, patients);
          // Patients par spécialité
          const patientsParSpecialite = calculatePatientsParSpecialite(patients, medecins);
          
          setChartData({
            rdvParMois,
            rdvParMedecin: performanceMedecins,
            patientsParSpecialite,
            performanceMedecins
          });
        }

      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        setError("Impossible de charger les données du dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculer les RDV par mois
  const calculateRdvParMois = (rendezVous) => {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const rdvParMois = new Array(12).fill(0);
    
    rendezVous.forEach(rdv => {
      if (rdv.date) {
        const moisIndex = new Date(rdv.date).getMonth();
        rdvParMois[moisIndex]++;
      }
    });

    return mois.map((mois, index) => ({
      mois,
      count: rdvParMois[index]
    }));
  };

  // Calculer la performance des médecins (RDV et patients par médecin)
  const calculatePerformanceMedecins = (rendezVous, medecins, patients) => {
    const medecinStats = {};
    
    // Compter les RDV par médecin
    rendezVous.forEach(rdv => {
      if (rdv.medecin && rdv.medecin.id) {
        const medecinId = rdv.medecin.id;
        if (!medecinStats[medecinId]) {
          medecinStats[medecinId] = { rdvCount: 0, patientIds: new Set() };
        }
        medecinStats[medecinId].rdvCount++;
        if (rdv.patient && rdv.patient.id) {
          medecinStats[medecinId].patientIds.add(rdv.patient.id);
        }
      }
    });

    return medecins.map(medecin => {
      // Utiliser le nom réel du médecin
      let nomComplet = `Dr. Inconnu`;
      if (medecin.user) {
        const prenom = medecin.user.prenom || '';
        const nom = medecin.user.nom || '';
        nomComplet = `Dr. ${prenom} ${nom}`.trim();
      } else if (medecin.prenom || medecin.nom) {
        const prenom = medecin.prenom || '';
        const nom = medecin.nom || '';
        nomComplet = `Dr. ${prenom} ${nom}`.trim();
      }

      const stats = medecinStats[medecin.id] || { rdvCount: 0, patientIds: new Set() };
      
      return {
        id: medecin.id,
        nom: nomComplet,
        rdvCount: stats.rdvCount,
        patientsCount: stats.patientIds.size,
        specialite: medecin.specialite?.title || 'Généraliste'
      };
    }).sort((a, b) => b.rdvCount - a.rdvCount).slice(0, 6); // Top 6 médecins
  };

  // Calculer la répartition des patients par spécialité
  const calculatePatientsParSpecialite = (patients, medecins) => {
    const specialitesCount = {};
    
    patients.forEach(patient => {
      if (patient.medecinTraitant && patient.medecinTraitant.id) {
        const medecin = medecins.find(m => m.id === patient.medecinTraitant.id);
        const specialite = medecin?.specialite?.title || 'Généraliste';
        specialitesCount[specialite] = (specialitesCount[specialite] || 0) + 1;
      } else {
        // Si pas de médecin traitant, mettre dans "Non assigné"
        const specialite = 'Non assigné';
        specialitesCount[specialite] = (specialitesCount[specialite] || 0) + 1;
      }
    });

    return Object.entries(specialitesCount).map(([specialite, count]) => ({
      specialite,
      count
    })).sort((a, b) => b.count - a.count);
  };

  // Composant de barre pour graphique en pilier
  const BarChart = ({ data, color, maxHeight = 60 }) => {
    const maxValue = Math.max(...data.map(item => item.count));
    
    return (
      <div className="flex items-end justify-between space-x-2 h-28">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full ${color} rounded-t transition-all duration-300 hover:opacity-80`}
              style={{ 
                height: maxValue > 0 ? `${(item.count / maxValue) * maxHeight}px` : '0px',
                minHeight: '4px'
              }}
            ></div>
            <div className="text-xs text-gray-600 mt-2 text-center leading-tight">
              {item.mois || item.nom?.split(' ')[0]}
            </div>
            <div className="text-xs font-bold text-gray-900 mt-1">
              {item.count}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /*const getColorForIndex = (index) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
    return colors[index % colors.length];
  };*/

  // Vérifier si on est sur la page d'accueil du dashboard
  const isDashboardHome = 
    location.pathname === '/secretaire/dashboard' || 
    location.pathname === '/secretaire/dashboard/';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarS />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-6 flex-1">
          {/* Afficher le tableau de bord seulement si on est sur la page d'accueil */}
          {isDashboardHome ? (
            <div className="mb-8">
             
              
              {/* Message d'erreur */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                </div>
              )}
              
              {/* Cartes de statistiques principales */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { 
                    title: "RDV Total", 
                    value: stats.totalRendezVous, 
                    icon: "📅", 
                    color: "text-blue-600",
                    bgColor: "bg-blue-50"
                  },
                  { 
                    title: "Patients", 
                    value: stats.totalPatients, 
                    icon: "👥", 
                    color: "text-green-600",
                    bgColor: "bg-green-50"
                  },
                  { 
                    title: "RDV Aujourd'hui", 
                    value: stats.rendezVousAujourdhui, 
                    icon: "⏰", 
                    color: "text-orange-600",
                    bgColor: "bg-orange-50"
                  },
                  { 
                    title: "Médecins", 
                    value: stats.medecinsDisponibles, 
                    icon: "👨‍⚕️", 
                    color: "text-purple-600",
                    bgColor: "bg-purple-50"
                  }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>
                          {loading ? (
                            <div className="animate-pulse bg-gray-200 h-7 w-12 rounded"></div>
                          ) : (
                            stat.value
                          )}
                        </p>
                      </div>
                      <div className={`text-2xl p-3 rounded-lg ${stat.bgColor}`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Graphiques et analyses */}
              <div className="grid grid-cols-1 gap-6 mb-8">
                
                {/* Graphique RDV par mois en barres */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Rendez-vous par Mois
                  </h3>
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>
                  ) : (
                    <BarChart 
                      data={chartData.rdvParMois} 
                      color="bg-blue-500"
                      maxHeight={60}
                    />
                  )}
                </div>
              </div>

              {/* Performance des médecins */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Performance des Médecins
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 rounded-lg p-4 h-32"></div>
                    ))
                  ) : (
                    chartData.performanceMedecins.map((medecin, index) => (
                      <div key={medecin.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">{medecin.nom}</h4>
                            <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                              {medecin.specialite}
                            </p>
                          </div>
                          <div className="text-2xl">👨‍⚕️</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <div className="text-lg font-bold text-blue-600">{medecin.rdvCount}</div>
                            <div className="text-xs text-blue-800">RDV</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <div className="text-lg font-bold text-green-600">{medecin.patientsCount}</div>
                            <div className="text-xs text-green-800">Patients</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Afficher seulement le contenu de la page enfant
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}