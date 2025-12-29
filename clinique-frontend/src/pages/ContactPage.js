import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Mail, Send } from 'lucide-react';
import Navbar from '../components/layout/Navbar';


const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Message envoyé avec succès ! Nous vous contacterons bientôt.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
    <>
        <Navbar /> 
        <div style={{ 
            minHeight: '100vh', 
            background: '#f8fafc',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Header */}
            <header style={{
                background: 'white',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
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
                        background: '#2563eb',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '500'
                    }}>
                        ← Retour à l'accueil
                    </Link>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#1f2937'
                    }}>Contactez-nous</h1>
                </div>
            </header>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4rem',
                    alignItems: 'start'
                }}>
                    {/* Informations de contact */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            marginBottom: '1rem'
                        }}>
                            Prendre Contact
                        </h2>
                        <p style={{
                            color: '#6b7280',
                            marginBottom: '2rem',
                            lineHeight: '1.6'
                        }}>
                            Notre équipe est à votre disposition pour répondre 
                            à toutes vos questions et prendre vos rendez-vous.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    background: '#dbeafe',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#2563eb'
                                }}>
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: '600', color: '#1f2937' }}>Téléphone</h4>
                                    <p style={{ color: '#6b7280' }}>0536-50-06-01</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    background: '#dbeafe',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#2563eb'
                                }}>
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: '600', color: '#1f2937' }}>Adresse</h4>
                                    <p style={{ color: '#6b7280' }}>12 Rue de la Santé, Oujda</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    background: '#dbeafe',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#2563eb'
                                }}>
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: '600', color: '#1f2937' }}>Email</h4>
                                    <p style={{ color: '#6b7280' }}>contact@clinique-santeplus.ma</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    background: '#dbeafe',
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#2563eb'
                                }}>
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: '600', color: '#1f2937' }}>Horaires</h4>
                                    <p style={{ color: '#6b7280' }}>
                                        Lun - Ven: 8h-20h<br />
                                        Samedi: 8h-14h<br />
                                        Urgences: 24h/24
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Formulaire de contact */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '1rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            marginBottom: '1.5rem'
                        }}>
                            Envoyez-nous un Message
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Votre nom"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem'
                                    }}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Votre email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <input
                                type="tel"
                                name="phone"
                                placeholder="Votre téléphone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{
                                    padding: '0.75rem 1rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem'
                                }}
                            />

                            <input
                                type="text"
                                name="subject"
                                placeholder="Sujet du message"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                style={{
                                    padding: '0.75rem 1rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem'
                                }}
                            />

                            <textarea
                                name="message"
                                placeholder="Votre message..."
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                style={{
                                    padding: '0.75rem 1rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />

                            <button type="submit" style={{
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '50px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                justifyContent: 'center',
                                marginTop: '1rem'
                            }}>
                                Envoyer le Message <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    </>
    );
};

export default ContactPage;