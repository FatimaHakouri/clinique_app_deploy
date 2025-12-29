// src/components/SidebarP.js
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, FileText, User, LogOut } from "lucide-react";

const SidebarP = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col justify-between shadow-xl">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-3 p-6 border-b border-blue-500">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-700 font-bold text-lg">
            👤
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight">Espace Patient</h2>
            <p className="text-sm text-blue-200">Votre santé, notre priorité</p>
          </div>
        </div>

        {/* MENU */}
        <nav className="mt-4">
          <ul className="space-y-1">
            <li>
              <Link
                to="/patient/dashboard"
                className={`flex items-center gap-3 px-6 py-2.5 transition rounded-lg ${
                  isActive("/patient/dashboard") 
                    ? "bg-blue-800 border-r-4 border-white" 
                    : "hover:bg-blue-800"
                }`}
              >
                <Home size={20} />
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li>
              <Link
                to="/patient/rendezvous"
                className={`flex items-center gap-3 px-6 py-2.5 transition rounded-lg ${
                  isActive("/patient/rendezvous") 
                    ? "bg-blue-800 border-r-4 border-white" 
                    : "hover:bg-blue-800"
                }`}
              >
                <CalendarDays size={20} />
                <span>Mes Rendez-vous</span>
              </Link>
            </li>
            {/* Remplacer "Mes Consultations" par "Dossier Médical" */}
            <li>
              <Link
                to="/patient/dossier-medical"
                className={`flex items-center gap-3 px-6 py-2.5 transition rounded-lg ${
                  isActive("/patient/dossier-medical") 
                    ? "bg-blue-800 border-r-4 border-white" 
                    : "hover:bg-blue-800"
                }`}
              >
                <FileText size={20} />
                <span>Dossier Médical</span>
              </Link>
            </li>
            <li>
              <Link
                to="/patient/profil"
                className={`flex items-center gap-3 px-6 py-2.5 transition rounded-lg ${
                  isActive("/patient/profil") 
                    ? "bg-blue-800 border-r-4 border-white" 
                    : "hover:bg-blue-800"
                }`}
              >
                <User size={20} />
                <span>Mon Profil</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* LOGOUT */}
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

export default SidebarP;