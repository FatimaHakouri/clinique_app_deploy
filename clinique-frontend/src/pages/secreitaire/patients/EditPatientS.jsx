import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditPatientS() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    nom: "", 
    prenom: "", 
    email: "", 
    tel: "", 
    adresse: "",
    cin: ""  // Ajout du champ CIN
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8080/api/patients/${id}`)
      .then(res => res.json())
      .then(data => setForm(data))
      .catch(() => setError("Impossible de charger le patient"));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Erreur lors de la modification");

      setSuccess(true);
      setTimeout(() => navigate("/secretaire/dashboard/patients"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-fit bg-white py-4 px-4">
      <div className="max-w-md mx-auto">
        
        {/* En-tête EN DEHORS du formulaire */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Modifier le patient</h2>
        </div>

        {/* Messages d'alerte */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg transition-all duration-300">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-green-800">Patient modifié avec succès !</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg transition-all duration-300">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Formulaire SANS en-tête à l'intérieur */}
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-full space-y-3">
            {["nom", "prenom", "email", "tel", "cin", "adresse"].map(field => (
              <div key={field} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)} *
                </label>
                <input
                  type={field === "email" ? "email" : field === "tel" ? "tel" : "text"}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm"
                  required
                  placeholder={field === "cin" ? "Ex: AB12345" : ""}
                />
              </div>
            ))}
          </div>

          {/* Bouton Modifier avec icône */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-4 py-2 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center text-sm ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Modification en cours...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier le patient
              </>
            )}
          </button>
        </form>

        {/* Flèche de retour */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/secretaire/dashboard/patients")}
            className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
            title="Retour à la liste"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}