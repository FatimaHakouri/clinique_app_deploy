// src/pages/secretaire/dossier-medical/DossierMedicalListS.jsx
import { useState, useEffect } from "react";
import { FileText, User, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const DossierMedicalListS = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 6;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/patients");
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: Impossible de charger les patients.`);
      }
      
      const data = await response.json();
      setPatients(data);
      setFilteredPatients(data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des patients :", err);
      setError(err.message || "Une erreur inconnue s'est produite.");
      setLoading(false);
    }
  };

  // Filtrer les patients localement
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      setCurrentPage(1);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = patients.filter((patient) =>
        (patient.nom && patient.nom.toLowerCase().includes(term)) ||
        (patient.prenom && patient.prenom.toLowerCase().includes(term)) ||
        (patient.cin && patient.cin.toLowerCase().includes(term)) ||
        (patient.email && patient.email.toLowerCase().includes(term))
      );
      setFilteredPatients(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, patients]);

  // Calcul des patients pour la page actuelle
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Changement de page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Réinitialiser la recherche
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <FileText size={20} className="text-blue-600" />
          Dossiers Médicaux
        </h1>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2 text-sm">Chargement des patients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <FileText size={20} className="text-blue-600" />
          Dossiers Médicaux
        </h1>
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">Erreur lors du chargement</p>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchPatients}
            className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* En-tête */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          Dossiers Médicaux
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Consultation des dossiers - Secrétaire
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {filteredPatients.length} patient(s) trouvé(s)
        </p>
      </div>

      {/* Liste des patients avec pagination */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <User size={20} className="text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">
            {searchTerm ? "Aucun patient trouvé" : "Aucun patient"}
          </h3>
          <p className="text-xs text-gray-500">
            {searchTerm 
              ? 'Essayez avec d\'autres termes'
              : 'Aucun dossier médical disponible'}
          </p>
        </div>
      ) : (
        <>
          {/* Liste des patients */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {currentPatients.map((patient) => (
              <Link
                key={patient.id}
                to={`/secretaire/dashboard/dossier-medical/${patient.id}`}
                className="block"
              >
                <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-150 cursor-pointer h-full">
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100 p-1.5 rounded">
                      <User size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                        {patient.nom} {patient.prenom}
                      </h3>
                      
                      <div className="space-y-1 mt-1 text-xs text-gray-600">
                        {patient.cin && (
                          <div className="flex items-center">
                            <span className="font-medium">CIN:</span>
                            <span className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono ml-1 truncate">
                              {patient.cin}
                            </span>
                          </div>
                        )}
                        
                        {patient.email && (
                          <div className="truncate">
                            <span className="font-medium">Email:</span>
                            <span className="ml-1 truncate">{patient.email}</span>
                          </div>
                        )}
                        
                        {patient.tel && (
                          <div className="flex items-center">
                            <span className="font-medium">Tél:</span>
                            <span className="ml-1">{patient.tel}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-blue-600 font-medium">
                          Voir dossier →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-gray-600">
                Page {currentPage} sur {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft size={14} />
                  Précédent
                </button>
                
                {/* Indicateurs de page */}
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-6 h-6 rounded text-xs ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Suivant
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      
    </div>
  );
};

export default DossierMedicalListS;