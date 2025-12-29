import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Clock, MapPin, AlertTriangle, Ambulance } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
const EmergencyPage = () => {
    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Header */}
            <Navbar />
            <header style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '1rem 0',
                marginBottom: '2rem'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem'
                }}>
                    <Link to="/" style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '500',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                        ← Retour à l'accueil
                    </Link>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                    }}>Service d'Urgence</h1>
                </div>
            </header>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        textAlign: 'center',
                        marginBottom: '4rem'
                    }}
                >
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '1rem 2rem',
                        borderRadius: '50px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                        <AlertTriangle size={24} />
                        <span style={{ fontWeight: '600' }}>URGENCES 24h/24</span>
                    </div>

                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                    }}>
                        Service d'Urgence Médicale
                    </h2>
                    <p style={{
                        fontSize: '1.25rem',
                        opacity: '0.9',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Notre service d'urgence est disponible en permanence 
                        pour prendre en charge toutes les situations critiques.
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginBottom: '4rem'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '2rem',
                            borderRadius: '1rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            textAlign: 'center'
                        }}
                    >
                        <Phone size={48} style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            Appel d'Urgence
                        </h3>
                        <p style={{ marginBottom: '1.5rem', opacity: '0.9' }}>
                            Composez le numéro d'urgence pour une prise en charge immédiate
                        </p>
                        <div style={{
                            background: 'white',
                            color: '#dc2626',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            0536-50-06-01
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '2rem',
                            borderRadius: '1rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            textAlign: 'center'
                        }}
                    >
                        <Ambulance size={48} style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            Ambulance
                        </h3>
                        <p style={{ marginBottom: '1.5rem', opacity: '0.9' }}>
                            Service d'ambulance disponible 24h/24 pour les transports urgents
                        </p>
                        <div style={{
                            background: 'white',
                            color: '#dc2626',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            fontSize: '1.25rem',
                            fontWeight: 'bold'
                        }}>
                            Même numéro
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '2rem',
                            borderRadius: '1rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            textAlign: 'center'
                        }}
                    >
                        <Clock size={48} style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            Disponibilité
                        </h3>
                        <p style={{ marginBottom: '1.5rem', opacity: '0.9' }}>
                            Service d'urgence ouvert 7j/7, 24h/24 sans interruption
                        </p>
                        <div style={{
                            background: 'white',
                            color: '#dc2626',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            fontSize: '1.25rem',
                            fontWeight: 'bold'
                        }}>
                            24h/24 - 7j/7
                        </div>
                    </motion.div>
                </div>

                {/* Informations importantes */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '2rem',
                        borderRadius: '1rem',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        Informations Importantes
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <MapPin size={20} />
                            <span><strong>Adresse:</strong> 12 Rue de la Santé, Oujda</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Phone size={20} />
                            <span><strong>Téléphone:</strong> 0536-50-06-01</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Clock size={20} />
                            <span><strong>Horaires urgences:</strong> 24h/24, 7j/7</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem' }}>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>⚠️ En cas d'urgence vitale :</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>• Composez immédiatement le 0536-50-06-01</li>
                            <li>• Ne vous déplacez pas seul si votre état est critique</li>
                            <li>• Ayez vos documents médicaux à portée de main</li>
                            <li>• Signalez les allergies et traitements en cours</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EmergencyPage;