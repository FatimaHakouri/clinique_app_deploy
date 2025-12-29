import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Layout
import Sidebar from "../../../components/SidebarA";
import TopBar from "../../../components/TopBar";

// Ajoutez cette importation pour le tracker
import { trackUserAction, ActivityType } from "../../../services/activityTracker";

function StaffUpdate() {
    const { id } = useParams();
    const navigate = useNavigate();

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
        medecinId: ""
    });

    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [originalData, setOriginalData] = useState(null); // Pour comparer les changements
    const [userDataForTracking, setUserDataForTracking] = useState(null); // Pour conserver les données originales

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Charger les spécialités
                const specialitiesRes = await axios.get("http://localhost:8080/api/specialities");
                setSpecialities(specialitiesRes.data);

                // Charger les données de l'utilisateur
                const userRes = await axios.get(`http://localhost:8080/api/users/${id}`);
                const userData = userRes.data;

                console.log("📋 Données utilisateur:", userData);
                
                // Sauvegarder les données originales pour le tracking
                setUserDataForTracking(userData);

                // Remplir le formulaire avec les données de base
                const formData = {
                    nom: userData.nom || "",
                    prenom: userData.prenom || "",
                    email: userData.email || "",
                    mot_de_passe: "", // Toujours vide pour la sécurité
                    role: userData.role || "secretaire",
                    image: "",
                    experiences: "",
                    languages: "",
                    specialiteId: "",
                    medecinId: ""
                };

                // Si c'est un médecin, charger les données supplémentaires
                if (userData.role === "medecin") {
                    try {
                        const medecinRes = await axios.get(`http://localhost:8080/api/medecins/user/${userData.id}`);
                        const medecinData = medecinRes.data;
                        
                        console.log("👨‍⚕️ Données médecin:", medecinData);

                        formData.image = medecinData.image || "";
                        formData.experiences = medecinData.experiences || "";
                        formData.languages = medecinData.languages || "";
                        formData.specialiteId = medecinData.specialite?.id || "";
                        formData.medecinId = medecinData.id || "";
                    } catch (error) {
                        console.error("❌ Erreur chargement données médecin:", error);
                    }
                }

                setForm(formData);
                setOriginalData(formData); // Sauvegarder les données originales

            } catch (error) {
                console.error("❌ Erreur chargement données:", error);
                alert("Erreur lors du chargement des données");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Fonction pour détecter les changements
    const detectChanges = () => {
        if (!originalData) return { hasChanges: false, changes: {} };
        
        const changes = {};
        let hasChanges = false;
        
        const fieldsToCheck = ['nom', 'prenom', 'email', 'role', 'image', 'experiences', 'languages', 'specialiteId'];
        
        fieldsToCheck.forEach(field => {
            if (form[field] !== originalData[field]) {
                changes[field] = {
                    from: originalData[field] || '(vide)',
                    to: form[field] || '(vide)'
                };
                hasChanges = true;
            }
        });
        
        // Vérifier si le mot de passe a été changé
        if (form.mot_de_passe && form.mot_de_passe.trim() !== "") {
            changes.mot_de_passe = { changed: true };
            hasChanges = true;
        }
        
        return { hasChanges, changes };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Vérifier les changements
        const { hasChanges, changes } = detectChanges();
        if (!hasChanges) {
            if (window.confirm("Aucun changement détecté. Voulez-vous quand même continuer ?")) {
                navigate("/admin/staff");
            }
            return;
        }
        
        setSaving(true);

        try {
            console.log("🚀 Données soumises:", form);
            console.log("📝 Changements détectés:", changes);

            if (form.role === "medecin") {
                // CAS MÉDECIN
                const medecinData = {
                    nom: form.nom,
                    prenom: form.prenom,
                    email: form.email,
                    image: form.image,
                    experiences: form.experiences,
                    languages: form.languages,
                    specialiteId: form.specialiteId
                };

                // Ajouter le mot de passe seulement s'il est saisi
                if (form.mot_de_passe && form.mot_de_passe.trim() !== "") {
                    medecinData.mot_de_passe = form.mot_de_passe;
                }

                let response;
                if (form.medecinId) {
                    // Mettre à jour un médecin existant
                    response = await axios.put(`http://localhost:8080/api/medecins/${form.medecinId}`, medecinData);
                } else {
                    // Créer un nouveau médecin
                    response = await axios.post(`http://localhost:8080/api/medecins`, medecinData);
                }
                
                // TRACKER L'ACTIVITÉ POUR MÉDECIN
                trackDoctorUpdate(originalData, form, changes, response.data);

            } else {
                // CAS UTILISATEUR NORMAL
                const userData = {
                    nom: form.nom,
                    prenom: form.prenom,
                    email: form.email,
                    role: form.role
                };

                // Ajouter le mot de passe seulement s'il est saisi
                if (form.mot_de_passe && form.mot_de_passe.trim() !== "") {
                    userData.mot_de_passe = form.mot_de_passe;
                }

                const response = await axios.put(`http://localhost:8080/api/users/${id}`, userData);
                
                // TRACKER L'ACTIVITÉ POUR UTILISATEUR
                trackUserUpdate(originalData, form, changes, response.data);
            }

            alert("✅ Utilisateur mis à jour avec succès");
            navigate("/admin/staff");

        } catch (error) {
            console.error("❌ Erreur détaillée:", error);
            console.error("📡 Réponse erreur:", error.response?.data);
            alert("❌ Erreur lors de la mise à jour: " + 
                  (error.response?.data?.message || error.response?.data || error.message));
        } finally {
            setSaving(false);
        }
    };

    // Fonction pour tracker la modification d'un médecin
    const trackDoctorUpdate = (originalData, newData, changes, responseData) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Construire le message des changements
        let changesDescription = "Modifications: ";
        const changeList = [];
        
        if (changes.nom) changeList.push(`Nom: ${changes.nom.from} → ${changes.nom.to}`);
        if (changes.prenom) changeList.push(`Prénom: ${changes.prenom.from} → ${changes.prenom.to}`);
        if (changes.email) changeList.push(`Email: ${changes.email.from} → ${changes.email.to}`);
        if (changes.mot_de_passe) changeList.push("Mot de passe modifié");
        if (changes.experiences) changeList.push(`Expériences modifiées`);
        if (changes.languages) changeList.push(`Langues: ${changes.languages.from} → ${changes.languages.to}`);
        if (changes.specialiteId) {
            const oldSpec = specialities.find(s => s.id == changes.specialiteId.from)?.title || changes.specialiteId.from;
            const newSpec = specialities.find(s => s.id == changes.specialiteId.to)?.title || changes.specialiteId.to;
            changeList.push(`Spécialité: ${oldSpec} → ${newSpec}`);
        }
        
        changesDescription += changeList.join(', ');
        
        trackUserAction({
            type: ActivityType.USER_UPDATE,
            title: 'Médecin modifié',
            description: `Dr. ${newData.prenom} ${newData.nom} a été mis à jour`,
            details: changesDescription,
            userId: currentUser.id || 'admin',
            userName: currentUser.name || 'Administrateur',
            userRole: currentUser.role || 'admin',
            entityId: responseData.id || id,
            entityName: `Dr. ${newData.prenom} ${newData.nom}`,
            metadata: {
                changes: changes,
                role: 'medecin',
                specialiteId: newData.specialiteId
            }
        });
    };

    // Fonction pour tracker la modification d'un utilisateur
    const trackUserUpdate = (originalData, newData, changes, responseData) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        let changesDescription = "Modifications: ";
        const changeList = [];
        
        if (changes.nom) changeList.push(`Nom: ${changes.nom.from} → ${changes.nom.to}`);
        if (changes.prenom) changeList.push(`Prénom: ${changes.prenom.from} → ${changes.prenom.to}`);
        if (changes.email) changeList.push(`Email: ${changes.email.from} → ${changes.email.to}`);
        if (changes.mot_de_passe) changeList.push("Mot de passe modifié");
        if (changes.role) changeList.push(`Rôle: ${getRoleLabel(changes.role.from)} → ${getRoleLabel(changes.role.to)}`);
        
        changesDescription += changeList.join(', ');
        
        trackUserAction({
            type: ActivityType.USER_UPDATE,
            title: 'Utilisateur modifié',
            description: `${newData.prenom} ${newData.nom} a été mis à jour`,
            details: changesDescription,
            userId: currentUser.id || 'admin',
            userName: currentUser.name || 'Administrateur',
            userRole: currentUser.role || 'admin',
            entityId: responseData.id || id,
            entityName: `${newData.prenom} ${newData.nom}`,
            metadata: {
                changes: changes,
                role: newData.role
            }
        });
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

    if (loading) {
        return <div className="p-6">Chargement...</div>;
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="p-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6">
                            Modifier {form.role === 'medecin' ? 'le médecin' : 'l\'utilisateur'}
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Champs de base */}
                            <input 
                                type="text" 
                                placeholder="Nom" 
                                className="border p-3 w-full rounded-lg"
                                value={form.nom} 
                                onChange={(e) => setForm({...form, nom: e.target.value})} 
                                required 
                                disabled={saving}
                            />

                            <input 
                                type="text" 
                                placeholder="Prénom" 
                                className="border p-3 w-full rounded-lg"
                                value={form.prenom} 
                                onChange={(e) => setForm({...form, prenom: e.target.value})} 
                                required 
                                disabled={saving}
                            />

                            <input 
                                type="email" 
                                placeholder="Email" 
                                className="border p-3 w-full rounded-lg"
                                value={form.email} 
                                onChange={(e) => setForm({...form, email: e.target.value})} 
                                required 
                                disabled={saving}
                            />

                            <input 
                                type="password" 
                                placeholder="Mot de passe (laisser vide pour ne pas modifier)" 
                                className="border p-3 w-full rounded-lg" 
                                value={form.mot_de_passe} 
                                onChange={(e) => setForm({...form, mot_de_passe: e.target.value})} 
                                disabled={saving}
                            />

                            <select 
                                className="border p-3 w-full rounded-lg" 
                                value={form.role} 
                                onChange={(e) => setForm({...form, role: e.target.value})} 
                                required
                                disabled={saving}
                            >
                                <option value="admin">Admin</option>
                                <option value="medecin">Médecin</option>
                                <option value="secretaire">Secrétaire</option>
                                <option value="patient">Patient</option>
                            </select>

                            {/* Champs médecin */}
                            {form.role === "medecin" && (
                                <>
                                    <input 
                                        type="text" 
                                        placeholder="URL Image" 
                                        className="border p-3 w-full rounded-lg"
                                        value={form.image} 
                                        onChange={(e) => setForm({...form, image: e.target.value})} 
                                        disabled={saving}
                                    />

                                    <textarea 
                                        placeholder="Expériences" 
                                        className="border p-3 w-full rounded-lg" 
                                        rows="3"
                                        value={form.experiences} 
                                        onChange={(e) => setForm({...form, experiences: e.target.value})} 
                                        disabled={saving}
                                    />

                                    <input 
                                        type="text" 
                                        placeholder="Langues (ex: Français, Anglais)" 
                                        className="border p-3 w-full rounded-lg" 
                                        value={form.languages} 
                                        onChange={(e) => setForm({...form, languages: e.target.value})} 
                                        disabled={saving}
                                    />

                                    <select 
                                        className="border p-3 w-full rounded-lg" 
                                        value={form.specialiteId} 
                                        onChange={(e) => setForm({...form, specialiteId: e.target.value})} 
                                        required
                                        disabled={saving}
                                    >
                                        <option value="">Sélectionner une spécialité</option>
                                        {specialities.map((sp) => (
                                            <option key={sp.id} value={sp.id}>{sp.title}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Modification..." : "Modifier"}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => navigate("/admin/staff")}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default StaffUpdate;