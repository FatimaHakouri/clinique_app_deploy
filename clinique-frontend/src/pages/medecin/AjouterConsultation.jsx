// src/pages/medecin/AjouterConsultation.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/SidebarM";
import TopBar from "../../components/TopBar";

const AjouterConsultation = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [motif, setMotif] = useState("");
  const [traitement, setTraitement] = useState("");
  const [fichiers, setFichiers] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/patients/${patientId}`);
        if (res.ok) {
          const data = await res.json();
          setPatient(data);
        }
      } catch (err) {
        console.error("Erreur chargement patient", err);
      }
    };
    fetchPatient();
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motif.trim()) {
      alert("Veuillez saisir un motif de consultation.");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("medecinId", 1);
    formData.append("motif", motif.trim());
    if (traitement.trim()) formData.append("traitement", traitement.trim());

    fichiers.forEach((file) => {
      formData.append("fichiers", file);
    });

    try {
      const res = await fetch("http://localhost:8080/api/consultations/nouvelle", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("✅ Consultation enregistrée avec succès !");
        navigate("/medecin/patients");
      } else {
        const errorText = await res.text();
        alert("❌ Erreur : " + (errorText || "Échec de l'enregistrement"));
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Erreur réseau lors de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar fixe */}
      <div className="fixed left-0 top-0 h-full z-30 w-64">
        <Sidebar />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col ml-64">
        <div className="fixed top-0 right-0 left-64 z-20">
          <TopBar />
        </div>

        <div className="pt-16 p-6 mx-auto max-w-4xl w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span>📝</span> Nouvelle Consultation
              </h1>
            </div>

            <div className="p-6">
              {/* Info patient */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                {patient ? (
                  <p className="text-gray-800 text-sm">
                    <span className="font-semibold text-blue-800">Patient :</span>{" "}
                    {patient.nom} {patient.prenom}
                    {patient.cin && <span className="ml-2 text-gray-600">(CIN: {patient.cin})</span>}
                  </p>
                ) : (
                  <p className="text-gray-500 italic text-sm">Chargement...</p>
                )}
              </div>

              {/* Formulaire - 4 lignes strictement verticales */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 🔹 LIGNE 1 : Motif */}
                <div className="w-full">
                  <label htmlFor="motif" className="block text-sm font-medium text-gray-800 mb-1">
                    Motif de la consultation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="motif"
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="4"
                    placeholder="Ex: Douleur abdominale, fièvre, suivi post-opératoire..."
                    required
                  />
                </div>

                {/* 🔹 LIGNE 2 : Traitement */}
                <div className="w-full">
                  <label htmlFor="traitement" className="block text-sm font-medium text-gray-800 mb-1">
                    Traitement / Prescription / Notes
                  </label>
                  <textarea
                    id="traitement"
                    value={traitement}
                    onChange={(e) => setTraitement(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="4"
                    placeholder="Antibiotiques, repos, analyses à faire, etc."
                  />
                </div>

                {/* 🔹 LIGNE 3 : Pièces jointes */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Pièces jointes (PDF, images, documents)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">Cliquez pour sélectionner un ou plusieurs fichiers</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => {
                        setFichiers(Array.from(e.target.files));
                        e.target.value = ""; // permet de re-sélectionner les mêmes fichiers
                      }}
                      className="hidden"
                    />
                  </label>

                  {fichiers.length > 0 && (
                    <div className="mt-2 text-xs text-gray-700">
                      <p className="font-medium">{fichiers.length} fichier(s) sélectionné(s) :</p>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        {fichiers.map((f, i) => (
                          <li key={i} className="truncate max-w-xs">{f.name} ({(f.size / 1024).toFixed(1)} Ko)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 🔹 LIGNE 4 : Boutons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition ${
                      uploading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {uploading ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Envoi...
                      </span>
                    ) : (
                      "Enregistrer la consultation"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjouterConsultation;