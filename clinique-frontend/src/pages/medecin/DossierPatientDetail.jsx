import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { User, Calendar, Stethoscope, FileText, ArrowLeft } from "lucide-react";
import TopBar from "../../components/TopBar";
import Sidebar from "../../components/SidebarM";

const DossierPatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/consultations/dossier-patient/${id}`);
        if (!res.ok) throw new Error("Patient non trouvé.");
        const data = await res.json();
        setPatient(data.patient);
        setConsultations(data.consultations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [id]);

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <TopBar />
          <div className="p-6">Chargement du dossier...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <TopBar />
          <div className="p-6 text-red-600">Erreur : {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar fixe */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Contenu principal */}
      <div className="flex flex-col flex-1">
        {/* TopBar fixe */}
        <div className="sticky top-0 z-10">
          <TopBar />
        </div>

        {/* Contenu défilable */}
        <main className="p-6 overflow-y-auto flex-1">
          <Link
            to="/medecin/dossiers-medicaux"
            className="flex items-center gap-1 text-blue-600 hover:text-purple-800 mb-6"
          >
            <ArrowLeft size={16} />
            Retour aux dossiers
          </Link>

          {/* Informations personnelles */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex items-start gap-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {patient.nom} {patient.prenom}
                </h1>
                <p className="text-gray-600">CIN : {patient.cin || "Non spécifié"}</p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div>📧 {patient.email || "Email non fourni"}</div>
                  <div>📞 {patient.tel || "Téléphone non fourni"}</div>
                  <div>🏠 {patient.adresse || "Adresse non spécifiée"}</div>
                  <div>🆔 ID Patient : {patient.id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Historique des consultations */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Historique des consultations
            </h2>

            {consultations.length === 0 ? (
              <p className="text-gray-500">Aucune consultation enregistrée.</p>
            ) : (
              <div className="space-y-4">
                {consultations.map((cons) => (
                  <div key={cons.id} className="bg-white p-5 rounded-lg border border-gray-200">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          Dr. {cons.medecinNom} {cons.medecinPrenom}
                        </h3>
                        <p className="text-blue-600 text-sm">{cons.specialite}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(cons.dateConsultation).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-700">
                        <strong>Motif :</strong> {cons.motif}
                      </p>
                      {cons.traitement && (
                        <p className="text-gray-700 mt-1">
                          <strong>Traitement :</strong> {cons.traitement}
                        </p>
                      )}
                    </div>
                    {cons.fichier && cons.fichier.length > 0 && (
                      <div className="mt-2">
                        <strong>Pièces jointes :</strong>
                        <ul className="list-disc list-inside text-blue-600">
                          {cons.fichier.map((fichier, idx) => (
                            <li key={idx}>
                              <a
                                href={`http://localhost:8080/uploads/${fichier}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {fichier}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DossierPatientDetail;