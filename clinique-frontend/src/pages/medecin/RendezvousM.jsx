// src/pages/medecin/Rendezvous.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/SidebarM";
import TopBar from "../../components/TopBar";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const Rendezvous = () => {
    const { user } = useAuth(); // { id, nom, prenom, email, role, ... }
    const [rendezvous, setRendezvous] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRendezvous = async () => {
            if (!user || !user.id) {
                setError("Aucun médecin connecté.");
                setLoading(false);
                return;
            }

            try {
                // ✅ Appel au bon endpoint
                const response = await axios.get(
                    `http://localhost:8080/api/medecins/medecin/rendezvous/${user.id}`
                );

                setRendezvous(response.data); // Assurez-vous que c'est un tableau
            } catch (err) {
                console.error("Erreur lors du chargement des rendez-vous :", err);
                setError("Impossible de charger vos rendez-vous. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchRendezvous();
    }, [user]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <TopBar />
                    <div className="p-6">Chargement de vos rendez-vous...</div>
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
                    <div className="p-6 text-red-600">⚠️ {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <TopBar />
                <div className="bg-white p-6 rounded-xl shadow-sm mx-6 mt-4">
                    <h1 className="text-2xl font-bold mb-4 text-gray-800">
                        📅 Mes Rendez-vous
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Voici la liste de vos rendez-vous programmés.
                    </p>

                    {rendezvous.length === 0 ? (
                        <p className="text-gray-500 italic">Aucun rendez-vous trouvé.</p>
                    ) : (
                        <table className="w-full border border-gray-200 rounded-lg text-sm">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="py-2 px-3 text-left">Patient</th>
                                    <th className="py-2 px-3 text-left">Date</th>
                                    <th className="py-2 px-3 text-left">Heure</th>
                                    <th className="py-2 px-3 text-left">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rendezvous.map((rdv) => (
                                    <tr key={rdv.id} className="border-t hover:bg-gray-50">
                                        <td className="py-2 px-3">
                                            {rdv.patient?.nom || ""} {rdv.patient?.prenom || ""}
                                        </td>
                                        <td className="py-2 px-3">{formatDate(rdv.date)}</td>
                                        <td className="py-2 px-3">{rdv.slot}</td>
                                        <td className="py-2 px-3">
                                            <span className="text-green-600 font-semibold">Confirmé</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Rendezvous;