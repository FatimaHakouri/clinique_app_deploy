import React, { useState, useEffect } from "react";
import { createUser } from "../../../services/userService";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Layout
import Sidebar from "../../../components/SidebarA";
import TopBar from "../../../components/TopBar";

// Ajoutez cette importation pour le tracker
import { trackUserAction, ActivityType } from "../../../services/activityTracker";

function StaffAdd() {
    const navigate = useNavigate();

    // URL par défaut pour les médecins
    const defaultDoctorImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        mot_de_passe: "",
        role: "secretaire",
        image: "",
        experiences: "",
        languages: "",
        specialiteId: "",
    });

    const [specialities, setSpecialities] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Charger les spécialités depuis le backend
    useEffect(() => {
        axios
            .get("http://localhost:8080/api/specialities")
            .then((res) => setSpecialities(res.data))
            .catch((err) => console.error("Erreur spécialités :", err));
    }, []);

    // Effet pour mettre à jour l'image quand le rôle devient "medecin"
    useEffect(() => {
        if (form.role === "medecin") {
            setForm(prev => ({
                ...prev,
                image: defaultDoctorImage
            }));
        } else {
            setForm(prev => ({
                ...prev,
                image: ""
            }));
        }
    }, [form.role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // S'assurer que l'image est bien définie pour les médecins
            const userData = { ...form };
            if (form.role === "medecin" && !userData.image) {
                userData.image = defaultDoctorImage;
            }

            // Créer l'utilisateur
            const createdUser = await createUser(userData);
            
            // Récupérer l'utilisateur actuel (admin)
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            
            // TRACKER L'ACTIVITÉ - Ajoutez cette partie
            trackUserAction({
                type: ActivityType.USER_CREATE,
                title: `${form.role === 'medecin' ? 'Médecin' : 'Utilisateur'} ajouté`,
                description: `${form.prenom} ${form.nom} a été ajouté comme ${getRoleLabel(form.role)}`,
                details: `Email: ${form.email}, Rôle: ${getRoleLabel(form.role)}${form.role === 'medecin' && form.specialiteId ? `, Spécialité ID: ${form.specialiteId}` : ''}`,
                userId: currentUser.id || 'admin',
                userName: currentUser.name || 'Administrateur',
                userRole: currentUser.role || 'admin',
                entityId: createdUser.id || Date.now(),
                entityName: `${form.prenom} ${form.nom}`,
                metadata: {
                    role: form.role,
                    email: form.email,
                    specialiteId: form.specialiteId || null
                }
            });

            // Naviguer vers la liste du staff
            navigate("/admin/staff");
            
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'utilisateur:", error);
            alert("Une erreur est survenue lors de l'ajout de l'utilisateur.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fonction pour obtenir le label du rôle
    const getRoleLabel = (role) => {
        const roles = {
            admin: 'Administrateur',
            medecin: 'Médecin',
            secretaire: 'Secrétaire',
            patient: 'Patient'
        };
        return roles[role] || role;
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col">

                {/* TopBar */}
                <TopBar />

                {/* Main content */}
                <main className="p-6 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">
                            Ajouter un utilisateur
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Nom */}
                            <input
                                type="text"
                                placeholder="Nom"
                                className="border p-3 w-full rounded-lg"
                                value={form.nom}
                                onChange={(e) =>
                                    setForm({ ...form, nom: e.target.value })
                                }
                                required
                                disabled={isSubmitting}
                            />

                            {/* Prénom */}
                            <input
                                type="text"
                                placeholder="Prénom"
                                className="border p-3 w-full rounded-lg"
                                value={form.prenom}
                                onChange={(e) =>
                                    setForm({ ...form, prenom: e.target.value })
                                }
                                required
                                disabled={isSubmitting}
                            />

                            {/* Email */}
                            <input
                                type="email"
                                placeholder="Email"
                                className="border p-3 w-full rounded-lg"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                required
                                disabled={isSubmitting}
                            />

                            {/* Mot de passe */}
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                className="border p-3 w-full rounded-lg"
                                value={form.mot_de_passe}
                                onChange={(e) =>
                                    setForm({ ...form, mot_de_passe: e.target.value })
                                }
                                required
                                disabled={isSubmitting}
                            />

                            {/* Rôle */}
                            <select
                                className="border p-3 w-full rounded-lg"
                                value={form.role}
                                onChange={(e) =>
                                    setForm({ ...form, role: e.target.value })
                                }
                                required
                                disabled={isSubmitting}
                            >
                                <option value="admin">Admin</option>
                                <option value="medecin">Médecin</option>
                                <option value="secretaire">Secrétaire</option>
                                <option value="patient">Patient</option> 
                            </select>

                            {/* --- CHAMPS SPÉCIFIQUES AUX MÉDECINS --- */}
                            {form.role === "medecin" && (
                                <>
                                    {/* Champ image caché */}
                                    <input
                                        type="hidden"
                                        value={form.image}
                                    />

                                    {/* Note pour indiquer que l'image est définie automatiquement */}
                                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                        <span className="font-medium">Note :</span> Une image par défaut a été automatiquement assignée au médecin.
                                    </div>

                                    {/* Expériences */}
                                    <input
                                        type="text"
                                        placeholder="Expériences"
                                        className="border p-3 w-full rounded-lg"
                                        value={form.experiences}
                                        onChange={(e) =>
                                            setForm({ ...form, experiences: e.target.value })
                                        }
                                        disabled={isSubmitting}
                                    />

                                    {/* Langues */}
                                    <input
                                        type="text"
                                        placeholder="Langues (ex: fr,en,ar)"
                                        className="border p-3 w-full rounded-lg"
                                        value={form.languages}
                                        onChange={(e) =>
                                            setForm({ ...form, languages: e.target.value })
                                        }
                                        disabled={isSubmitting}
                                    />

                                    {/* Spécialité */}
                                    <select
                                        className="border p-3 w-full rounded-lg"
                                        value={form.specialiteId}
                                        onChange={(e) =>
                                            setForm({ ...form, specialiteId: e.target.value })
                                        }
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Sélectionner une spécialité</option>
                                        {specialities.map((sp) => (
                                            <option key={sp.id} value={sp.id}>
                                                {sp.title}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {/* Bouton ajouter */}
                            <button 
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow disabled:bg-green-400 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Ajout en cours..." : "+ Ajouter"}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default StaffAdd;