import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Search, Reply, Trash2, Eye, Clock, CheckCircle } from 'lucide-react';

// Layout
import Sidebar from '../../../components/SidebarA';
import TopBar from '../../../components/TopBar';

const MessagesList = () => {
    const [messages, setMessages] = useState([]);
    const [filter, setFilter] = useState('all'); // all, unreplied, replied
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    // Données mockées pour la démonstration
    const mockMessages = [
        {
            id: 1,
            name: "Mohamed Ali",
            email: "mohamed.ali@email.com",
            phone: "0612345678",
            subject: "Demande de rendez-vous",
            message: "Bonjour, je souhaite prendre un rendez-vous pour une consultation générale.",
            createdAt: "2024-01-15T10:30:00",
            replied: false
        },
        {
            id: 2,
            name: "Fatima Zahra",
            email: "fatima.zahra@email.com",
            phone: "0623456789",
            subject: "Question sur les horaires",
            message: "Quels sont vos horaires d'ouverture le weekend ?",
            createdAt: "2024-01-14T15:45:00",
            replied: true,
            repliedAt: "2024-01-14T16:30:00",
            replyMessage: "Nos horaires le weekend sont..."
        },
        {
            id: 3,
            name: "Karim Benjelloun",
            email: "karim.b@email.com",
            phone: "0634567890",
            subject: "Urgence dentaire",
            message: "J'ai une douleur dentaire intense, avez-vous un dentiste disponible ?",
            createdAt: "2024-01-14T09:15:00",
            replied: false
        }
    ];

    useEffect(() => {
        // Simulation chargement données
        setTimeout(() => {
            setMessages(mockMessages);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredMessages = messages.filter(message => {
        const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            message.subject.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filter === 'all' || 
                            (filter === 'unreplied' && !message.replied) ||
                            (filter === 'replied' && message.replied);
        
        return matchesSearch && matchesFilter;
    });

    const unrepliedCount = messages.filter(m => !m.replied).length;

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <TopBar />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Messages de contact</h1>
                            <p className="text-gray-600">
                                {unrepliedCount} message(s) non répondu(s)
                            </p>
                        </div>
                    </div>

                    {/* Filtres et recherche */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Barre de recherche */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un message..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Filtres */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg border transition ${
                                        filter === 'all' 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Tous
                                </button>
                                <button
                                    onClick={() => setFilter('unreplied')}
                                    className={`px-4 py-2 rounded-lg border transition flex items-center gap-2 ${
                                        filter === 'unreplied' 
                                        ? 'bg-red-600 text-white border-red-600' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <Clock size={16} />
                                    Non répondu
                                </button>
                                <button
                                    onClick={() => setFilter('replied')}
                                    className={`px-4 py-2 rounded-lg border transition flex items-center gap-2 ${
                                        filter === 'replied' 
                                        ? 'bg-green-600 text-white border-green-600' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <CheckCircle size={16} />
                                    Répondu
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Liste des messages */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Chargement des messages...</p>
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="p-8 text-center">
                                <Mail className="mx-auto text-gray-400" size={48} />
                                <p className="mt-2 text-gray-600">Aucun message trouvé</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredMessages.map((message) => (
                                    <div 
                                        key={message.id}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                                            selectedMessage?.id === message.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                        } ${!message.replied ? 'bg-red-50' : ''}`}
                                        onClick={() => setSelectedMessage(message)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-800">{message.name}</h3>
                                                    {!message.replied && (
                                                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                                            Non répondu
                                                        </span>
                                                    )}
                                                    {message.replied && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                            Répondu
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mb-1">{message.subject}</p>
                                                <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                                                    {message.message}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>{message.email}</span>
                                                    <span>{message.phone}</span>
                                                    <span>
                                                        {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Link
                                                    to={`/admin/messages/${message.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                                                    title="Voir et répondre"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                {!message.replied && (
                                                    <Link
                                                        to={`/admin/messages/${message.id}/reply`}
                                                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                                                        title="Répondre"
                                                    >
                                                        <Reply size={18} />
                                                    </Link>
                                                )}
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MessagesList;