// src/pages/medecin/PatientsM.jsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/SidebarM";
import TopBar from "../../components/TopBar";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { User, Search } from "lucide-react";

const PatientsM = () => {
  const { user } = useAuth(); // { id, nom, prenom, email, role }
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔁 Charger les patients via les rendez-vous du médecin
  useEffect(() => {
    if (!user || !user.id) {
      setError("Aucun médecin connecté.");
      setLoading(false);
      return;
    }

    const fetchPatients = async () => {
      try {
        // Appel à l'endpoint existant (voir MedecinController.java)
        const response = await axios.get(
          `http://localhost:8080/api/medecins/medecin/rendezvous/${user.id}`
        );

        const rendezVousList = response.data;

        // Extraire les patients uniques
        const patientMap = new Map();
        rendezVousList.forEach((rdv) => {
          if (rdv.patient && rdv.patient.id) {
            patientMap.set(rdv.patient.id, rdv.patient);
          }
        });

        const uniquePatients = Array.from(patientMap.values());
        setPatients(uniquePatients);
        setFilteredPatients(uniquePatients);
      } catch (err) {
        console.error("Erreur lors du chargement des patients :", err);
        setError("Impossible de charger la liste des patients.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  // 🔍 Filtrer par nom, prénom ou CIN
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          (patient.nom && patient.nom.toLowerCase().includes(term)) ||
          (patient.prenom && patient.prenom.toLowerCase().includes(term)) ||
          (patient.cin && patient.cin.toLowerCase().includes(term))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">👨‍⚕️ Mes Patients</h1>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">👨‍⚕️ Mes Patients</h1>
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* ➤ Sidebar fixe */}
      <div className="fixed left-0 top-0 h-full z-30 w-64 bg-white shadow-md">
        <Sidebar />
      </div>

      {/* ➤ Contenu principal */}
      <div className="flex-1 flex flex-col ml-64">
        {/* ➤ TopBar fixe */}
        <div className="fixed top-0 right-0 left-64 z-20 bg-white shadow-sm">
          <TopBar />
        </div>

        {/* ➤ Contenu scrollable */}
        <div className="pt-16 p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">👨‍⚕️ Mes Patients</h1>
            </div>

            <p className="text-gray-600 mb-4">
              Liste des patients ayant des rendez-vous avec vous.
            </p>

            {/* 🔍 Barre de recherche */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou CIN..."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun patient trouvé.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="py-2 px-3 text-left">Nom</th>
                      <th className="py-2 px-3 text-left">Prénom</th>
                      <th className="py-2 px-3 text-left">CIN</th>
                      <th className="py-2 px-3 text-left">Téléphone</th>
                      <th className="py-2 px-3 text-left">Adresse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-t hover:bg-gray-50">
                        <td className="py-2 px-3">{patient.nom || "—"}</td>
                        <td className="py-2 px-3">{patient.prenom || "—"}</td>
                        <td className="py-2 px-3">{patient.cin || "—"}</td>
                        <td className="py-2 px-3">{patient.tel || "—"}</td>
                        <td className="py-2 px-3">{patient.adresse || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsM;