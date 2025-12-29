import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import MedecinProfile from './components/MedecinProfile'; 
import HomePage from './pages/HomePage';
import Login from './components/auth/Login';
import DoctorsPage from './pages/DoctorsPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import EmergencyPage from './pages/EmergencyPage';
import DoctorDetail from './components/DoctorDetail';

import DashboardM from "./pages/medecin/MedecinDashboard";
import Rendezvous from "./pages/medecin/RendezvousM";
import Patients from "./pages/medecin/PatientsM";
import DossierPatientDetail from "./pages/medecin/DossierPatientDetail";
import DossierMedicalPage from "./pages/medecin/DossierMedicalPage";
import AjouterConsultation from "./pages/medecin/AjouterConsultation";
import MedecinProfil from './pages/medecin/MedecinProfil';

import DashboardS from "./pages/secreitaire/SecretaireDashboard";
import PatientsListS from "./pages/secreitaire/patients/PatientsListS";
import AddPatientS from "./pages/secreitaire/patients/AddPatientS";
import EditPatientS from "./pages/secreitaire/patients/EditPatientS";
import AppointmentsListS from "./pages/secreitaire/appointments/AppointmentsListS";
import AddAppointmentS from "./pages/secreitaire/appointments/AddAppointmentS";
import EditAppointmentS from "./pages/secreitaire/appointments/EditAppointmentS";
import PatientAdminS from "./pages/secreitaire/PatientAdminS";
import DossierMedicalListS from './pages/secreitaire/dossier-medical/DossierMedicalListS';
import DossierMedicalDetailS from './pages/secreitaire/dossier-medical/DossierMedicalDetailS';

import DashboardA from './pages/admin/AdminDashboard';
import SpecialitiesList from './pages/admin/specialities/SpecialitiesList';
import AddSpeciality from './pages/admin/specialities/AddSpeciality';
import EditSpeciality from './pages/admin/specialities/EditSpeciality';

import StaffList from "./pages/admin/staff/StaffList";
import StaffAdd from "./pages/admin/staff/StaffAdd";
import StaffUpdate from "./pages/admin/staff/StaffUpdate";

// NOUVEAU : Import des composants Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientRendezVous from './pages/patient/PatientRendezVous';
import PatientProfil from './pages/patient/PatientProfil';
import PatientDossierMedical from './pages/patient/DossierMedical';

import Statistiques from './pages/admin/statistiques';
import Activites from './pages/admin/Activites';

import './styles/globals.css';
import './App.css';

function App() {
  return (
    
    <AuthProvider>
      <Layout>
        <Routes>

          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/medecins" element={<DoctorsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/urgences" element={<EmergencyPage />} />
          <Route path="/login" element={<Login />} />

          {/* Médecin */}
          <Route path="/medecin/dashboard" element={<DashboardM />} />
          <Route path="/medecin/rendezvous" element={<Rendezvous />} />
          <Route path="/medecin/patients" element={<Patients />} />
          <Route path="/medecin/dossiers-medicaux" element={<DossierMedicalPage />} />
          <Route path="/medecin/dossiers-medicaux/:id" element={<DossierPatientDetail />} />
          
          <Route path="/medecin/consultations/nouvelle/:patientId" element={<AjouterConsultation />}
        />
      
          {/* Admin crud specialite */}
          <Route path="/admin/dashboard" element={<DashboardA />} />
          <Route path="/admin/specialites" element={<SpecialitiesList />} />
          <Route path="/admin/specialites/add" element={<AddSpeciality />} />
          <Route path="/admin/specialites/edit/:id" element={<EditSpeciality />} />

          {/* Admin crud staff */}
          <Route path="/admin/staff" element={<StaffList />} />
          <Route path="/admin/staff/add" element={<StaffAdd />} />
          <Route path="/admin/staff/update/:id" element={<StaffUpdate />} />

          {/* Secrétaire */}
          <Route path="/secretaire/dashboard" element={<DashboardS />}>
            <Route path="patients" element={<PatientsListS />} />
            <Route path="patients/add" element={<AddPatientS />} />
            <Route path="patients/edit/:id" element={<EditPatientS />} />

            <Route path="appointments" element={<AppointmentsListS />} />
            <Route path="appointments/add" element={<AddAppointmentS />} />
            <Route path="appointments/edit/:id" element={<EditAppointmentS />} />

            <Route path="patient-admin/:id" element={<PatientAdminS />} />
            <Route path="dossier-medical" element={<DossierMedicalListS />} />
            <Route path="dossier-medical/:id" element={<DossierMedicalDetailS />} />
          </Route>

          {/* NOUVEAU : Patient */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/rendezvous" element={<PatientRendezVous />} />
          <Route path="/patient/profil" element={<PatientProfil />} />
          <Route path="/patient/dossier-medical" element={<PatientDossierMedical />} />


          {/* Redirection */}
          <Route path="*" element={<Navigate to="/" />} /> 
          <Route path="/medecin/profil" element={<MedecinProfil />} />
           <Route path="/admin/statistiques" element={<Statistiques />} />
           <Route path="/admin/activites" element={<Activites />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
