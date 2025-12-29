import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../../services/userService";

// Layout
import Sidebar from "../../../components/SidebarA";
import TopBar from "../../../components/TopBar";

function StaffUpdate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        mot_de_passe: "",
        role: "secretaire"
    });

    useEffect(() => {
        getUserById(id).then((res) => setForm(res.data));
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateUser(id, form);
        navigate("/admin/staff");
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
                            Modifier un utilisateur
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <input
                                type="text"
                                name="nom"
                                placeholder="Nom"
                                className="border p-3 w-full rounded-lg"
                                value={form.nom}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="text"
                                name="prenom"
                                placeholder="Prénom"
                                className="border p-3 w-full rounded-lg"
                                value={form.prenom}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                className="border p-3 w-full rounded-lg"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="password"
                                name="mot_de_passe"
                                placeholder="Mot de passe"
                                className="border p-3 w-full rounded-lg"
                                value={form.mot_de_passe}
                                onChange={handleChange}
                                required
                            />

                            <select
                                name="role"
                                className="border p-3 w-full rounded-lg"
                                value={form.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="admin">Admin</option>
                                <option value="medecin">Médecin</option>
                                <option value="secretaire">Secrétaire</option>
                                <option value="patient">Patient</option>
                            </select>

                            <button
                                type="submit"
                                className="w-full bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition shadow"
                            >
                                Modifier
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default StaffUpdate;
