import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  FileIcon,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  FolderDown
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://localhost:8080";

export default function DossierMedicalDetailS() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [piecesJointesPage, setPiecesJointesPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/consultations/dossier-patient/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response Data Structure:", data);
        
        if (data.patient) {
          setPatient(data.patient);
        } else if (data) {
          setPatient(data);
        }
        
        if (data.consultations && Array.isArray(data.consultations)) {
          setConsultations(data.consultations);
        } else if (data.consultations) {
          setConsultations([data.consultations]);
        } else if (data.consultation) {
          setConsultations(Array.isArray(data.consultation) ? data.consultation : [data.consultation]);
        } else if (Array.isArray(data)) {
          setConsultations(data);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const downloadFile = (filename) => {
    window.open(`${API_BASE}/uploads/${filename}`, "_blank");
  };

  // Fonction pour obtenir une valeur sécurisée
  const getSafeValue = (value, defaultValue = "Non renseigné") => {
    if (value === undefined || value === null || value === "") {
      return defaultValue;
    }
    return value.toString().trim();
  };

  // Fonction pour obtenir le nom complet du médecin
  const getMedecinFullName = (consultation) => {
    if (!consultation) return "Dr. Non renseigné";
    return `Dr. ${getSafeValue(consultation.medecinNom)} ${getSafeValue(consultation.medecinPrenom)}`.trim();
  };

  /* =======================
     PDF CONSULTATION INDIVIDUELLE
     ======================= */
  const exportConsultationPDF = (c) => {
  if (!patient || !c) {
    alert("Données manquantes pour générer le PDF");
    return;
  }
  
  try {
    const doc = new jsPDF();
    
    // Données du patient
    const patientNom = patient.nom || "Non renseigné";
    const patientPrenom = patient.prenom || "Non renseigné";
    const patientCIN = patient.cin || "Non renseigné";
    const patientTelephone = patient.tel || "Non renseigné";
    const patientEmail = patient.email || "Non renseigné";
    const patientAdresse = patient.adresse || "Non renseigné";
    
    // Données de la consultation
    const consultationDate = c.dateConsultation 
      ? new Date(c.dateConsultation).toLocaleDateString("fr-FR")
      : "Non renseignée";
    const consultationTime = c.dateConsultation 
      ? new Date(c.dateConsultation).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })
      : "Non renseignée";
    
    const medecinNom = c.medecinNom || "";
    const medecinPrenom = c.medecinPrenom || "";
    const medecinFullName = `Dr. ${medecinNom} ${medecinPrenom}`.trim();
    const specialite = c.specialite || "Non spécifiée";
    const motif = c.motif || "Aucun motif renseigné";
    const traitement = c.traitement || "";
    
    // === SOLUTION : Ne pas utiliser autoTable pour les en-têtes ===
    
    // En-tête stylisé
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FICHE DE CONSULTATION", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("SantéPlus", 105, 28, { align: "center" });
    
    // Section 1: Informations patient (AVEC autoTable CORRIGÉ)
    doc.setFillColor(37, 99, 235);
    doc.rect(10, 35, 190, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMATIONS PATIENT", 105, 40, { align: "center" });
    
    // Tableau des informations patient - VERSION SIMPLIFIÉE
    autoTable(doc, {
      startY: 45,
      body: [
        ['Nom complet', `${patientNom} ${patientPrenom}`.trim()],
        ['CIN', patientCIN],
        ['Téléphone', patientTelephone],
        ['Email', patientEmail],
        ['Adresse', patientAdresse]
      ],
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 145 }
      },
      theme: 'grid'
    });
    
    let y = doc.lastAutoTable.finalY + 10;
    
    // Section 2: Détails consultation
    doc.setFillColor(22, 160, 133);
    doc.rect(10, y, 190, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("DÉTAILS DE LA CONSULTATION", 105, y + 5, { align: "center" });
    
    autoTable(doc, {
      startY: y + 10,
      body: [
        ['Date', consultationDate],
        ['Heure', consultationTime],
        ['Médecin', medecinFullName || "Dr. Non renseigné"],
        ['Spécialité', specialite]
      ],
      styles: { 
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 145 }
      },
      theme: 'grid'
    });
    
    y = doc.lastAutoTable.finalY + 10;
    
    // Section 3: Motif
    doc.setFillColor(52, 152, 219);
    doc.rect(10, y, 190, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("MOTIF DE CONSULTATION", 105, y + 5, { align: "center" });
    
    autoTable(doc, {
      startY: y + 10,
      body: [[motif]],
      styles: { 
        fontSize: 10,
        cellPadding: 5,
        minCellHeight: 20,
        overflow: 'linebreak'
      },
      theme: 'grid'
    });
    
    y = doc.lastAutoTable.finalY + 10;
    
    // Section 4: Traitement (si existe)
    if (traitement && traitement.trim() !== '') {
      doc.setFillColor(155, 89, 182);
      doc.rect(10, y, 190, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text("TRAITEMENT PRESCRIT", 105, y + 5, { align: "center" });
      
      autoTable(doc, {
        startY: y + 10,
        body: [[traitement]],
        styles: { 
          fontSize: 10,
          cellPadding: 5,
          minCellHeight: 20,
          overflow: 'linebreak'
        },
        theme: 'grid'
      });
    }
    
    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 285, { align: 'center' });
    
    const fileName = `consultation-${patientNom}-${patientPrenom}-${consultationDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    alert(`Erreur lors de la génération du PDF: ${error.message}`);
  }
};

  /* =======================
     PDF DOSSIER COMPLET
     ======================= */
  const exportDossierCompletPDF = () => {
  if (!patient || consultations.length === 0) {
    alert("Aucune donnée à exporter");
    return;
  }
  
  try {
    const doc = new jsPDF();
    
    // Données du patient
    const patientNom = patient.nom || "";
    const patientPrenom = patient.prenom || "";
    const patientCIN = patient.cin || "Non renseigné";
    const patientTelephone = patient.tel || "Non renseigné";
    const patientEmail = patient.email || "Non renseigné";
    const patientAdresse = patient.adresse || "Non renseigné";
    
    // Page de couverture
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("DOSSIER MÉDICAL COMPLET", 105, 100, { align: "center" });
    
    const patientFullName = `${patientNom} ${patientPrenom}`.trim();
    doc.setFontSize(18);
    doc.text(patientFullName, 105, 120, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`CIN: ${patientCIN}`, 105, 135, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 150, { align: "center" });
    doc.text(`${consultations.length} consultation(s)`, 105, 160, { align: "center" });
    
    // Page 2: Informations patient
    doc.addPage();
    
    // Section Informations patient - AVEC EN-TÊTE MANUEL
    doc.setFillColor(37, 99, 235);
    doc.rect(10, 20, 190, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMATIONS DU PATIENT", 105, 25, { align: "center" });
    
    // Tableau informations patient
    autoTable(doc, {
      startY: 30,
      body: [
        ['Nom complet', patientFullName || "Non renseigné"],
        ['CIN', patientCIN],
        ['Téléphone', patientTelephone],
        ['Email', patientEmail],
        ['Adresse', patientAdresse]
      ],
      styles: { 
        fontSize: 11,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 145 }
      },
      theme: 'grid'
    });
    
    // Tableau sommaire des consultations
    const sommaireData = consultations.map((consultation, i) => {
      const date = consultation.dateConsultation 
        ? new Date(consultation.dateConsultation).toLocaleDateString('fr-FR')
        : "N/A";
      const time = consultation.dateConsultation 
        ? new Date(consultation.dateConsultation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : "N/A";
      
      const medecinNom = consultation.medecinNom || "";
      const medecinPrenom = consultation.medecinPrenom || "";
      const medecin = `Dr. ${medecinNom} ${medecinPrenom}`.trim();
      
      const motifText = consultation.motif || "";
      const specialite = consultation.specialite || "Non spécifiée";
      
      return [
        i + 1,
        date,
        time,
        medecin,
        specialite,
        motifText.substring(0, 40) + (motifText.length > 40 ? '...' : '')
      ];
    });
    
    // En-tête sommaire
    let y = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(22, 160, 133);
    doc.rect(10, y, 190, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("SOMMAIRE DES CONSULTATIONS", 105, y + 5, { align: "center" });
    
    // Tableau sommaire
    autoTable(doc, {
      startY: y + 10,
      body: sommaireData,
      styles: { 
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 50 },
        4: { cellWidth: 35 },
        5: { cellWidth: 55 }
      },
      theme: 'grid'
    });
    
    // Ajouter chaque consultation
    consultations.forEach((consultation, i) => {
      doc.addPage();
      
      // Titre de la consultation
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`CONSULTATION ${i + 1}/${consultations.length}`, 105, 20, { align: "center" });
      
      // Données de la consultation
      const consultationDate = consultation.dateConsultation 
        ? new Date(consultation.dateConsultation).toLocaleDateString('fr-FR')
        : "Non renseignée";
      const consultationTime = consultation.dateConsultation 
        ? new Date(consultation.dateConsultation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : "Non renseignée";
      
      const medecinNom = consultation.medecinNom || "";
      const medecinPrenom = consultation.medecinPrenom || "";
      const medecinFullName = `Dr. ${medecinNom} ${medecinPrenom}`.trim();
      const specialite = consultation.specialite || "Non spécifiée";
      const motif = consultation.motif || "Aucun motif renseigné";
      const traitement = consultation.traitement || "";
      
      // Section Détails consultation
      doc.setFillColor(52, 152, 219);
      doc.rect(10, 30, 190, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("DÉTAILS DE LA CONSULTATION", 105, 35, { align: "center" });
      
      // Tableau détails consultation
      autoTable(doc, {
        startY: 40,
        body: [
          ['Date', consultationDate],
          ['Heure', consultationTime],
          ['Médecin', medecinFullName],
          ['Spécialité', specialite]
        ],
        styles: { 
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold' },
          1: { cellWidth: 150 }
        },
        theme: 'grid'
      });
      
      y = doc.lastAutoTable.finalY + 10;
      
      // Section Motif
      doc.setFillColor(46, 204, 113);
      doc.rect(10, y, 190, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text("MOTIF DE CONSULTATION", 105, y + 5, { align: "center" });
      
      // Tableau motif
      autoTable(doc, {
        startY: y + 10,
        body: [[motif]],
        styles: { 
          fontSize: 10,
          cellPadding: 5,
          minCellHeight: 20,
          overflow: 'linebreak'
        },
        theme: 'grid'
      });
      
      y = doc.lastAutoTable.finalY + 10;
      
      // Section Traitement (si existe)
      if (traitement && traitement.trim() !== '') {
        doc.setFillColor(230, 126, 34);
        doc.rect(10, y, 190, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text("TRAITEMENT PRESCRIT", 105, y + 5, { align: "center" });
        
        autoTable(doc, {
          startY: y + 10,
          body: [[traitement]],
          styles: { 
            fontSize: 10,
            cellPadding: 5,
            minCellHeight: 20,
            overflow: 'linebreak'
          },
          theme: 'grid'
        });
      }
    });
    
    const fileName = `dossier-medical-${patientNom}-${patientPrenom}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error("Erreur génération dossier complet:", error);
    alert(`Erreur lors de la génération du dossier complet: ${error.message}`);
  }
};

  // Calcul pour la pagination des pièces jointes
  const currentConsultation = consultations[index];
  const totalPiecesPages = currentConsultation?.fichier 
    ? Math.ceil(currentConsultation.fichier.length / itemsPerPage)
    : 0;
  
  const currentPiecesJointes = currentConsultation?.fichier 
    ? currentConsultation.fichier.slice(
        (piecesJointesPage - 1) * itemsPerPage,
        piecesJointesPage * itemsPerPage
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement du dossier...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Patient introuvable</div>
          <Link
            to="/secretaire/dashboard/dossier-medical"
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
          >
            <ArrowLeft size={16} />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  // Fonction pour afficher le nom du médecin dans l'UI
  const getDisplayMedecinName = () => {
    if (!currentConsultation) return "Dr. Non renseigné";
    const nom = currentConsultation.medecinNom || "";
    const prenom = currentConsultation.medecinPrenom || "";
    return `Dr. ${nom} ${prenom}`.trim();
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 p-3">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Link
              to="/secretaire/dashboard/dossier-medical"
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="text-gray-700" size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Dossier Médical</h1>
              <p className="text-gray-600 text-xs mt-0.5">
                Gestion des consultations
              </p>
            </div>
          </div>

          {consultations.length > 0 && (
            <button
              onClick={exportDossierCompletPDF}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-lg font-medium transition-all text-sm"
            >
              <FolderDown size={16} />
              <span>Exporter dossier complet</span>
            </button>
          )}
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <UserCircle className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-800">
                {patient.nom} {patient.prenom}
              </h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {patient.cin && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-600">CIN:</span>
                    <span className="font-medium text-gray-800">{patient.cin}</span>
                  </div>
                )}
                {patient.tel && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-600">Tél:</span>
                    <span className="font-medium text-gray-800">{patient.tel}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-800">{patient.email}</span>
                  </div>
                )}
                {patient.adresse && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-600">Adresse:</span>
                    <span className="font-medium text-gray-800">{patient.adresse}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Section */}
        {consultations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <FileText className="mx-auto text-gray-300 mb-3" size={36} />
            <h3 className="text-base font-medium text-gray-600 mb-1">
              Aucune consultation enregistrée
            </h3>
            <p className="text-gray-500 text-sm">
              Ce patient n'a pas encore de consultations.
            </p>
          </div>
        ) : (
          <>
            {/* Consultation Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 p-1.5 rounded">
                    <Calendar className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-800 text-sm">
                        Consultation {index + 1} sur {consultations.length}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        {consultations.length - index - 1} restante(s)
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      {currentConsultation?.dateConsultation 
                        ? `${new Date(currentConsultation.dateConsultation).toLocaleDateString("fr-FR", {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })} à ${new Date(currentConsultation.dateConsultation).toLocaleTimeString("fr-FR", {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`
                        : "Date non disponible"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => exportConsultationPDF(currentConsultation)}
                  className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-sm"
                >
                  <Printer size={14} />
                  <span>Exporter en PDF</span>
                </button>
              </div>
            </div>

            {/* Consultation Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
              {/* Left Column - Consultation Info */}
              <div className="lg:col-span-1 space-y-3">
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-1.5 text-sm">
                    <div className="bg-blue-100 p-1 rounded">
                      <UserCircle className="text-blue-600" size={14} />
                    </div>
                    Médecin traitant
                  </h3>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-xs text-gray-600">Nom:</span>
                      <p className="font-medium text-sm">
                        {getDisplayMedecinName()}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Spécialité:</span>
                      <p className="font-medium text-blue-600 text-sm">
                        {currentConsultation?.specialite || "Non spécifiée"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pièces jointes avec pagination */}
                {currentConsultation?.fichier?.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-700 flex items-center gap-1.5 text-sm">
                        <div className="bg-purple-100 p-1 rounded">
                          <FileIcon className="text-purple-600" size={14} />
                        </div>
                        Pièces jointes ({currentConsultation.fichier.length})
                      </h3>
                      {totalPiecesPages > 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPiecesJointesPage(p => Math.max(1, p - 1))}
                            disabled={piecesJointesPage === 1}
                            className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="text-xs text-gray-600">
                            {piecesJointesPage}/{totalPiecesPages}
                          </span>
                          <button
                            onClick={() => setPiecesJointesPage(p => Math.min(totalPiecesPages, p + 1))}
                            disabled={piecesJointesPage === totalPiecesPages}
                            className="p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {currentPiecesJointes.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => downloadFile(f)}
                          className="flex items-center justify-between w-full p-2 bg-gray-50 hover:bg-blue-50 rounded border border-gray-200 hover:border-blue-300 transition-colors group text-left"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="text-gray-500 group-hover:text-blue-500 flex-shrink-0" size={12} />
                            <span className="text-xs text-gray-700 truncate">
                              {f}
                            </span>
                          </div>
                          <Download className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2" size={12} />
                        </button>
                      ))}
                    </div>
                    
                    {currentConsultation.fichier.length > itemsPerPage && (
                      <div className="text-center mt-2">
                        <span className="text-xs text-gray-500">
                          Affichage {((piecesJointesPage - 1) * itemsPerPage) + 1}-{Math.min(piecesJointesPage * itemsPerPage, currentConsultation.fichier.length)} sur {currentConsultation.fichier.length}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Consultation Content */}
              <div className="lg:col-span-2 space-y-3">
                {/* Motif */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-1.5 text-sm">
                    <div className="bg-green-100 p-1 rounded">
                      <FileText className="text-green-600" size={14} />
                    </div>
                    Motif de consultation
                  </h3>
                  <div className="bg-gray-50 rounded p-3 max-h-[150px] overflow-y-auto">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {currentConsultation?.motif || "Aucun motif renseigné"}
                    </p>
                  </div>
                </div>

                {/* Traitement */}
                {currentConsultation?.traitement && currentConsultation.traitement.trim() !== '' && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-1.5 text-sm">
                      <div className="bg-amber-100 p-1 rounded">
                        <FileText className="text-amber-600" size={14} />
                      </div>
                      Traitement prescrit
                    </h3>
                    <div className="bg-amber-50 rounded p-3 max-h-[150px] overflow-y-auto border border-amber-200">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {currentConsultation.traitement}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            {consultations.length > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setIndex((index - 1 + consultations.length) % consultations.length);
                      setPiecesJointesPage(1);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center text-sm"
                  >
                    <ChevronLeft size={16} />
                    <span>Précédent</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {consultations.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setIndex(i);
                          setPiecesJointesPage(1);
                        }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                          i === index
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setIndex((index + 1) % consultations.length);
                      setPiecesJointesPage(1);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center text-sm"
                  >
                    <span>Suivant</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}