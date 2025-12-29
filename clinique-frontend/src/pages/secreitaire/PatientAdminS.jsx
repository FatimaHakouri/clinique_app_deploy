import { useParams } from "react-router-dom";

export default function PatientAdminS() {

  const patient = {
    nom:"Dupont",
    prenom:"Jean",
    email:"jean@test.com",
    tel:"0600000000",
    adresse:"Paris",
    historiqueRDV:[
      { date:"2025-11-02", medecin:"Dr. Martin", statut:"Confirmé" },
      { date:"2025-11-10", medecin:"Dr. Dupuis", statut:"Annulé" }
    ],
    facturation:"Assuré"
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dossier Administratif</h2>

      <div className="bg-white p-6 rounded-xl shadow-md mb-4">
        <p><strong>Nom :</strong> {patient.nom}</p>
        <p><strong>Prénom :</strong> {patient.prenom}</p>
        <p><strong>Email :</strong> {patient.email}</p>
        <p><strong>Téléphone :</strong> {patient.tel}</p>
        <p><strong>Adresse :</strong> {patient.adresse}</p>
        <p><strong>Facturation / Assurances :</strong> {patient.facturation}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="font-bold mb-2">Historique des rendez-vous</h3>
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Médecin</th>
              <th className="p-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {patient.historiqueRDV.map((rdv, i) => (
              <tr key={i} className="border-b">
                <td className="p-2">{rdv.date}</td>
                <td className="p-2">{rdv.medecin}</td>
                <td className="p-2">{rdv.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
