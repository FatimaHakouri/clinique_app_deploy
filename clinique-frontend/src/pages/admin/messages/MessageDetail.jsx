import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Reply, Trash2 } from 'lucide-react';

// Layout
import Sidebar from '../../../components/SidebarA';
import TopBar from '../../../components/TopBar';

const MessageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    // Données mockées
    const mockMessage = {
        id: 1,
        name: "Mohamed Ali",
        email: "mohamed.ali@email.com",
        phone: "0612345678",
        subject: "Demande de rendez-vous",
        message: "Bonjour, je souhaite prendre un rendez-vous pour une consultation générale. J'ai des maux de tête persistants depuis une semaine et je voudrais consulter un médecin. Quels sont vos disponibilités cette semaine ?",
        createdAt: "2024-01-15T10:30:00",
        replied: false
    };

    useEffect(() => {
        setTimeout(() => {
            setMessage(mockMessage);
            setLoading(false);
        }, 500);
    }, [id]);

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
            // Logique de suppression
            navigate('/admin/messages');
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <TopBar />
                    <main className="p-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!message) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <TopBar />
                    <main className="p-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-800">Message non trouvé</h2>
                            <Link to="/admin/messages" className="text-blue-600 hover:underline">
                                Retour à la liste
                            </Link>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <TopBar />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            to="/admin/messages"
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Détail du message</h1>
                            <p className="text-gray-600">Message de {message.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Message principal */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">{message.subject}</h2>
                                    {!message.replied && (
                                        <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                                            Non répondu
                                        </span>
                                    )}
                                </div>

                                <div className="prose max-w-none mb-6">
                                    <p className="text-gray-700 whitespace-pre-line">{message.message}</p>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-3">
                                            <Mail className="text-gray-400" size={18} />
                                            <span className="text-gray-600">{message.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="text-gray-400" size={18} />
                                            <span className="text-gray-600">{message.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="text-gray-400" size={18} />
                                            <span className="text-gray-600">
                                                {new Date(message.createdAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
                                <div className="space-y-3">
                                    {!message.replied && (
                                        <Link
                                            to={`/admin/messages/${message.id}/reply`}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                        >
                                            <Reply size={18} />
                                            Répondre
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleDelete}
                                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Supprimer
                                    </button>
                                </div>
                            </div>

                            {/* Informations expéditeur */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Expéditeur</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">Nom:</span>
                                        <p className="text-gray-800">{message.name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Email:</span>
                                        <p className="text-gray-800">{message.email}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Téléphone:</span>
                                        <p className="text-gray-800">{message.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MessageDetail;