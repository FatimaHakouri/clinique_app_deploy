import { Link, useLocation } from "react-router-dom";
import { CalendarDays, Users, User, LogOut, Stethoscope, LayoutDashboard } from "lucide-react";

export default function SidebarS() {
  const { pathname } = useLocation();

    const links = [
      { to: ".", label: "Tableau de bord", icon: <LayoutDashboard size={20} /> },
      { to: "patients", label: "Patients", icon: <Users size={20} /> },
      { to: "appointments", label: "Rendez-vous", icon: <CalendarDays size={20} /> },
      { to: "dossier-medical", label: "Dossier Médicaux", icon: <Stethoscope size={20} /> },
  ];


  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-blue-700 to-blue-900 text-white flex flex-col justify-between shadow-xl">
      {/* ---- HEADER ---- */}
      <div>
        <div className="flex items-center gap-3 p-6 border-b border-blue-500">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-700 font-bold text-lg">
            👩‍💼
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight">Espace Secrétaire</h2>
            <p className="text-sm text-purple-200">Clinique Manager</p>
          </div>
        </div>

        {/* ---- MENU ---- */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`flex items-center gap-3 px-6 py-2.5 transition rounded-lg ${pathname === l.to ? "bg-blue-700" : "hover:bg-blue-700"
                    }`}
                >
                  {l.icon}
                  <span>{l.label}</span>
                </Link>
              </li>
            ))}
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
}
