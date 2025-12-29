import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';
import { Mail, Lock, LogIn, AlertCircle, Shield, Clock, Users } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      const redirectUrl = result.redirectUrl || '/';
      navigate(redirectUrl);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-wrapper">
          {/* Section présentation à gauche */}
          <div className="auth-presentation">
            <div className="presentation-content">
              <div className="presentation-icon">
                <Shield size={32} />
              </div>
              <h1>Bienvenue sur SantePlus</h1>
              <p>
                Votre plateforme de santé complète pour une gestion simplifiée 
                de vos rendez-vous et consultations médicales.
              </p>
              <ul className="features-list">
                <li>
                  <div className="feature-icon">
                    <Clock size={14} />
                  </div>
                  Prise de rendez-vous en ligne 24h/24
                </li>
                <li>
                  <div className="feature-icon">
                    <Users size={14} />
                  </div>
                  Accès à nos spécialistes qualifiés
                </li>
                
              </ul>
            </div>
          </div>

          {/* Section formulaire à droite */}
          <div className="auth-form-section">
            <div className="auth-form">
              <div className="auth-form-header">
                <div className="auth-form-icon">
                  <LogIn size={32} />
                </div>
                <h2>Connexion</h2>
              </div>
              
              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Adresse Email</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      required
                    />
                    <Mail className="input-icon" size={20} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Votre mot de passe"
                      required
                    />
                    <Lock className="input-icon" size={20} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="auth-button" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      Se connecter
                    </>
                  )}
                </button>
              </form>

              
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;