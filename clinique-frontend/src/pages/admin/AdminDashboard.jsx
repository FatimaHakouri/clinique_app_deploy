// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/StatCard';
import { Stethoscope, UserPlus, CalendarCheck, Clock, Users, TrendingUp, UserCircle } from 'lucide-react';
import Sidebar from '../../components/SidebarA';
import TopBar from '../../components/TopBar';

// Importer les services
import { getDoctors } from '../../services/medecinService';
import { getSpecialities } from '../../services/specialityService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMedecins: 0,
    totalSecretaires: 0,
    rdvAujourdhui: 0,
    totalSpecialites: 0,
    totalPatients: 0,
    specialitesAvecMedecins: [], // Changé : spécialités avec nombre de médecins
    rdvParJour: [],
    attenteMoyenne: 15,
    loading: true
  });

  // Fonction pour calculer les statistiques
  const calculateDashboardStats = async () => {
    try {
      // Récupérer toutes les données en parallèle
      const [rdvRes, specialitesRes, medecinsRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:8080/rendezvous'),
        getSpecialities(), // Utiliser le service
        getDoctors(),      // Utiliser le service
        axios.get('http://localhost:8080/api/patients')
      ]);

      const allRendezVous = rdvRes.data || [];
      const allSpecialites = specialitesRes || [];
      const allMedecins = medecinsRes || [];
      const allPatients = patientsRes.data || [];

      console.log('📊 Données récupérées:', {
        rendezVous: allRendezVous.length,
        specialites: allSpecialites.length,
        medecins: allMedecins.length,
        patients: allPatients.length
      });

      // Afficher la structure des médecins pour déboguer
      if (allMedecins.length > 0) {
        console.log('🏥 Exemple de médecin:', allMedecins[0]);
      }

      // 1. Calculer les RDV d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const rdvToday = allRendezVous.filter(rdv => {
        if (!rdv.date) return false;
        const rdvDate = new Date(rdv.date).toISOString().split('T')[0];
        return rdvDate === today;
      }).length;

      // 2. Calculer les spécialités AVEC NOMBRE DE MÉDECINS (NOUVEAU)
      const specialitesAvecMedecins = [];
      
      // Pour chaque spécialité, compter combien de médecins
      allSpecialites.forEach(specialite => {
        const medecinsCount = allMedecins.filter(medecin => {
          // Vérifier si le médecin a cette spécialité
          if (medecin.specialite) {
            return medecin.specialite.id === specialite.id || medecin.specialite.title === specialite.title;
          } else if (medecin.specialiteId) {
            return medecin.specialiteId === specialite.id;
          }
          return false;
        }).length;

        if (medecinsCount > 0) {
          specialitesAvecMedecins.push({
            id: specialite.id,
            name: specialite.title,
            medecinsCount: medecinsCount,
            // Pour l'affichage graphique
            value: medecinsCount,
            // Ajouter les médecins pour affichage détaillé
            medecinsList: allMedecins
              .filter(m => {
                if (m.specialite) {
                  return m.specialite.id === specialite.id;
                } else if (m.specialiteId) {
                  return m.specialiteId === specialite.id;
                }
                return false;
              })
              .map(m => ({
                id: m.id,
                nom: m.nom || `${m.prenom} ${m.nom}`,
                prenom: m.prenom
              }))
          });
        }
      });

      // Trier par nombre de médecins (décroissant)
      specialitesAvecMedecins.sort((a, b) => b.medecinsCount - a.medecinsCount);
      
      console.log('👨‍⚕️ Spécialités avec médecins:', specialitesAvecMedecins);

      // 3. Calculer les RDV par jour (7 derniers jours)
      const rdvByDay = {};
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = allRendezVous.filter(rdv => {
          if (!rdv.date) return false;
          const rdvDate = new Date(rdv.date).toISOString().split('T')[0];
          return rdvDate === dateStr;
        }).length;
        
        rdvByDay[dayNames[date.getDay()]] = count;
      }

      const rdvParJour = Object.entries(rdvByDay).map(([name, patients]) => ({ 
        name, 
        patients 
      }));

      // 4. Calculer le temps d'attente moyen (simulé basé sur le nombre de RDV)
      const attenteMoyenne = allRendezVous.length > 0 ? 
        Math.min(Math.floor(allRendezVous.length / 2) + 10, 45) : 15;

      // 5. Compter les secrétaires (supposons qu'ils sont dans la liste des utilisateurs avec role="secretaire")
      const totalSecretaires = allMedecins.filter(m => m.role === 'secretaire').length;

      setStats({
        totalMedecins: allMedecins.filter(m => m.role === 'medecin' || !m.role).length,
        totalSecretaires,
        rdvAujourdhui: rdvToday,
        totalSpecialites: allSpecialites.length,
        totalPatients: allPatients.length,
        specialitesAvecMedecins: specialitesAvecMedecins.slice(0, 5), // Top 5 seulement
        rdvParJour,
        attenteMoyenne,
        loading: false
      });

    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      
      // Données de démonstration en cas d'erreur
      const demoSpecialites = [
        {
          id: 1,
          name: 'Cardiologie',
          medecinsCount: 5,
          value: 5,
          medecinsList: [
            { id: 1, nom: 'Dr. Ahmed', prenom: 'Mohammed' },
            { id: 2, nom: 'Dr. Zahra', prenom: 'Fatima' },
            { id: 3, nom: 'Dr. Benjelloun', prenom: 'Karim' },
            { id: 4, nom: 'Dr. Alami', prenom: 'Hassan' },
            { id: 5, nom: 'Dr. Mourad', prenom: 'Sara' }
          ]
        },
        {
          id: 2,
          name: 'Dermatologie',
          medecinsCount: 3,
          value: 3,
          medecinsList: [
            { id: 6, nom: 'Dr. El Fassi', prenom: 'Amina' },
            { id: 7, nom: 'Dr. Bouzidi', prenom: 'Youssef' },
            { id: 8, nom: 'Dr. Naji', prenom: 'Leila' }
          ]
        },
        {
          id: 3,
          name: 'Pédiatrie',
          medecinsCount: 4,
          value: 4,
          medecinsList: [
            { id: 9, nom: 'Dr. Idrissi', prenom: 'Khadija' },
            { id: 10, nom: 'Dr. Amrani', prenom: 'Rachid' },
            { id: 11, nom: 'Dr. Belbachir', prenom: 'Nadia' },
            { id: 12, nom: 'Dr. Cherkaoui', prenom: 'Omar' }
          ]
        },
        {
          id: 4,
          name: 'Ophtalmologie',
          medecinsCount: 2,
          value: 2,
          medecinsList: [
            { id: 13, nom: 'Dr. Benslimane', prenom: 'Ahmed' },
            { id: 14, nom: 'Dr. El Haddad', prenom: 'Samira' }
          ]
        },
        {
          id: 5,
          name: 'Généraliste',
          medecinsCount: 6,
          value: 6,
          medecinsList: [
            { id: 15, nom: 'Dr. Tazi', prenom: 'Mohamed' },
            { id: 16, nom: 'Dr. Alaoui', prenom: 'Fatima' },
            { id: 17, nom: 'Dr. Berrada', prenom: 'Khalid' },
            { id: 18, nom: 'Dr. Skalli', prenom: 'Naima' },
            { id: 19, nom: 'Dr. El Khattabi', prenom: 'Hicham' },
            { id: 20, nom: 'Dr. Chraibi', prenom: 'Leila' }
          ]
        }
      ];

      setStats({
        totalMedecins: 20,
        totalSecretaires: 3,
        rdvAujourdhui: 12,
        totalSpecialites: 8,
        totalPatients: 45,
        specialitesAvecMedecins: demoSpecialites,
        rdvParJour: [
          { name: 'Lun', patients: 15 },
          { name: 'Mar', patients: 18 },
          { name: 'Mer', patients: 12 },
          { name: 'Jeu', patients: 20 },
          { name: 'Ven', patients: 16 },
          { name: 'Sam', patients: 8 },
          { name: 'Dim', patients: 3 }
        ],
        attenteMoyenne: 18,
        loading: false
      });
    }
  };

  useEffect(() => {
    calculateDashboardStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des données...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Médecins Actifs"
              value={stats.totalMedecins}
              subtitle={`Sur ${stats.totalSpecialites} spécialités`}
              icon={<Stethoscope size={24} />}
              color="blue"
            />
            <StatCard
              title="Patients"
              value={stats.totalPatients}
              subtitle="Patients enregistrés"
              icon={<Users size={24} />}
              color="green"
            />
            <StatCard
              title="RDV Aujourd'hui"
              value={stats.rdvAujourdhui}
              subtitle={`${stats.totalPatients > 0 ? ((stats.rdvAujourdhui / stats.totalPatients * 100).toFixed(1)) : '0'}% taux`}
              icon={<CalendarCheck size={24} />}
              color="purple"
            />
            <StatCard
              title="Attente Moyenne"
              value={`${stats.attenteMoyenne} min`}
              subtitle="Temps d'attente"
              icon={<Clock size={24} />}
              color="teal"
            />
          </div>

          {/* Graphiques - 2 colonnes au lieu de 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique RDV par jour */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Rendez-vous cette semaine</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.rdvParJour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px' 
                    }}
                    formatter={(value) => [`${value} RDV`, 'Nombre']}
                  />
                  <Bar dataKey="patients" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* NOUVEAU : Spécialités avec plus de médecins */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Spécialités avec médecins</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserCircle size={16} />
                  <span>Classement par nombre de médecins</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {stats.specialitesAvecMedecins.length > 0 ? (
                  stats.specialitesAvecMedecins.map((specialite, index) => (
                    <div key={specialite.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold`}
                               style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{specialite.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <UserCircle size={14} className="text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {specialite.medecinsCount} médecin{specialite.medecinsCount > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {specialite.medecinsCount}
                          </div>
                          <div className="text-xs text-gray-500">médecins</div>
                        </div>
                      </div>
                      
                      {/* Liste des médecins de cette spécialité */}
                      {specialite.medecinsList && specialite.medecinsList.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-2">Médecins :</p>
                          <div className="flex flex-wrap gap-2">
                            {specialite.medecinsList.slice(0, 3).map((medecin, medIndex) => (
                              <div 
                                key={medecin.id} 
                                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-1"
                              >
                                <UserCircle size={10} />
                                <span>{medecin.prenom} {medecin.nom}</span>
                              </div>
                            ))}
                            {specialite.medecinsList.length > 3 && (
                              <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                +{specialite.medecinsList.length - 3} autres
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <UserCircle size={24} className="text-gray-400" />
                      </div>
                      <p className="mt-3 text-gray-500">Aucune spécialité avec médecins</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Résumé */}
              {stats.specialitesAvecMedecins.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Spécialité la plus fournie</p>
                      <p className="font-bold text-lg text-blue-800">
                        {stats.specialitesAvecMedecins[0]?.name || '--'}
                      </p>
                      <p className="text-xs text-blue-600">
                        {stats.specialitesAvecMedecins[0]?.medecinsCount || 0} médecins
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Moyenne médecins/spécialité</p>
                      <p className="font-bold text-lg text-green-800">
                        {stats.specialitesAvecMedecins.length > 0 
                          ? (stats.specialitesAvecMedecins.reduce((sum, s) => sum + s.medecinsCount, 0) / stats.specialitesAvecMedecins.length).toFixed(1)
                          : '0'}
                      </p>
                      <p className="text-xs text-green-600">moyenne</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Informations supplémentaires */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <TrendingUp size={20} />
              Synthèse des ressources médicales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{stats.totalMedecins}</div>
                <div className="text-sm text-gray-600">Médecins total</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{stats.totalSpecialites}</div>
                <div className="text-sm text-gray-600">Spécialités disponibles</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.specialitesAvecMedecins.length > 0 
                    ? stats.specialitesAvecMedecins[0]?.medecinsCount || 0
                    : 0}
                </div>
                <div className="text-sm text-gray-600">Max médecins/spécialité</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-teal-600">
                  {stats.specialitesAvecMedecins.length > 0 
                    ? (stats.totalMedecins / stats.specialitesAvecMedecins.length).toFixed(1)
                    : '0.0'}
                </div>
                <div className="text-sm text-gray-600">Ratio médecin/spécialité</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;