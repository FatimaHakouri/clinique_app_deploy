import React, { useState, useEffect } from "react";
import { createUser } from "../../../services/userService";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Layout
import Sidebar from "../../../components/SidebarA";
import TopBar from "../../../components/TopBar";

function StaffAdd() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        mot_de_passe: "",
        role: "secretaire",

        // Champs spécifiques aux médecins
        image: "",
        experiences: "",
        languages: "",
        specialiteId: "",
    });

    const [specialities, setSpecialities] = useState([]);

    // Charger les spécialités depuis le backend
    useEffect(() => {
        axios
            .get("http://localhost:8080/api/specialities")
            .then((res) => setSpecialities(res.data))
            .catch((err) => console.error("Erreur spécialités :", err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        createUser(form).then(() => {
            navigate("/admin/staff");
        });
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
                            />

                            {/* Rôle */}
                            <select
                                className="border p-3 w-full rounded-lg"
                                value={form.role}
                                onChange={(e) =>
                                    setForm({ ...form, role: e.target.value })
                                }
                                required
                            >
                                <option value="admin">Admin</option>
                                <option value="medecin">Médecin</option>
                                <option value="secretaire">Secrétaire</option>
                                <option value="patient">Patient</option>
                            </select>

                            {/* --- CHAMPS SPÉCIFIQUES AUX MÉDECINS --- */}
                            {form.role === "medecin" && (
                                <>

                                    {/* Image */}
                                    <input
                                        type="text"
                                        placeholder="URL de l'image"
                                        className="border p-3 w-full rounded-lg"
                                        value={form.image}
                                        onChange={(e) =>
                                            setForm({ ...form, image: e.target.value })
                                        }
                                    />

                                    {/* Expériences */}
                                    <input
                                        type="text"
                                        placeholder="Expériences"
                                        className="border p-3 w-full rounded-lg"
                                        value={form.experiences}
                                        onChange={(e) =>
                                            setForm({ ...form, experiences: e.target.value })
                                        }
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
                                    />

                                    {/* Spécialité */}
                                    <select
                                        className="border p-3 w-full rounded-lg"
                                        value={form.specialiteId}
                                        onChange={(e) =>
                                            setForm({ ...form, specialiteId: e.target.value })
                                        }
                                        required
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
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow">
                                + Ajouter
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default StaffAdd;
