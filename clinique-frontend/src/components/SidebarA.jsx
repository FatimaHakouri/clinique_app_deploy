// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  BarChart2, 
  MessageSquare, 
  LogOut,
  TrendingUp,
  Activity 
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-white shadow-md p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
            <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-800">HospitalAdmin</h1>
      </div>

      {/* Menu */}
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Home size={20} />
              Dashboard
            </Link>
          </li>

          <li>
            <Link
              to="/admin/staff"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Users size={20} />
              Personnel
            </Link>
          </li>

          <li>
            <Link
              to="/admin/specialites"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Calendar size={20} />
              Spécialités
            </Link>
          </li>
          <li>
            <Link
              to="/admin/statistiques"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <TrendingUp size={20} />
              Rapports et statistiques
            </Link>
          </li>

          <li>
            <Link
              to="/admin/activites"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Activity size={20} />
              Activités récentes
            </Link>
          </li>

          <li>
            <Link
              to="/logout"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition"
            >
              <LogOut size={20} />
              Déconnexion
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;