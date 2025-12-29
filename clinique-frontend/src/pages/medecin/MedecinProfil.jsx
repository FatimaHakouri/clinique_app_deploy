// src/pages/medecin/MedecinProfil.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LayoutMedecin from '../../components/layout/LayoutMedecin';

const MedecinProfil = () => {
  const [profil, setProfil] = useState({
    nom: '',
    prenom: '',
    email: '',
    image: '',
    experiences: '',
    languages: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      alert("Non connecté");
      navigate('/login');
      return;
    }

    const fetchProfil = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/medecins/user/${user.id}`);
        const data = res.data;

        // ✅ Assurez-vous que les champs existent
        setProfil({
          nom: data.nom || 'Non renseigné',
          prenom: data.prenom || 'Non renseigné',
          email: data.email || 'Non renseigné',
          image: data.image || '👨‍⚕️', // emoji par défaut
          experiences: data.experiences || '',
          languages: data.languages || ''
        });
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement profil", err);
        alert("Médecin non trouvé");
        navigate('/medecin/dashboard');
      }
    };

    fetchProfil();
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfil(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Gestion du fichier upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Créez un URL temporaire pour afficher l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfil(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vous devez être connecté pour enregistrer.");
      return;
    }

    try {
      const updateData = {
        image: profil.image,
        experiences: profil.experiences,
        languages: profil.languages
      };

      const medecinRes = await axios.get(`http://localhost:8080/api/medecins/user/${user.id}`);
      const medecinId = medecinRes.data.id;

      await axios.put(`http://localhost:8080/api/medecins/${medecinId}/profil`, updateData);
      alert("Profil mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur mise à jour", err);
      alert("Erreur lors de la mise à jour du profil");
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement du profil...</div>;

  return (
    <LayoutMedecin>
      <div className="bg-white p-6 rounded-xl shadow-sm">

        {/* En-tête avec avatar en cercle */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border-2 border-blue-100">
            {profil.image ? (
              // Si c'est une URL (commence par http), affichez comme image
              profil.image.startsWith('http') ? (
                <img
                  src={profil.image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                // Sinon, c'est un emoji ou texte
                <span className="text-3xl">{profil.image}</span>
              )
            ) : (
              <span className="text-3xl">👨‍⚕️</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">👨‍⚕️ Mon Profil</h1>
            <p className="text-gray-600">Modifiez vos informations personnelles</p>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Informations personnelles</h2>
          <p><strong>Nom :</strong> {profil.nom}</p>
          <p><strong>Prénom :</strong> {profil.prenom}</p>
          <p><strong>Email :</strong> {profil.email}</p>
        </div>

        {/* Formulaire modifiable */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Upload d'image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo / Avatar
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="upload-image"
              />
              <label
                htmlFor="upload-image"
                className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-300 rounded-md cursor-pointer hover:bg-blue-100 transition"
              >
                📷 Choisir une image
              </label>
              <span className="text-sm text-gray-500">
                {profil.image && profil.image.startsWith('http') ? 'Image sélectionnée' : 'Emoji ou URL'}
              </span>
            </div>
            {/* Preview */}
            {profil.image && (
              <div className="mt-2">
                <small className="text-gray-500">Aperçu :</small>
                <div className="mt-1 w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {profil.image.startsWith('http') ? (
                    <img
                      src={profil.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">{profil.image}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expériences professionnelles
              </label>
              <textarea
                name="experiences"
                value={profil.experiences}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: 10 ans en cardiologie, CHU Rabat..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Langues parlées
              </label>
              <input
                type="text"
                name="languages"
                value={profil.languages}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: Français, Anglais, Arabe"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition font-medium"
          >
            Enregistrer les modifications
          </button>
        </form>

      </div>
    </LayoutMedecin>
  );
};

export default MedecinProfil;