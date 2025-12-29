// src/services/patientService.js
export const getPatientByEmail = async (email) => {
  try {
    const response = await fetch(`http://localhost:8080/api/patients/email/${encodeURIComponent(email)}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Erreur serveur');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur getPatientByEmail:', error);
    return null;
  }
};

export const createPatient = async (patientData) => {
  const transformedData = {
    nom: patientData.nom,
    prenom: patientData.prenom,
    email: patientData.email,
    tel: patientData.telephone,
    cin: patientData.cin,
    motDePasse: patientData.mot_de_passe,
    adresse: null
  };

  try {
    const response = await fetch('http://localhost:8080/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData)
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la création du patient');
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Erreur createPatient:', error);
    throw error;
  }
};

export const getPatientConsultations = async (patientId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/consultations/dossier-patient/${patientId}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des consultations');
    }
    const data = await response.json();
    return data.consultations || [];
  } catch (error) {
    console.error('Erreur getPatientConsultations:', error);
    throw error;
  }
};

export const downloadMedicalFile = async (filename) => {
  try {
    const response = await fetch(`http://localhost:8080/uploads/${filename}`);
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }
    return await response.blob();
  } catch (error) {
    console.error('Erreur downloadMedicalFile:', error);
    throw error;
  }
};