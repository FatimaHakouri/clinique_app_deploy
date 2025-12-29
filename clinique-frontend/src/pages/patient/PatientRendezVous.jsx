// src/pages/patient/PatientRendezVous.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarP from "../../components/SidebarP";
import TopBar from "../../components/TopBar";
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, User, Stethoscope, MapPin, ChevronLeft, ChevronRight, ExternalLink, AlertCircle, Info, Phone, Mail } from "lucide-react";

const PatientRendezVous = () => {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [selectedRendezVous, setSelectedRendezVous] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" ou "list"
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'patient') {
      fetchPatientData(user.email);
    }
  }, [user]);

  const fetchPatientData = async (email) => {
    try {
      console.log("🔍 Fetching patient data for email:", email);
      const response = await fetch(`http://localhost:8080/api/patients/email/${email}`);
      if (response.ok) {
        const patientData = await response.json();
        console.log("✅ Patient data:", patientData);
        setPatient(patientData);
        fetchRendezVous(patientData.id);
      } else {
        console.error("❌ Patient not found");
        setLoading(false);
      }
    } catch (error) {
      console.error("💥 Error loading patient:", error);
      setLoading(false);
    }
  };

  const fetchRendezVous = async (patientId) => {
    try {
      console.log("🔄 Fetching rendez-vous for patient ID:", patientId);
      const response = await fetch(`http://localhost:8080/rendezvous/patient/${patientId}`);
      console.log("📡 Response status:", response.status);
      
      if (response.ok) {
        const rdvData = await response.json();
        console.log("✅ Rendez-vous data received (RAW):", rdvData);
        
        // DEBUG: Afficher le premier rendez-vous pour comprendre la structure
        if (rdvData.length > 0) {
          const firstRdv = rdvData[0];
          console.log("🔍 Détails du premier rendez-vous:");
          console.log("Date (LocalDate):", firstRdv.date);
          console.log("Type de date:", typeof firstRdv.date);
          console.log("Slot (heure):", firstRdv.slot);
          console.log("Date parsée JS:", new Date(firstRdv.date));
        }
        
        // Trier les rendez-vous par date (du plus récent au plus ancien)
        const sortedRendezVous = rdvData.sort((a, b) => {
          try {
            // LocalDate n'a pas d'heure, donc on compare juste les dates
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);
            return dateB - dateA; // Du plus récent au plus ancien
          } catch (e) {
            console.error("Erreur de tri:", e);
            return 0;
          }
        });
        
        console.log("📊 Rendez-vous triés:", sortedRendezVous);
        setRendezVous(sortedRendezVous);
      } else {
        console.error("❌ Error response:", response.status);
      }
    } catch (error) {
      console.error("💥 Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour combiner date et slot en un objet Date JavaScript
  const combineDateAndSlot = (dateString, slot) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      
      // Extraire l'heure du slot
      if (slot) {
        const timeMatch = slot.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          date.setHours(hours, minutes, 0, 0);
        }
      }
      
      return date;
    } catch (error) {
      console.error("❌ Erreur combineDateAndSlot:", error);
      return new Date(dateString); // Fallback
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date non précisée";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error("❌ Erreur de formatage de date:", dateString);
      return "Date invalide";
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return "";
    }
  };

  const formatDateTime = (dateString, slot) => {
    if (!dateString) return "Date/heure non précisée";
    try {
      const date = combineDateAndSlot(dateString, slot);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Date/heure invalide";
    }
  };

  const formatTime = (dateString, slot) => {
    console.log("🕒 formatTime appelée avec:", { dateString, slot });
    
    if (!dateString) {
      return slot || "Heure non précisée";
    }
    
    // Si slot est disponible, l'utiliser directement
    if (slot) {
      // Nettoyer le format du slot
      const cleanSlot = slot.replace('h', ':');
      console.log("✅ Utilisation du slot:", cleanSlot);
      return cleanSlot;
    }
    
    // Sinon, essayer d'extraire de la date
    try {
      const date = new Date(dateString);
      const timeString = date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      // Si l'heure est 00:00 ou 01:00 (valeurs par défaut), ne pas l'afficher
      if (timeString === '00:00' || timeString === '01:00') {
        return "Heure non précisée";
      }
      
      return timeString;
    } catch (error) {
      return "Heure non disponible";
    }
  };

  const getDayOfWeek = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } catch (error) {
      return "";
    }
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const getStatus = (dateString) => {
    if (!dateString) return { text: "Inconnu", color: "bg-gray-100 text-gray-800", icon: "❓" };
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const rdvDate = new Date(date);
      rdvDate.setHours(0, 0, 0, 0);
      
      if (rdvDate < today) {
        return { text: "Terminé", color: "bg-gray-100 text-gray-800", icon: "✅" };
      } else if (rdvDate.getTime() === today.getTime()) {
        return { text: "Aujourd'hui", color: "bg-blue-100 text-blue-800", icon: "📌" };
      } else {
        return { text: "À venir", color: "bg-green-100 text-green-800", icon: "📅" };
      }
    } catch (e) {
      return { text: "Erreur", color: "bg-red-100 text-red-800", icon: "⚠️" };
    }
  };

  const getRendezVousForMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    return rendezVous.filter(rdv => {
      try {
        if (!rdv.date) return false;
        const rdvDate = new Date(rdv.date);
        return rdvDate.getFullYear() === year && rdvDate.getMonth() === month;
      } catch (e) {
        return false;
      }
    });
  };

  const getRendezVousForDate = (date) => {
    const targetDate = date.getDate();
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();
    
    return rendezVous.filter(rdv => {
      try {
        if (!rdv.date) return false;
        const rdvDate = new Date(rdv.date);
        return rdvDate.getDate() === targetDate &&
               rdvDate.getMonth() === targetMonth &&
               rdvDate.getFullYear() === targetYear;
      } catch (e) {
        console.error("Erreur dans getRendezVousForDate:", e);
        return false;
      }
    });
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convertir en Lundi=0
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const calendar = [];
    const today = new Date();
    
    // Ajouter les jours du mois précédent
    const prevMonthDays = firstDay;
    const prevMonth = new Date(year, month - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
    
    for (let i = prevMonthDays; i > 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i + 1);
      const dayRendezVous = getRendezVousForDate(date);
      calendar.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasRendezVous: dayRendezVous.length > 0,
        rendezVousCount: dayRendezVous.length
      });
    }
    
    // Ajouter les jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayRendezVous = getRendezVousForDate(date);
      const isToday = date.getDate() === today.getDate() && 
                     date.getMonth() === today.getMonth() && 
                     date.getFullYear() === today.getFullYear();
      
      calendar.push({
        date,
        isCurrentMonth: true,
        isToday,
        hasRendezVous: dayRendezVous.length > 0,
        rendezVousCount: dayRendezVous.length,
        rendezVous: dayRendezVous
      });
    }
    
    // Ajouter les jours du mois suivant
    const totalCells = 42; // 6 semaines * 7 jours
    const nextMonthDays = totalCells - calendar.length;
    
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      const dayRendezVous = getRendezVousForDate(date);
      calendar.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasRendezVous: dayRendezVous.length > 0,
        rendezVousCount: dayRendezVous.length
      });
    }
    
    return calendar;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (day) => {
    if (day.rendezVous && day.rendezVous.length > 0) {
      setSelectedRendezVous(day.rendezVous[0]);
    }
  };

  const handleRendezVousClick = (rdv) => {
    setSelectedRendezVous(rdv);
  };

  // Redirection si pas patient
  useEffect(() => {
    if (user && user.role !== 'patient') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'patient') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calendarDays = generateCalendar();
  const monthRendezVous = getRendezVousForMonth();
  const upcomingRendezVous = rendezVous.filter(rdv => {
    try {
      if (!rdv.date) return false;
      const rdvDate = new Date(rdv.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      rdvDate.setHours(0, 0, 0, 0);
      return rdvDate >= today;
    } catch (e) {
      return false;
    }
  });
  const pastRendezVous = rendezVous.filter(rdv => {
    try {
      if (!rdv.date) return false;
      const rdvDate = new Date(rdv.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      rdvDate.setHours(0, 0, 0, 0);
      return rdvDate < today;
    } catch (e) {
      return false;
    }
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar fixe */}
      <div className="fixed left-0 top-0 h-full z-30 w-64">
        <SidebarP />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col ml-64">
        {/* TopBar fixe */}
        <div className="fixed top-0 right-0 left-64 z-20">
          <TopBar />
        </div>

        {/* Contenu scrollable */}
        <div className="pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white mb-6 shadow-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Calendar size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Mes Rendez-vous</h1>
                    <p className="text-blue-100">
                      Gérez et visualisez tous vos rendez-vous médicaux
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.open("/medecins", "_blank")}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <Calendar size={20} />
                  Nouveau rendez-vous
                </button>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rendez-vous à venir</p>
                    <p className="text-xl font-bold text-gray-800">{upcomingRendezVous.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Clock size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ce mois-ci</p>
                    <p className="text-xl font-bold text-gray-800">{monthRendezVous.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Historique total</p>
                    <p className="text-xl font-bold text-gray-800">{rendezVous.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sélecteur de vue */}
            <div className="mb-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === "calendar" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Calendar size={18} className="inline mr-2" />
                    Calendrier
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === "list" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Clock size={18} className="inline mr-2" />
                    Liste
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    Aujourd'hui
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Chargement de vos rendez-vous...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendrier ou Liste */}
                <div className={`${selectedRendezVous ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  {viewMode === "calendar" ? (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      {/* En-tête du calendrier */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={goToPreviousMonth}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800">
                              {getMonthName(currentMonth)}
                            </h2>
                            <button
                              onClick={goToNextMonth}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600">
                            {monthRendezVous.length} rendez-vous ce mois
                          </div>
                        </div>
                      </div>

                      {/* Jours de la semaine */}
                      <div className="grid grid-cols-7 border-b border-gray-100">
                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                          <div key={day} className="p-4 text-center font-medium text-gray-500">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Grille du calendrier */}
                      <div className="grid grid-cols-7">
                        {calendarDays.map((day, index) => {
                          const status = getStatus(day.date.toISOString());
                          return (
                            <div
                              key={index}
                              onClick={() => handleDayClick(day)}
                              className={`min-h-32 border-r border-b border-gray-100 p-2 cursor-pointer transition-all hover:bg-gray-50 ${
                                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                              } ${day.isToday ? 'border-2 border-blue-500' : ''}`}
                            >
                              <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`text-sm font-medium ${
                                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                  } ${day.isToday ? 'text-blue-600 font-bold' : ''}`}>
                                    {day.date.getDate()}
                                  </span>
                                  {day.hasRendezVous && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {day.rendezVousCount}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Rendez-vous du jour */}
                                <div className="flex-1 overflow-y-auto">
                                  {day.rendezVous && day.rendezVous.slice(0, 2).map((rdv, idx) => {
                                    const rdvStatus = getStatus(rdv.date);
                                    const rdvTime = formatTime(rdv.date, rdv.slot);
                                    return (
                                      <div
                                        key={idx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRendezVousClick(rdv);
                                        }}
                                        className={`mb-1 p-2 rounded text-xs cursor-pointer hover:opacity-90 ${
                                          rdvStatus.color
                                        }`}
                                      >
                                        <div className="font-medium truncate">
                                          {rdvTime}
                                        </div>
                                        <div className="truncate">
                                          Dr. {rdv.medecin?.user?.prenom?.charAt(0)}.
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {day.rendezVous && day.rendezVous.length > 2 && (
                                    <div className="text-xs text-gray-500 text-center mt-1">
                                      +{day.rendezVous.length - 2} autres
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Vue liste */
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">Tous vos rendez-vous</h2>
                        <div className="flex space-x-2 mt-2">
                          <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                            À venir: {upcomingRendezVous.length}
                          </span>
                          <span className="text-sm px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                            Passés: {pastRendezVous.length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                        {rendezVous.length > 0 ? (
                          <>
                            {/* Rendez-vous à venir */}
                            {upcomingRendezVous.length > 0 && (
                              <div className="p-4 bg-green-50">
                                <h3 className="font-semibold text-green-800 mb-3">Rendez-vous à venir</h3>
                                {upcomingRendezVous.map((rdv) => {
                                  const status = getStatus(rdv.date);
                                  return (
                                    <div
                                      key={rdv.id}
                                      onClick={() => handleRendezVousClick(rdv)}
                                      className="mb-4 last:mb-0 bg-white rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} mr-3`}>
                                              {status.icon} {status.text}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                              {formatDateShort(rdv.date)}
                                            </span>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center">
                                              <User size={16} className="text-gray-400 mr-2" />
                                              <div>
                                                <p className="font-semibold text-gray-800">
                                                  Dr. {rdv.medecin?.user?.prenom} {rdv.medecin?.user?.nom}
                                                </p>
                                                {rdv.medecin?.specialite && (
                                                  <p className="text-sm text-gray-600">
                                                    {rdv.medecin.specialite.title}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                              <Clock size={16} className="text-gray-400 mr-2" />
                                              <div>
                                                <p className="text-sm text-gray-500">Horaire</p>
                                                <p className="font-medium">{formatTime(rdv.date, rdv.slot)}</p>
                                              </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                              <Calendar size={16} className="text-gray-400 mr-2" />
                                              <div>
                                                <p className="text-sm text-gray-500">Date</p>
                                                <p className="font-medium">{formatDateShort(rdv.date)}</p>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {rdv.motif && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                              <p className="text-sm text-gray-700">
                                                <strong>Motif :</strong> {rdv.motif}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                        
                                        
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            
                            {/* Rendez-vous passés */}
                            {pastRendezVous.length > 0 && (
                              <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Historique des rendez-vous</h3>
                                {pastRendezVous.map((rdv) => {
                                  const status = getStatus(rdv.date);
                                  return (
                                    <div
                                      key={rdv.id}
                                      onClick={() => handleRendezVousClick(rdv)}
                                      className="mb-4 last:mb-0 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} mr-3`}>
                                              {status.icon} {status.text}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                              {formatDateShort(rdv.date)}
                                            </span>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <p className="font-semibold text-gray-800">
                                                Dr. {rdv.medecin?.user?.prenom} {rdv.medecin?.user?.nom}
                                              </p>
                                              {rdv.medecin?.specialite && (
                                                <p className="text-sm text-gray-600">
                                                  {rdv.medecin.specialite.title}
                                                </p>
                                              )}
                                            </div>
                                            
                                            <div>
                                              <p className="text-sm text-gray-600">
                                                {formatDateShort(rdv.date)} à {formatTime(rdv.date, rdv.slot)}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          {rdv.motif && (
                                            <p className="mt-2 text-sm text-gray-600">
                                              Motif : {rdv.motif}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                              Aucun rendez-vous trouvé
                            </h3>
                            <p className="text-gray-500 mb-6">
                              Vous n'avez pas encore de rendez-vous programmé.
                            </p>
                            <button
                              onClick={() => window.open("/medecins", "_blank")}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                            >
                              Prendre mon premier rendez-vous
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Détails du rendez-vous sélectionné */}
                {selectedRendezVous && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 h-fit sticky top-6">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">Détails du rendez-vous</h3>
                      <button
                        onClick={() => setSelectedRendezVous(null)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Statut */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            getStatus(selectedRendezVous.date).color
                          }`}>
                            {getStatus(selectedRendezVous.date).icon} {getStatus(selectedRendezVous.date).text}
                          </span>
                          <span className="text-sm text-gray-500">
                            {getDayOfWeek(selectedRendezVous.date)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Date et heure */}
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Date</p>
                            <p className="font-bold text-gray-900 text-lg">
                              {formatDate(selectedRendezVous.date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Heure</p>
                            <p className="font-bold text-gray-900 text-lg">
                              {formatTime(selectedRendezVous.date, selectedRendezVous.slot)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Médecin */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <User size={18} className="mr-2 text-blue-600" />
                          Médecin
                        </h4>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={24} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">
                              Dr. {selectedRendezVous.medecin?.user?.prenom} {selectedRendezVous.medecin?.user?.nom}
                            </p>
                            {selectedRendezVous.medecin?.specialite && (
                              <p className="text-sm text-gray-600 mt-1">
                                <Stethoscope size={14} className="inline mr-1" />
                                {selectedRendezVous.medecin.specialite.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Informations détaillées */}
                      <div className="space-y-4">
                        {selectedRendezVous.motif && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Motif de consultation</h4>
                            <p className="text-gray-700">{selectedRendezVous.motif}</p>
                          </div>
                        )}
                        
                        {selectedRendezVous.notes && (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                              <AlertCircle size={16} className="mr-2" />
                              Notes importantes
                            </h4>
                            <p className="text-gray-700">{selectedRendezVous.notes}</p>
                          </div>
                        )}
                        
                        {selectedRendezVous.statut && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Statut</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              selectedRendezVous.statut === 'confirmé' ? 'bg-green-100 text-green-800' :
                              selectedRendezVous.statut === 'annulé' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedRendezVous.statut}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="space-y-3">
                          <button
                            onClick={() => window.open("/medecins", "_blank")}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                          >
                            <Calendar size={18} className="mr-2" />
                            Nouveau rendez-vous
                          </button>
                          
                          <div className="text-xs text-gray-500 text-center">
                            <p>Pour modifier ou annuler ce rendez-vous,</p>
                            <p>contactez directement le secrétariat.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Légende */}
            <div className="mt-6 bg-white p-4 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3">Informations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="inline-block w-3 h-3 bg-green-100 rounded-full mr-2"></span>
                    <strong>Rendez-vous à venir</strong> : Programmé pour une date future
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="inline-block w-3 h-3 bg-blue-100 rounded-full mr-2"></span>
                    <strong>Rendez-vous aujourd'hui</strong> : À ne pas manquer
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="inline-block w-3 h-3 bg-gray-100 rounded-full mr-2"></span>
                    <strong>Rendez-vous passé</strong> : Consultation terminée
                  </p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRendezVous;