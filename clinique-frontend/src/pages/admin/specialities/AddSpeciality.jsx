// src/pages/admin/Specialities/AddSpeciality.jsx

import React, { useState } from "react";
import { createSpeciality } from "../../../services/specialityService";
import { useNavigate } from "react-router-dom";

// Ajoutez cette importation pour le tracker
import { trackSpecialiteAction } from "../../../services/activityTracker";

// Layout
import Sidebar from "../../../components/SidebarA";
import TopBar from "../../../components/TopBar";

function AddSpeciality() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: "", description: "", details: "", iconName: "" });
    const [isSubmitting, setIsSubmitting] = useState(false); // Pour gérer l'état de soumission

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Créer la spécialité
            const newSpeciality = await createSpeciality(form);
            
            // Récupérer l'utilisateur actuel depuis localStorage ou votre système d'authentification
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            
            // TRACKER L'ACTIVITÉ - Ajoutez cette ligne
            trackSpecialiteAction('create', {
                id: newSpeciality.id || Date.now(), // Utilisez l'ID retourné par l'API ou générez-en un
                title: form.title,
                description: form.description
            }, currentUser.id || 'admin', currentUser.name || 'Administrateur');
            
            // Naviguer vers la liste des spécialités
            navigate("/admin/specialites");
            
        } catch (error) {
            console.error("Erreur lors de l'ajout de la spécialité:", error);
            // Vous pourriez aussi tracker les erreurs si vous le souhaitez
            // trackSpecialiteAction('error', { title: form.title }, 'system', 'Système');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            
            <Sidebar />

            <div className="flex-1 flex flex-col">
                
                <TopBar />

                <main className="p-6 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm max-w-3xl">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800">
                            Ajouter une spécialité
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <input
                                placeholder="Titre"
                                className="border p-3 w-full rounded-lg"
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                                disabled={isSubmitting}
                            />

                            <input
                                placeholder="Description"
                                className="border p-3 w-full rounded-lg"
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                                disabled={isSubmitting}
                            />

                            <textarea
                                placeholder="Détails"
                                className="border p-3 w-full rounded-lg"
                                onChange={(e) => setForm({ ...form, details: e.target.value })}
                                rows="4"
                                disabled={isSubmitting}
                            />

                            <input
                                placeholder="Nom de l'icône (ex: Heart, Stethoscope...)"
                                className="border p-3 w-full rounded-lg"
                                onChange={(e) => setForm({ ...form, iconName: e.target.value })}
                                disabled={isSubmitting}
                            />

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

export default AddSpeciality;