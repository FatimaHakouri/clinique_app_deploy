import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PencilSquareIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function PatientsListS() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [error, setError] = useState("");
  const [searchCIN, setSearchCIN] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/patients")
      .then(res => res.json())
      .then(data => {
        // Trier par ID décroissant
        const sortedPatients = data.sort((a, b) => b.id - a.id);
        setPatients(sortedPatients);
        setFilteredPatients(sortedPatients);
      })
      .catch(() => setError("Erreur de chargement des patients"))
      .finally(() => setLoading(false));
  }, []);

  // Filtrer les patients par CIN
  useEffect(() => {
    if (searchCIN.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.cin?.toLowerCase().includes(searchCIN.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchCIN, patients]);

  const resetSearch = () => {
    setSearchCIN("");
  };

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Chargement des patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Gestion des Patients
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {filteredPatients.length} patient(s) sur {patients.length} au total
          </p>
        </div>
        
        <Link
          to="/secretaire/dashboard/patients/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau Patient
        </Link>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold text-sm mb-1">Problème de connexion</h3>
              <p className="text-red-700 text-xs">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRE DE RECHERCHE */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Recherche de patient
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Recherche par CIN */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
              Rechercher par CIN
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchCIN}
                onChange={(e) => setSearchCIN(e.target.value)}
                placeholder="Entrez le numéro CIN..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Bouton réinitialiser */}
          <div className="flex items-end">
            <button
              onClick={resetSearch}
              disabled={!searchCIN}
              className={`w-full px-3 py-2 rounded text-sm transition-all duration-200 flex items-center justify-center transform hover:-translate-y-0.5 ${
                searchCIN 
                  ? 'bg-gray-500 text-white hover:bg-gray-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Indicateur de recherche active */}
        {searchCIN && (
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Recherche: {searchCIN}
              <button
                onClick={resetSearch}
                className="ml-1 text-blue-600 hover:text-blue-800 transition-colors text-xs"
              >
                ×
              </button>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {filteredPatients.length} résultat(s)
            </span>
          </div>
        )}
      </div>

      {/* Tableau des patients */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* En-tête du tableau */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white">
              Liste des Patients 
            </h3>
            <div className="text-blue-100 text-xs">
              {searchCIN ? `Recherche: ${searchCIN}` : 'Tous les patients'}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Nom & Prénom</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">CIN</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Email</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Téléphone</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-700">Adresse</th>
                <th className="p-3 text-center text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-blue-50 transition-colors duration-150 group"
                >
                  {/* Nom & Prénom */}
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {patient.nom} {patient.prenom}
                        </div>
                        
                      </div>
                    </div>
                  </td>

                  {/* CIN */}
                  <td className="p-3">
                    <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium group-hover:bg-blue-200 transition-colors">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                      </svg>
                      {patient.cin}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-3">
                    <div className="text-gray-900 text-sm">
                      {patient.email}
                    </div>
                  </td>

                  {/* Téléphone */}
                  <td className="p-3">
                    <div className="text-gray-900 text-sm">
                      {patient.tel}
                    </div>
                  </td>

                  {/* Adresse */}
                  <td className="p-3">
                    <div className="text-gray-900 text-sm max-w-xs truncate">
                      {patient.adresse}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center justify-center space-x-1">
                      <Link 
                        to={`/secretaire/dashboard/patients/edit/${patient.id}`} 
                        className="inline-flex items-center p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        title="Modifier le patient"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Message si aucun patient */}
        {filteredPatients.length === 0 && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {patients.length === 0 ? 'Aucun patient' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {patients.length === 0 
                ? "Commencez par ajouter votre premier patient" 
                : "Aucun patient ne correspond à votre recherche"
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {patients.length > 0 && searchCIN && (
                <button
                  onClick={resetSearch}
                  className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors duration-200"
                >
                  Afficher tous les patients
                </button>
              )}
              <Link
                to="/secretaire/patients/add"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors duration-200"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Ajouter un patient
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}