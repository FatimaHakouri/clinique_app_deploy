// src/pages/admin/specialities/EditSpeciality.jsx

import React, { useState, useEffect } from "react";
import { getSpecialityById, updateSpeciality } from "../../../services/specialityService";
import { useParams, useNavigate } from "react-router-dom";

// Ajoutez cette importation pour le tracker
import { trackSpecialiteAction } from "../../../services/activityTracker";

// Layout
import Sidebar from "../../../components/SidebarA";
import TopBar from "../../../components/TopBar";

function EditSpeciality() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        description: "",
        details: "",
        iconName: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [originalData, setOriginalData] = useState(null); // Pour comparer les changements

    useEffect(() => {
        getSpecialityById(id).then(data => {
            setForm(data);
            setOriginalData(data); // Sauvegarder les données originales
        });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Vérifier s'il y a des changements
            const hasChanges = originalData && (
                originalData.title !== form.title ||
                originalData.description !== form.description ||
                originalData.details !== form.details ||
                originalData.iconName !== form.iconName
            );
            
            if (!hasChanges) {
                alert("Aucun changement détecté.");
                navigate("/admin/specialites");
                return;
            }
            
            // Mettre à jour la spécialité
            const updatedSpeciality = await updateSpeciality(id, form);
            
            // Récupérer l'utilisateur actuel
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            
            // TRACKER L'ACTIVITÉ - Ajoutez cette ligne
            trackSpecialiteAction('update', {
                id: id,
                title: form.title,
                description: form.description,
                // Vous pouvez ajouter les changements spécifiques si vous voulez plus de détails
                changes: {
                    titleChanged: originalData?.title !== form.title,
                    descriptionChanged: originalData?.description !== form.description,
                    detailsChanged: originalData?.details !== form.details
                }
            }, currentUser.id || 'admin', currentUser.name || 'Administrateur');
            
            // Naviguer vers la liste des spécialités
            navigate("/admin/specialites");
            
        } catch (error) {
            console.error("Erreur lors de la modification de la spécialité:", error);
            alert("Une erreur est survenue lors de la modification.");
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
                            Modifier la spécialité
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <input
                                value={form.title}
                                placeholder="Titre"
                                className="border p-3 w-full rounded-lg"
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                                disabled={isSubmitting}
                            />

                            <input
                                value={form.description}
                                placeholder="Description"
                                className="border p-3 w-full rounded-lg"
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                                disabled={isSubmitting}
                            />

                            <textarea
                                value={form.details}
                                placeholder="Détails"
                                className="border p-3 w-full rounded-lg"
                                onChange={(e) => setForm({ ...form, details: e.target.value })}
                                rows="4"
                                disabled={isSubmitting}
                            />

                            <input
                                value={form.iconName}
                                placeholder="Nom de l'icône (ex: Heart, Stethoscope...)"
                                className="border p-3 w-full rounded-lg"
                                onChange={(e) => setForm({ ...form, iconName: e.target.value })}
                                disabled={isSubmitting}
                            />

                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow disabled:bg-blue-400 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Modification en cours..." : "Modifier"}
                            </button>

                        </form>
                    </div>
                </main>

            </div>
        </div>
    );
}

export default EditSpeciality;