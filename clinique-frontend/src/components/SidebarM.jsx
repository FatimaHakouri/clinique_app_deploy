import { Link } from "react-router-dom";
import { Home, CalendarDays, FileText, Users, ClipboardList, User, LogOut } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col justify-between shadow-xl">
      {/* ---- HEADER ---- */}
      <div>
        <div className="flex items-center gap-3 p-6 border-b border-blue-500">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-700 font-bold text-lg">
            👨‍⚕️
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight">Espace Médecin</h2>
            <p className="text-sm text-blue-200">Clinique Manager</p>
          </div>
        </div>

        {/* ---- MENU ---- */}
        <nav className="mt-4">
          <ul className="space-y-1">
            <li>
              <Link
                to="/medecin/dashboard"
                className="flex items-center gap-3 px-6 py-2.5 hover:bg-blue-800 transition rounded-lg"
              >
                <Home size={20} />
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li>
              <Link
                to="/medecin/rendezvous"
                className="flex items-center gap-3 px-6 py-2.5 hover:bg-blue-800 transition rounded-lg"
              >
                <CalendarDays size={20} />
                <span>Rendez-vous</span>
              </Link>
            </li>
            <li>
              <Link
                to="/medecin/patients"
                className="flex items-center gap-3 px-6 py-2.5 hover:bg-blue-800 transition rounded-lg"
              >
                <Users size={20} />
                <span>Mes Patients</span>
              </Link>
            </li>
            <li>
              <Link
                to="/medecin/dossiers-medicaux"
                className="flex items-center gap-3 px-6 py-2.5 hover:bg-blue-800 transition rounded-lg"
              >
                <ClipboardList size={20} />
                <span>Dossiers Médicaux</span>
              </Link>
            </li>
            
            <li>
              <Link
                to="/medecin/profil"
                className="flex items-center gap-3 px-6 py-2.5 hover:bg-blue-800 transition rounded-lg"
              >
                <User size={20} />
                <span>Mon Profil</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* ---- LOGOUT ---- */}
      <div className="p-6 border-t border-blue-500">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-red-600 bg-red-500 rounded-lg transition"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
