import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddPatientS() {
  const [form, setForm] = useState({ 
    nom: "", 
    prenom: "", 
    email: "", 
    tel: "", 
    adresse: "",
    cin: ""  // Ajout du champ CIN
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "nom":
      case "prenom":
        if (!value.trim()) {
          newErrors[name] = "Ce champ est obligatoire";
        } else if (value.length < 2) {
          newErrors[name] = "Doit contenir au moins 2 caractères";
        } else if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)) {
          newErrors[name] = "Ne doit contenir que des lettres";
        } else {
          delete newErrors[name];
        }
        break;
        
      case "email":
        if (!value.trim()) {
          newErrors[name] = "L'email est obligatoire";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = "Format d'email invalide";
        } else {
          delete newErrors[name];
        }
        break;
        
      case "tel":
        if (!value.trim()) {
          newErrors[name] = "Le téléphone est obligatoire";
        } else if (!/^[0-9+\-\s()]{10,}$/.test(value)) {
          newErrors[name] = "Format de téléphone invalide";
        } else if (value.replace(/[^0-9]/g, '').length < 10) {
          newErrors[name] = "Doit contenir au moins 10 chiffres";
        } else {
          delete newErrors[name];
        }
        break;
        
      case "adresse":
        if (!value.trim()) {
          newErrors[name] = "L'adresse est obligatoire";
        } else if (value.length < 5) {
          newErrors[name] = "L'adresse est trop courte";
        } else {
          delete newErrors[name];
        }
        break;

      case "cin":
        if (!value.trim()) {
          newErrors[name] = "Le CIN est obligatoire";
        } else if (!/^[A-Za-z0-9]{5,}$/.test(value)) {
          newErrors[name] = "Format de CIN invalide";
        } else if (value.length < 5) {
          newErrors[name] = "Le CIN doit contenir au moins 5 caractères";
        } else {
          delete newErrors[name];
        }
        break;
        
      default:
        break;
    }
    
    return newErrors;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validation en temps réel
    const newErrors = validateField(name, value);
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    else if (form.nom.length < 2) newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    else if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(form.nom)) newErrors.nom = "Le nom ne doit contenir que des lettres";
    
    if (!form.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    else if (form.prenom.length < 2) newErrors.prenom = "Le prénom doit contenir au moins 2 caractères";
    else if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(form.prenom)) newErrors.prenom = "Le prénom ne doit contenir que des lettres";
    
    if (!form.email.trim()) newErrors.email = "L'email est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Format d'email invalide";
    
    if (!form.tel.trim()) newErrors.tel = "Le téléphone est obligatoire";
    else if (!/^[0-9+\-\s()]{10,}$/.test(form.tel)) newErrors.tel = "Format de téléphone invalide";
    else if (form.tel.replace(/[^0-9]/g, '').length < 10) newErrors.tel = "Le téléphone doit contenir au moins 10 chiffres";
    
    if (!form.adresse.trim()) newErrors.adresse = "L'adresse est obligatoire";
    else if (form.adresse.length < 5) newErrors.adresse = "L'adresse est trop courte";
    
    if (!form.cin.trim()) newErrors.cin = "Le CIN est obligatoire";
    else if (!/^[A-Za-z0-9]{5,}$/.test(form.cin)) newErrors.cin = "Format de CIN invalide";
    else if (form.cin.length < 5) newErrors.cin = "Le CIN doit contenir au moins 5 caractères";
    
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout du patient");

      setSuccess(true);
      setTimeout(() => navigate("/secretaire/dashboard/patients"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm";
    
    if (errors[fieldName]) {
      return `${baseClass} border-red-500 bg-red-50`;
    }
    
    return `${baseClass} border-gray-300`;
  };

  return (
    <div className="min-h-fit bg-white py-4 px-4">
      <div className="max-w-md mx-auto">
        
        {/* En-tête EN DEHORS du formulaire */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Ajouter un patient</h2>
        </div>

        {/* Messages d'alerte */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg transition-all duration-300">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-green-800">Patient ajouté avec succès !</p>
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
                  className={getInputClassName(field)}
                  required
                 
                />
                {errors[field] && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Bouton Ajouter avec icône */}
          <button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
            className={`w-full mt-4 py-2 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center text-sm ${
              isLoading || Object.keys(errors).length > 0
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
                Ajout en cours...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter le patient
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