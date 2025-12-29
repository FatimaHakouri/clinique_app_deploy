// src/pages/medecin/DossierMedicalPage.jsx
import { useState, useEffect } from "react";
import { FileText, User, Calendar, Stethoscope, Search } from "lucide-react";
import TopBar from "../../components/TopBar";
import Sidebar from "../../components/SidebarM";
import { authService } from "../../services/authService";
import { Link } from "react-router-dom";

const DossierMedicalPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔑 Récupère l'utilisateur connecté
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id;

  // 🔁 Charger les rendez-vous (qui contiennent les patients)
  useEffect(() => {
    if (!userId) {
      setError("Aucun médecin connecté.");
      setLoading(false);
      return;
    }

    const fetchRendezVous = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/medecins/medecin/rendezvous/${userId}`
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: Impossible de charger les rendez-vous.`);
        }

        const rendezVousList = await response.json();

        // Extraire les patients uniques
        const patientMap = new Map();
        rendezVousList.forEach(rdv => {
          if (rdv.patient && !patientMap.has(rdv.patient.id)) {
            patientMap.set(rdv.patient.id, rdv.patient);
          }
        });

        const uniquePatients = Array.from(patientMap.values());
        setPatients(uniquePatients);
        setFilteredPatients(uniquePatients);

      } catch (err) {
        console.error("Erreur lors du chargement des patients :", err);
        setError(err.message || "Une erreur inconnue s'est produite.");
      } finally {
        setLoading(false);
      }
    };

    fetchRendezVous();
  }, [userId]);

  // 🔍 Filtrer localement
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = patients.filter((patient) =>
        (patient.nom && patient.nom.toLowerCase().includes(term)) ||
        (patient.prenom && patient.prenom.toLowerCase().includes(term)) ||
        (patient.cin && patient.cin.toLowerCase().includes(term))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // === RENDU ===
  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Dossiers Médicaux
            </h1>
            <p className="text-gray-600 mt-2">Chargement des dossiers...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Dossiers Médicaux
            </h1>
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4">
              {error}
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

        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Dossiers Médicaux
            </h1>
            <p className="text-gray-600">
              Patients ayant consulté votre cabinet
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou CIN..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Aucun résultat */}
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun dossier médical trouvé.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPatients.map((patient) => (
                <Link
                  key={patient.id}
                  to={`/medecin/dossiers-medicaux/${patient.id}`}
                  className="block"
                >
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {patient.nom} {patient.prenom}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          CIN : {patient.cin || "Non spécifié"}
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-gray-700">
                          {patient.age && <div>Âge : {patient.age} ans</div>}
                          {patient.tel && <div>Tél : {patient.tel}</div>}
                          {patient.email && <div>Email : {patient.email}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DossierMedicalPage;