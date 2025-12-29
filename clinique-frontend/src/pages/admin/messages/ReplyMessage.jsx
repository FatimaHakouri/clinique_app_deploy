import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mail } from 'lucide-react';

// Layout
import Sidebar from '../../../components/SidebarA';
import TopBar from '../../../components/TopBar';

const ReplyMessage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    // Données mockées
    const originalMessage = {
        id: 1,
        name: "Mohamed Ali",
        email: "mohamed.ali@email.com",
        subject: "Demande de rendez-vous"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        // Simulation envoi
        setTimeout(() => {
            alert('Réponse envoyée avec succès !');
            setSending(false);
            navigate('/admin/messages');
        }, 2000);
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <TopBar />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Link
                            to={`/admin/messages/${id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Répondre au message</h1>
                            <p className="text-gray-600">À {originalMessage.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Formulaire de réponse */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message original
                                    </label>
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Mail size={16} className="text-gray-400" />
                                            <span className="font-medium">{originalMessage.name}</span>
                                            <span className="text-gray-500">({originalMessage.email})</span>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            Sujet: {originalMessage.subject}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                                        Votre réponse *
                                    </label>
                                    <textarea
                                        id="reply"
                                        rows="12"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Tapez votre réponse ici..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={sending || !replyText.trim()}
                                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Envoi...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Envoyer la réponse
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        to={`/admin/messages/${id}`}
                                        className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition"
                                    >
                                        Annuler
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Aide */}
                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-800 mb-2">Conseils de réponse</h3>
                                <ul className="text-blue-700 text-sm space-y-1">
                                    <li>• Soyez courtois et professionnel</li>
                                    <li>• Répondez à toutes les questions</li>
                                    <li>• Proposez des solutions concrètes</li>
                                    <li>• Incluez vos coordonnées si nécessaire</li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Destinataire</h3>
                                <div className="text-sm text-gray-600">
                                    <p><strong>Nom:</strong> {originalMessage.name}</p>
                                    <p><strong>Email:</strong> {originalMessage.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReplyMessage;