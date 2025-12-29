// src/pages/medecin/MedecinDashboard.jsx
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../../components/StatCard";
import { User, CalendarDays, FileText, Activity } from "lucide-react";
import Sidebar from "../../components/SidebarM";
import TopBar from "../../components/TopBar";
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';

const MedecinDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    rendezVousToday: 0,
    dossiersMedicaux: 0,
    consultationsActives: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [statsData, chartData] = await Promise.all([
          dashboardService.getStats(user.id),
          dashboardService.getChartData(user.id)
        ]);
        setStats(statsData);
        setChartData(chartData);
      } catch (error) {
        console.error("Erreur chargement dashboard :", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="fixed left-0 top-0 h-full z-30 w-64 bg-white shadow-md">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col ml-64">
          <div className="fixed top-0 right-0 left-64 z-20 bg-white shadow-sm">
            <TopBar />
          </div>
          <div className="pt-16 p-6">
            <div className="text-center py-10">Chargement du tableau de bord...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="fixed left-0 top-0 h-full z-30 w-64 bg-white shadow-md">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col ml-64">
        <div className="fixed top-0 right-0 left-64 z-20 bg-white shadow-sm">
          <TopBar />
        </div>

        <main className="p-6 space-y-6 pt-16">
          {/* Statistiques dynamiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Mes Patients"
              value={stats.totalPatients}
              subtitle="+6 cette semaine"
              icon={<User size={24} />}
              color="blue"
            />
            <StatCard
              title="Rendez-vous Aujourd’hui"
              value={stats.rendezVousToday}
              subtitle="3 urgences"
              icon={<CalendarDays size={24} />}
              color="green"
            />
            <div
              onClick={() => {
                window.location.href = "/medecin/dossiers-medicaux";
              }}
              className="block cursor-pointer"
            >
              <StatCard
                title="Dossiers Médicaux"
                value={stats.dossiersMedicaux}
                subtitle="Mises à jour récentes"
                icon={<FileText size={24} />}
                color="purple"
              />
            </div>
            <StatCard
              title="Consultations Actives"
              value={stats.consultationsActives}
              subtitle="En cours"
              icon={<Activity size={24} />}
              color="teal"
            />
          </div>

          {/* Graphique dynamique */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Patients vus par jour
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Autres stats (optionnel : rendre aussi dynamiques si besoin) */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Taux de Satisfaction
              </h3>
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    89%
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Patients satisfaits
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Consultations terminées
              </h3>
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    85%
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Cette semaine</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MedecinDashboard;