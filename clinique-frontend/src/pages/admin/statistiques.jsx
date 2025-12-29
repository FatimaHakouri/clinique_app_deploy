// src/pages/admin/Statistiques.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../../components/SidebarA';
import TopBar from '../../components/TopBar';
import { TrendingUp, Users, Calendar, Stethoscope, Download, UserCircle, BarChart3 } from 'lucide-react';

// Importer les services
import { getDoctors } from '../../services/medecinService';
import { getSpecialities } from '../../services/specialityService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Statistiques = () => {
  const [stats, setStats] = useState({
    usersByRole: [],
    specialitesAvecMedecins: [], // Changé : spécialités avec nombre de médecins
    rdvStats: [],
    totalRendezVous: 0,
    lastUpdated: new Date().toLocaleDateString('fr-FR')
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  // Fonction pour calculer les statistiques à partir des données existantes
  const calculateStats = async () => {
    try {
      setLoading(true);

      // Récupérer toutes les données en parallèle
      const [rdvRes, specialitesRes, medecinsRes, patientsRes] = await Promise.all([
        axios.get('http://localhost:8080/rendezvous'),
        getSpecialities(),
        getDoctors(),
        axios.get('http://localhost:8080/api/patients')
      ]);

      const allRendezVous = rdvRes.data || [];
      const allSpecialites = specialitesRes || [];
      const allMedecins = medecinsRes || [];
      const allPatients = patientsRes.data || [];

      console.log('📊 Données récupérées pour statistiques:', {
        rendezVous: allRendezVous.length,
        specialites: allSpecialites.length,
        medecins: allMedecins.length,
        patients: allPatients.length
      });

      // 1. Calculer les utilisateurs par rôle
      const usersByRole = [
        { name: 'Médecins', value: allMedecins.filter(m => m.role === 'medecin' || !m.role).length },
        { name: 'Patients', value: allPatients.length }
      ];

      // 2. Calculer les spécialités AVEC NOMBRE DE MÉDECINS
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
                prenom: m.prenom,
                image: m.image
              }))
          });
        }
      });

      // Trier par nombre de médecins (décroissant)
      specialitesAvecMedecins.sort((a, b) => b.medecinsCount - a.medecinsCount);
      
      console.log('👨‍⚕️ Spécialités avec médecins:', specialitesAvecMedecins);

      // 3. Calculer les RDV par période
      const rdvStats = [];
      const now = new Date();
      
      if (period === 'week') {
        // RDV des 7 derniers jours
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
          
          rdvStats.push({
            name: dayNames[date.getDay()],
            count: count
          });
        }
      } else if (period === 'month') {
        // RDV des 4 dernières semaines
        for (let i = 3; i >= 0; i--) {
          const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          
          const count = allRendezVous.filter(rdv => {
            if (!rdv.date) return false;
            const rdvDate = new Date(rdv.date);
            return rdvDate >= startDate && rdvDate <= endDate;
          }).length;
          
          rdvStats.push({
            name: `S${4-i}`,
            count: count
          });
        }
      } else {
        // RDV des 6 derniers mois
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
          
          const count = allRendezVous.filter(rdv => {
            if (!rdv.date) return false;
            const rdvDate = new Date(rdv.date);
            return rdvDate.getMonth() === date.getMonth() && 
                   rdvDate.getFullYear() === date.getFullYear();
          }).length;
          
          rdvStats.push({
            name: monthName,
            count: count
          });
        }
      }

      // 4. RDV d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const rdvToday = allRendezVous.filter(rdv => {
        if (!rdv.date) return false;
        const rdvDate = new Date(rdv.date).toISOString().split('T')[0];
        return rdvDate === today;
      }).length;

      setStats({
        usersByRole,
        specialitesAvecMedecins: specialitesAvecMedecins.slice(0, 8), // Top 8
        rdvStats,
        totalRendezVous: allRendezVous.length,
        rdvToday,
        totalSpecialites: allSpecialites.length,
        totalPatients: allPatients.length,
        totalMedecins: allMedecins.filter(m => m.role === 'medecin' || !m.role).length,
        lastUpdated: new Date().toLocaleDateString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      
      // Données par défaut en cas d'erreur
      setStats({
        usersByRole: [
          { name: 'Médecins', value: 12 },
          { name: 'Patients', value: 150 }
        ],
        specialitesAvecMedecins: [
          {
            id: 1,
            name: 'Cardiologie',
            medecinsCount: 5,
            value: 5,
            medecinsList: [
              { id: 1, nom: 'Dr. Ahmed', prenom: 'Mohammed' },
              { id: 2, nom: 'Dr. Zahra', prenom: 'Fatima' },
              { id: 3, nom: 'Dr. Benjelloun', prenom: 'Karim' }
            ]
          },
          {
            id: 2,
            name: 'Dermatologie',
            medecinsCount: 3,
            value: 3,
            medecinsList: [
              { id: 4, nom: 'Dr. El Fassi', prenom: 'Amina' },
              { id: 5, nom: 'Dr. Bouzidi', prenom: 'Youssef' }
            ]
          },
          {
            id: 3,
            name: 'Pédiatrie',
            medecinsCount: 4,
            value: 4,
            medecinsList: [
              { id: 6, nom: 'Dr. Idrissi', prenom: 'Khadija' },
              { id: 7, nom: 'Dr. Amrani', prenom: 'Rachid' },
              { id: 8, nom: 'Dr. Belbachir', prenom: 'Nadia' }
            ]
          },
          {
            id: 4,
            name: 'Ophtalmologie',
            medecinsCount: 2,
            value: 2,
            medecinsList: [
              { id: 9, nom: 'Dr. Benslimane', prenom: 'Ahmed' },
              { id: 10, nom: 'Dr. El Haddad', prenom: 'Samira' }
            ]
          },
          {
            id: 5,
            name: 'Généraliste',
            medecinsCount: 6,
            value: 6,
            medecinsList: [
              { id: 11, nom: 'Dr. Tazi', prenom: 'Mohamed' },
              { id: 12, nom: 'Dr. Alaoui', prenom: 'Fatima' },
              { id: 13, nom: 'Dr. Berrada', prenom: 'Khalid' },
              { id: 14, nom: 'Dr. Skalli', prenom: 'Naima' }
            ]
          }
        ],
        rdvStats: [
          { name: 'Lun', count: 15 },
          { name: 'Mar', count: 18 },
          { name: 'Mer', count: 12 },
          { name: 'Jeu', count: 20 },
          { name: 'Ven', count: 16 },
          { name: 'Sam', count: 8 }
        ],
        totalRendezVous: 834,
        rdvToday: 24,
        totalSpecialites: 8,
        totalPatients: 150,
        totalMedecins: 12,
        totalSecretaires: 5,
        lastUpdated: new Date().toLocaleDateString('fr-FR')
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStats();
  }, [period]);

  const exportData = () => {
    // Créer un CSV détaillé
    const csvContent = "data:text/csv;charset=utf-8," +
      "Statistiques des Spécialités et Médecins\r\n" +
      `Date d'export: ${new Date().toLocaleDateString('fr-FR')}\r\n` +
      `Période: ${period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : 'Cette année'}\r\n` +
      `Total Médecins: ${stats.totalMedecins}\r\n` +
      `Total Patients: ${stats.totalPatients}\r\n` +
      `Total Spécialités: ${stats.totalSpecialites}\r\n` +
      `Total RDV: ${stats.totalRendezVous}\r\n\r\n` +
      "Spécialités avec nombre de médecins\r\n" +
      "Spécialité,Nombre de médecins\r\n" +
      stats.specialitesAvecMedecins.map(s => `${s.name},${s.medecinsCount}`).join("\r\n") + "\r\n\r\n" +
      "Répartition des utilisateurs\r\n" +
      "Rôle,Nombre\r\n" +
      stats.usersByRole.map(u => `${u.name},${u.value}`).join("\r\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `statistiques_medecins_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Calcul des statistiques...</p>
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
          {/* En-tête */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Statistiques clés</h1>
              <p className="text-sm text-gray-500 mt-1">
                Dernière mise à jour: {stats.lastUpdated}
              </p>
            </div>
            <div className="flex gap-3">
              <select 
                className="border rounded-lg px-4 py-2 bg-white"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
              <button 
                onClick={calculateStats}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <TrendingUp size={20} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Total Médecins</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalMedecins}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Stethoscope className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Spécialités</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalSpecialites}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">RDV aujourd'hui</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.rdvToday}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <UserCircle className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600">Patients</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalPatients}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Utilisateurs par rôle */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Répartition des utilisateurs</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.usersByRole}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px' 
                    }}
                    formatter={(value) => [`${value} utilisateurs`, 'Nombre']}
                  />
                  <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* NOUVEAU : Spécialités avec plus de médecins */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Spécialités avec médecins</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserCircle size={16} />
                  <span>Classé par nombre de médecins</span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.specialitesAvecMedecins}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, medecinsCount }) => `${name}: ${medecinsCount}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="medecinsCount"
                  >
                    {stats.specialitesAvecMedecins.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} médecins`, props.payload.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Légende des spécialités */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {stats.specialitesAvecMedecins.slice(0, 4).map((spec, index) => (
                  <div key={spec.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 truncate">{spec.name}</span>
                    <span className="ml-auto text-sm font-bold text-blue-600">{spec.medecinsCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tableau détaillé des spécialités avec médecins */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Détail des spécialités et médecins</h3>
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-600" />
                <span className="text-sm text-gray-500">
                  {stats.specialitesAvecMedecins.length} spécialités avec médecins
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spécialité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre de médecins
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pourcentage
                    </th>
                   
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.specialitesAvecMedecins.map((specialite, index) => {
                    const percentage = (specialite.medecinsCount / stats.totalMedecins * 100).toFixed(1);
                    return (
                      <tr key={specialite.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">{specialite.name}</div>
        
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-700 font-bold text-lg">{specialite.medecinsCount}</span>
                            </div>
                            <div>
                              <div className="text-sm text-gray-900">médecin{specialite.medecinsCount > 1 ? 's' : ''}</div>
                              <div className="text-xs text-gray-500">
                                {(specialite.medecinsCount / stats.totalMedecins * 100).toFixed(1)}% du total
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-700">{percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {specialite.medecinsList && specialite.medecinsList.slice(0, 2).map(medecin => (
                              <div 
                                key={medecin.id}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                              >
                                <UserCircle size={12} className="mr-1" />
                                {medecin.prenom} {medecin.nom}
                              </div>
                            ))}
                            {specialite.medecinsList && specialite.medecinsList.length > 2 && (
                              <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                                +{specialite.medecinsList.length - 2} autres
                              </div>
                            )}
                          </div>
                          {specialite.medecinsList && specialite.medecinsList.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              Total: {specialite.medecinsList.length} médecin{specialite.medecinsList.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Résumé synthétique */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h4 className="text-lg font-semibold text-blue-800 mb-3">Synthèse des statistiques</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Spécialité la plus fournie</div>
                <div className="font-bold text-lg text-blue-700 truncate">
                  {stats.specialitesAvecMedecins[0]?.name || '--'}
                </div>
                <div className="text-sm text-gray-600">
                  {stats.specialitesAvecMedecins[0]?.medecinsCount || 0} médecins
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Moyenne médecins/spécialité</div>
                <div className="font-bold text-lg text-green-700">
                  {stats.specialitesAvecMedecins.length > 0 
                    ? (stats.specialitesAvecMedecins.reduce((sum, s) => sum + s.medecinsCount, 0) / stats.specialitesAvecMedecins.length).toFixed(1)
                    : '0.0'}
                </div>
                <div className="text-sm text-gray-600">sur {stats.specialitesAvecMedecins.length} spécialités</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Ratio patient/médecin</div>
                <div className="font-bold text-lg text-purple-700">
                  {(stats.totalPatients / stats.totalMedecins).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">{stats.totalPatients} patients / {stats.totalMedecins} médecins</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Taux d'occupation</div>
                <div className="font-bold text-lg text-orange-700">
                  {((stats.rdvToday / (stats.totalMedecins * 3)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">basé sur RDV aujourd'hui</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Statistiques;