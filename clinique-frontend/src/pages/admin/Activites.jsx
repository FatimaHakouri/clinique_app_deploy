import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/SidebarA';
import TopBar from '../../components/TopBar';
import { 
  User, Stethoscope, Filter, RefreshCw, Download, FileText, 
  PlusCircle, Users, Shield, Calendar, Search, Trash2,
  BarChart3, Clock, UserCheck, AlertCircle, CheckCircle
} from 'lucide-react';

// Importer le tracker d'activités - CORRIGÉ
import { activityTracker } from '../../services/activityTracker';

const Activites = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    search: ''
  });
  const [stats, setStats] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });

  // Formater la date
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formater l'heure relative
  const formatTimeAgo = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } else if (days > 0) {
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  }, []);

  // Charger les activités
  const loadActivities = useCallback(() => {
    setLoading(true);
    
    try {
      const filterOptions = {};
      
      if (filters.type !== 'all') {
        filterOptions.type = filters.type;
      }
      
      if (dateRange.start) {
        filterOptions.startDate = dateRange.start;
      }
      
      if (dateRange.end) {
        filterOptions.endDate = dateRange.end;
      }
      
      if (filters.search) {
        filterOptions.search = filters.search;
      }
      
      const filteredActivities = activityTracker.getActivities(filterOptions);
      setActivities(filteredActivities);
      setStats(activityTracker.getStats());
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, dateRange]);

  useEffect(() => {
    loadActivities();
    
    // Écouter les nouvelles activités
    const handleNewActivity = (event) => {
      const newActivity = event.detail;
      if (newActivity) {
        setActivities(prev => [newActivity, ...prev]);
        setStats(activityTracker.getStats());
      }
    };
    
    window.addEventListener('activityAdded', handleNewActivity);
    
    // Nettoyer les anciennes activités automatiquement
    activityTracker.clearOldActivities(90);
    
    return () => {
      window.removeEventListener('activityAdded', handleNewActivity);
    };
  }, [loadActivities]);

  // Gérer les changements de filtre
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      type: 'all',
      dateRange: 'all',
      search: ''
    });
    setDateRange({
      start: null,
      end: null
    });
  };

  // Exporter les activités
  const exportActivities = () => {
    const content = activityTracker.exportActivities(exportFormat);
    
    // Ajouter BOM pour l'UTF-8
    const BOM = '\uFEFF';
    const contentWithBOM = exportFormat === 'csv' ? BOM + content : content;
    
    const blob = new Blob([contentWithBOM], { 
      type: exportFormat === 'csv' 
        ? 'text/csv;charset=utf-8;' 
        : 'application/json;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const extension = exportFormat === 'csv' ? 'csv' : 'json';
    const filename = `activites_${new Date().toISOString().split('T')[0]}.${extension}`;
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Vider les activités
  const clearAllActivities = () => {
    if (window.confirm('Voulez-vous vraiment supprimer toutes les activités ? Cette action est irréversible.')) {
      localStorage.removeItem('clinic_activities');
      setActivities([]);
      setStats(activityTracker.getStats());
    }
  };

  // Obtenir l'icône selon le type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'medecin_create':
      case 'medecin_update':
      case 'medecin_delete':
        return <UserCheck size={20} className="text-blue-600" />;
      case 'specialite_create':
      case 'specialite_update':
      case 'specialite_delete':
        return <PlusCircle size={20} className="text-purple-600" />;
      case 'user_login':
      case 'user_logout':
        return <Users size={20} className="text-green-600" />;
      case 'user_create':
      case 'user_update':
      case 'user_delete':
        return <User size={20} className="text-indigo-600" />;
      default:
        return <Shield size={20} className="text-gray-600" />;
    }
  };

  // Obtenir la couleur selon le type
  const getActivityColor = (type) => {
    switch (type) {
      case 'medecin_create':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'medecin_update':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'medecin_delete':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'specialite_create':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'specialite_update':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'specialite_delete':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'user_create':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'user_update':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'user_delete':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Obtenir le label du type
  const getActivityLabel = (type) => {
    const labels = {
      'medecin_create': 'AJOUT MÉDECIN',
      'medecin_update': 'MODIF MÉDECIN',
      'medecin_delete': 'SUPPR MÉDECIN',
      'specialite_create': 'AJOUT SPÉCIALITÉ',
      'specialite_update': 'MODIF SPÉCIALITÉ',
      'specialite_delete': 'SUPPR SPÉCIALITÉ',
      'user_create': 'AJOUT UTILISATEUR',
      'user_update': 'MODIF UTILISATEUR',
      'user_delete': 'SUPPR UTILISATEUR',
      'user_login': 'CONNEXION',
      'user_logout': 'DÉCONNEXION',
      'system': 'SYSTÈME'
    };
    
    return labels[type] || type.toUpperCase();
  };

  // Fonction pour calculer les statistiques
  const calculateStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActivities = activities.filter(a => 
      new Date(a.timestamp) >= today
    );

    const byType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: activities.length,
      today: todayActivities.length,
      byType,
      lastActivity: activities[0] || null
    };
  }, [activities]);

  useEffect(() => {
    setStats(calculateStats());
  }, [activities, calculateStats]);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-6 space-y-6">
          {/* En-tête */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Journal des Activités</h1>
              <p className="text-sm text-gray-500 mt-1">
                Suivi complet des actions système • {formatDate(new Date())}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={clearAllActivities}
                className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition border border-red-200"
                title="Vider toutes les activités"
              >
                <Trash2 size={18} />
                Vider
              </button>
              
              <button 
                onClick={loadActivities}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <RefreshCw size={18} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-600">Activités totales</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Sur 90 jours</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-600">Aujourd'hui</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.today || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Clock className="text-green-600" size={24} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <CheckCircle size={12} className="text-green-500" />
                <p className="text-xs text-gray-500">En temps réel</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-600">Médecins</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {(stats.byType && (
                      (stats.byType['medecin_create'] || 0) +
                      (stats.byType['medecin_update'] || 0) +
                      (stats.byType['medecin_delete'] || 0)
                    )) || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Stethoscope className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-600">Spécialités</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {(stats.byType && (
                      (stats.byType['specialite_create'] || 0) +
                      (stats.byType['specialite_update'] || 0) +
                      (stats.byType['specialite_delete'] || 0)
                    )) || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <PlusCircle className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Barre de recherche */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher une activité..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                {/* Filtre par type */}
                <div className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-white">
                  <Filter size={18} className="text-gray-500" />
                  <select
                    className="outline-none bg-transparent text-gray-700"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="all">Tous les types</option>
                    <option value="specialite_create">Ajout spécialité</option>
                    <option value="specialite_update">Modif spécialité</option>
                    <option value="specialite_delete">Suppr spécialité</option>
                    <option value="user_create">Ajout utilisateur</option>
                    <option value="user_update">Modif utilisateur</option>
                    <option value="user_delete">Suppr utilisateur</option>
                  </select>
                </div>
              </div>

              {/* Export */}
              <div className="flex gap-3">
                <select
                  className="border rounded-lg px-3 py-2 bg-white text-gray-700"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
                
                <button
                  onClick={exportActivities}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Download size={18} />
                  Exporter
                </button>
              </div>
            </div>

            {/* Filtres de date */}
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-500" />
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2"
                  value={dateRange.start || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <span className="text-gray-500">à</span>
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2"
                  value={dateRange.end || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              
              {filters.search || filters.type !== 'all' || dateRange.start || dateRange.end ? (
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Réinitialiser les filtres
                </button>
              ) : null}
            </div>
          </div>

          {/* Liste des activités */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des activités...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {activities.map((activity) => {
                  const isToday = new Date(activity.timestamp).toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={activity.id} 
                      className="p-6 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedActivity(activity)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium text-gray-800">{activity.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  activity.type.includes('_create') ? 'bg-green-100 text-green-800' :
                                  activity.type.includes('_update') ? 'bg-yellow-100 text-yellow-800' :
                                  activity.type.includes('_delete') ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {getActivityLabel(activity.type)}
                                </span>
                                {isToday && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    AUJOURD'HUI
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              
                              {activity.details && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-700">{activity.details}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <span className="text-xs text-gray-500" title={new Date(activity.timestamp).toLocaleString('fr-FR')}>
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                              <div className="mt-2">
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                  {activity.userName}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {activity.entityName && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-gray-500">Entité:</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {activity.entityName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} className="text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune activité trouvée</h3>
                <p className="mt-2 text-gray-500">
                  {filters.search || filters.type !== 'all' || dateRange.start || dateRange.end
                    ? 'Aucune activité ne correspond à vos critères'
                    : 'Les activités apparaîtront ici au fur et à mesure'}
                </p>
                {(filters.search || filters.type !== 'all' || dateRange.start || dateRange.end) && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-blue-600 hover:text-blue-800 underline"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de détails */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Détails de l'activité</h3>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type d'action</h4>
                  <p className="mt-1">{getActivityLabel(selectedActivity.type)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-1">{selectedActivity.description}</p>
                </div>
                
                {selectedActivity.details && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Détails</h4>
                    <p className="mt-1">{selectedActivity.details}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Utilisateur</h4>
                    <p className="mt-1">{selectedActivity.userName}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Rôle</h4>
                    <p className="mt-1">{selectedActivity.userRole}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date et heure</h4>
                    <p className="mt-1">
                      {new Date(selectedActivity.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">ID de l'activité</h4>
                    <p className="mt-1 font-mono text-sm">{selectedActivity.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activites;