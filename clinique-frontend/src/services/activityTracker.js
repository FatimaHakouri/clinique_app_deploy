// Service pour suivre les activités côté frontend
const ACTIVITY_STORAGE_KEY = 'clinic_activities';
const MAX_ACTIVITIES = 200;

export const ActivityType = {
  MEDECIN_CREATE: 'medecin_create',
  MEDECIN_UPDATE: 'medecin_update',
  MEDECIN_DELETE: 'medecin_delete',
  SPECIALITE_CREATE: 'specialite_create',
  SPECIALITE_UPDATE: 'specialite_update',
  SPECIALITE_DELETE: 'specialite_delete',
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  SYSTEM: 'system'
};

class ActivityTracker {
  constructor() {
    this.activities = this.loadActivities();
  }

  loadActivities() {
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur chargement activités:', error);
      return [];
    }
  }

  saveActivities() {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(this.activities));
    } catch (error) {
      console.error('Erreur sauvegarde activités:', error);
    }
  }

  addActivity({
    type,
    title,
    description,
    details = '',
    userId = 'admin',
    userName = 'Administrateur',
    userRole = 'admin',
    entityId = null,
    entityName = null,
    metadata = {}
  }) {
   const now = new Date();

  const activity = {
    id: `act_${crypto.randomUUID()}`, // 🔥 ID propre
    type,
    title,
    description,
    details,
    userId,
    userName,
    userRole,
    entityId,
    entityName,
    metadata,
    timestamp: now.toISOString(), // ✅ DATE EXACTE
    ipAddress: this.getClientIP(),
    browser: navigator.userAgent.replace(/\s+/g, ' ').trim()
  };

    this.activities.unshift(activity);
    
    // Garder seulement les MAX_ACTIVITIES plus récentes
    if (this.activities.length > MAX_ACTIVITIES) {
      this.activities = this.activities.slice(0, MAX_ACTIVITIES);
    }
    
    this.saveActivities();
    
    // Émettre un événement pour les composants qui écoutent
    window.dispatchEvent(new CustomEvent('activityAdded', { detail: activity }));
    
    return activity;
  }

  getClientIP() {
    // En production, vous pourriez récupérer l'IP via une API
    return 'local';
  }

  getActivities(filter = {}) {
    let filtered = [...this.activities];

    if (filter.type) {
      filtered = filtered.filter(a => a.type === filter.type);
    }

    if (filter.startDate) {
      filtered = filtered.filter(a => new Date(a.timestamp) >= new Date(filter.startDate));
    }

    if (filter.endDate) {
      filtered = filtered.filter(a => new Date(a.timestamp) <= new Date(filter.endDate));
    }

    if (filter.userId) {
      filtered = filtered.filter(a => a.userId === filter.userId);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.userName.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  clearOldActivities(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    this.activities = this.activities.filter(
      a => new Date(a.timestamp) >= cutoffDate
    );
    
    this.saveActivities();
    return this.activities.length;
  }

  exportActivities(format = 'csv') {
    switch(format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV();
      case 'json':
        return this.exportToJSON();
      default:
        return this.exportToCSV();
    }
  }

exportToCSV() {
  const separator = ';';

  const clean = (value) => {
    if (value === null || value === undefined) return '""';

    return `"${String(value)
      .replace(/\t/g, ' ')        // supprime TAB
      .replace(/\r?\n/g, ' ')    // supprime retours ligne
      .replace(/"/g, '""')}"`;   // escape guillemets
  };

  const headers = [
    'ID', 'Type', 'Date', 'Heure', 'Titre', 'Description', 'Détails',
    'Utilisateur', 'Rôle', 'Entité', 'IP', 'Navigateur'
  ];

  let csv = '\uFEFF'; // ✅ BOM UTF-8 (Excel FR)
  csv += headers.join(separator) + '\n';

  this.activities.forEach(activity => {
    const date = new Date(activity.timestamp);

    const row = [
      clean(activity.id),
      clean(activity.type),
      clean(date.toLocaleDateString('fr-FR')),
      clean(date.toLocaleTimeString('fr-FR')),
      clean(activity.title),
      clean(activity.description),
      clean(activity.details),
      clean(activity.userName),
      clean(activity.userRole),
      clean(activity.entityName),
      clean(activity.ipAddress),
      clean(activity.browser)
    ];

    csv += row.join(separator) + '\n';
  });

  return csv;
}


  exportToJSON() {
    return JSON.stringify(this.activities, null, 2);
  }

  getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayActivities = this.activities.filter(a => 
      new Date(a.timestamp) >= today
    );

    const byType = this.activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: this.activities.length,
      today: todayActivities.length,
      byType,
      lastActivity: this.activities[0] || null
    };
  }
}

// Singleton
export const activityTracker = new ActivityTracker();

