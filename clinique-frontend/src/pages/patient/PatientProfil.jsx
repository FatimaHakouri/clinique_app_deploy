import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarP from "../../components/SidebarP";
import TopBar from "../../components/TopBar";
import { useAuth } from '../../context/AuthContext';
import { User, Save, Edit, X, Lock, Mail, Phone, MapPin, IdCard } from "lucide-react";

const PatientProfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    adresse: "",
    cin: "",
    motDePasse: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });

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
        setFormData({
          nom: patientData.nom || "",
          prenom: patientData.prenom || "",
          email: patientData.email || "",
          tel: patientData.tel || "",
          adresse: patientData.adresse || "",
          cin: patientData.cin || "",
          motDePasse: ""
        });
      } else {
        console.error("❌ Patient not found");
        setMessage({ type: "error", text: "Patient non trouvé" });
      }
    } catch (error) {
      console.error("💥 Error loading patient:", error);
      setMessage({ type: "error", text: "Erreur lors du chargement des données" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        tel: formData.tel,
        adresse: formData.adresse,
        cin: formData.cin
      };

      if (formData.motDePasse && formData.motDePasse.trim() !== "") {
        updateData.motDePasse = formData.motDePasse;
      }

      const response = await fetch(`http://localhost:8080/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedPatient = await response.json();
        setPatient(updatedPatient);
        setIsEditing(false);
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error("💥 Error updating patient:", error);
      setMessage({ type: "error", text: "Erreur lors de la mise à jour du profil" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: patient.nom || "",
      prenom: patient.prenom || "",
      email: patient.email || "",
      tel: patient.tel || "",
      adresse: patient.adresse || "",
      cin: patient.cin || "",
      motDePasse: ""
    });
    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

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

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="fixed left-0 top-0 h-full z-30 w-64">
        <SidebarP />
      </div>

      <div className="flex-1 flex flex-col ml-64">
        <div className="fixed top-0 right-0 left-64 z-20">
          <TopBar />
        </div>

        <div className="pt-16 p-6">
          <div className="max-w-4xl mx-auto">
            {/* En-tête amélioré */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 rounded-2xl text-white mb-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                    <User size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Mon Profil
                    </h1>
                    <p className="text-blue-100 text-lg">
                      {isEditing ? "Modifiez vos informations personnelles" : "Consultez et gérez votre profil"}
                    </p>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Edit size={20} />
                    Modifier le profil
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="bg-red-500 text-white hover:bg-red-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <X size={20} />
                    Annuler
                  </button>
                )}
              </div>
            </div>

            {/* Message d'alerte amélioré */}
            {message.text && (
              <div className={`p-4 rounded-xl mb-6 border-l-4 ${
                message.type === "success" 
                  ? "bg-green-50 text-green-800 border-green-500" 
                  : "bg-red-50 text-red-800 border-red-500"
              } shadow-md`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    message.type === "success" ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  {message.text}
                </div>
              </div>
            )}

            {/* Contenu principal */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Chargement du profil...</p>
                </div>
              ) : isEditing ? (
                // MODE ÉDITION - Style amélioré
                <form onSubmit={handleSubmit} className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Carte Informations Personnelles */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                      <div className="flex items-center mb-6">
                        <div className="bg-blue-500 p-2 rounded-lg mr-3">
                          <User size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Informations Personnelles
                        </h3>
                      </div>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2">OBLIGATOIRE</span>
                            Nom complet
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <input
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleInputChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                                placeholder="Votre nom"
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">Nom</p>
                            </div>
                            <div>
                              <input
                                type="text"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleInputChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                                placeholder="Votre prénom"
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">Prénom</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <IdCard size={16} className="mr-2 text-blue-500" />
                            CIN
                          </label>
                          <input
                            type="text"
                            name="cin"
                            value={formData.cin}
                            onChange={handleInputChange}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white"
                            placeholder="Numéro de CIN"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Carte Coordonnées */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                      <div className="flex items-center mb-6">
                        <div className="bg-green-500 p-2 rounded-lg mr-3">
                          <Mail size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Coordonnées
                        </h3>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded mr-2">OBLIGATOIRE</span>
                            Email
                          </label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white"
                              placeholder="votre@email.com"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <Phone size={16} className="mr-2 text-green-500" />
                            Téléphone
                          </label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="tel"
                              name="tel"
                              value={formData.tel}
                              onChange={handleInputChange}
                              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white"
                              placeholder="06 12 34 56 78"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <MapPin size={16} className="mr-2 text-green-500" />
                            Adresse
                          </label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-4 text-gray-400" />
                            <textarea
                              name="adresse"
                              value={formData.adresse}
                              onChange={handleInputChange}
                              rows="3"
                              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white resize-none"
                              placeholder="Votre adresse complète"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Mot de passe */}
                  <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                    <div className="flex items-center mb-6">
                      <div className="bg-purple-500 p-2 rounded-lg mr-3">
                        <Lock size={20} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Sécurité du compte
                      </h3>
                    </div>

                    <div className="max-w-md">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          name="motDePasse"
                          value={formData.motDePasse}
                          onChange={handleInputChange}
                          placeholder="Entrez un nouveau mot de passe"
                          className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-3 flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        Laissez vide pour conserver le mot de passe actuel
                      </p>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3"
                    >
                      <X size={20} />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Enregistrer les modifications
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // MODE LECTURE SEULE
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                      <div className="flex items-center mb-6">
                        <div className="bg-blue-500 p-2 rounded-lg mr-3">
                          <User size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Informations Personnelles
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <InfoItem label="Nom" value={patient.nom} />
                        <InfoItem label="Prénom" value={patient.prenom} />
                        <InfoItem label="CIN" value={patient.cin || "Non renseigné"} />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                      <div className="flex items-center mb-6">
                        <div className="bg-green-500 p-2 rounded-lg mr-3">
                          <Mail size={20} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Coordonnées
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <InfoItem label="Email" value={patient.email} />
                        <InfoItem label="Téléphone" value={patient.tel || "Non renseigné"} />
                        <InfoItem label="Adresse" value={patient.adresse || "Non renseignée"} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher les informations en mode lecture
const InfoItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-lg font-semibold text-gray-800">{value}</span>
  </div>
);

export default PatientProfil;