// Fonctions utilitaires pour les actions communes
export const trackMedecinAction = (action, medecin, userId = 'admin', userName = 'Administrateur') => {
  const actions = {
    create: {
      type: ActivityType.MEDECIN_CREATE,
      title: 'Médecin ajouté',
      description: `Dr. ${medecin.prenom} ${medecin.nom} a été ajouté`
    },
    update: {
      type: ActivityType.MEDECIN_UPDATE,
      title: 'Médecin modifié',
      description: `Informations du Dr. ${medecin.prenom} ${medecin.nom} mises à jour`
    },
    delete: {
      type: ActivityType.MEDECIN_DELETE,
      title: 'Médecin supprimé',
      description: `Dr. ${medecin.prenom} ${medecin.nom} a été supprimé`
    }
  };

  const config = actions[action];
  if (!config) return null;

  return activityTracker.addActivity({
    ...config,
    details: `Spécialité: ${medecin.specialite?.title || 'Non spécifiée'}, Email: ${medecin.email}`,
    userId,
    userName,
    entityId: medecin.id,
    entityName: `Dr. ${medecin.prenom} ${medecin.nom}`,
    metadata: { medecinId: medecin.id }
  });
};

export const trackSpecialiteAction = (action, specialite, userId = 'admin', userName = 'Administrateur') => {
  const actions = {
    create: {
      type: ActivityType.SPECIALITE_CREATE,
      title: 'Spécialité ajoutée',
      description: `Nouvelle spécialité: ${specialite.title}`
    },
    update: {
      type: ActivityType.SPECIALITE_UPDATE,
      title: 'Spécialité modifiée',
      description: `Spécialité "${specialite.title}" mise à jour`
    },
    delete: {
      type: ActivityType.SPECIALITE_DELETE,
      title: 'Spécialité supprimée',
      description: `Spécialité "${specialite.title}" supprimée`
    }
  };

  const config = actions[action];
  if (!config) return null;

  return activityTracker.addActivity({
    ...config,
    details: `Description: ${specialite.description || 'Aucune description'}`,
    userId,
    userName,
    entityId: specialite.id,
    entityName: specialite.title,
    metadata: { specialiteId: specialite.id }
  });
};

// Fonction utilitaire pour tracker les actions utilisateur
export const trackUserAction = ({
  type,
  title,
  description,
  details = '',
  userId = 'admin',
  userName = 'Administrateur',
  userRole = 'admin',
  entityId = null,
  entityName = null,
  metadata = {}
}) => {
  return activityTracker.addActivity({
    type,
    title,
    description,
    details,
    userId,
    userName,
    userRole,
    entityId,
    entityName,
    metadata
  });
};

// Fonctions simplifiées pour création/suppression utilisateur
export const trackUserCreate = (userData, adminUser = {}) => {
  const roleLabel = getRoleLabel(userData.role);
  return trackUserAction({
    type: ActivityType.USER_CREATE,
    title: `${roleLabel} ajouté`,
    description: `${userData.prenom} ${userData.nom} a été ajouté`,
    details: `Email: ${userData.email}, Rôle: ${roleLabel}`,
    userId: adminUser.id || 'admin',
    userName: adminUser.name || 'Administrateur',
    userRole: adminUser.role || 'admin',
    entityId: userData.id,
    entityName: `${userData.prenom} ${userData.nom}`,
    metadata: userData
  });
};

export const trackUserUpdate = (userData, changes = {}, adminUser = {}) => {
  const roleLabel = getRoleLabel(userData.role);
  return trackUserAction({
    type: ActivityType.USER_UPDATE,
    title: `${roleLabel} modifié`,
    description: `${userData.prenom} ${userData.nom} a été mis à jour`,
    details: `Modifications: ${Object.keys(changes).join(', ')}`,
    userId: adminUser.id || 'admin',
    userName: adminUser.name || 'Administrateur',
    userRole: adminUser.role || 'admin',
    entityId: userData.id,
    entityName: `${userData.prenom} ${userData.nom}`,
    metadata: { ...userData, changes }
  });
};

export const trackUserDelete = (userData, adminUser = {}) => {
  const roleLabel = getRoleLabel(userData.role);
  return trackUserAction({
    type: ActivityType.USER_DELETE,
    title: `${roleLabel} supprimé`,
    description: `${userData.prenom} ${userData.nom} a été supprimé`,
    details: `Email: ${userData.email}, Rôle: ${roleLabel}`,
    userId: adminUser.id || 'admin',
    userName: adminUser.name || 'Administrateur',
    userRole: adminUser.role || 'admin',
    entityId: userData.id,
    entityName: `${userData.prenom} ${userData.nom}`,
    metadata: { ...userData, deletedAt: new Date().toISOString() }
  });
};

// Fonction utilitaire pour obtenir le label en français du rôle
const getRoleLabel = (role) => {
  const roles = {
    admin: 'Administrateur',
    medecin: 'Médecin',
    secretaire: 'Secrétaire',
    patient: 'Patient'
  };
  return roles[role] || role;
};

// Fonction pour tracker la connexion/déconnexion
export const trackUserAuth = (action, userData) => {
  const actions = {
    login: {
      type: ActivityType.USER_LOGIN,
      title: 'Connexion',
      description: `${userData.prenom} ${userData.nom} s'est connecté`
    },
    logout: {
      type: ActivityType.USER_LOGOUT,
      title: 'Déconnexion',
      description: `${userData.prenom} ${userData.nom} s'est déconnecté`
    }
  };

  const config = actions[action];
  if (!config) return null;

  return activityTracker.addActivity({
    ...config,
    userId: userData.id,
    userName: `${userData.prenom} ${userData.nom}`,
    userRole: userData.role,
    entityId: userData.id,
    entityName: `${userData.prenom} ${userData.nom}`,
    metadata: { action, timestamp: new Date().toISOString() }
  });
};