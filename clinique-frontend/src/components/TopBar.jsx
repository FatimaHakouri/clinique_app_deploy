// src/components/TopBar.jsx
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logique de déconnexion
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirection vers login
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-end h-16 px-6 bg-white border-b">
  <div className="flex items-center gap-4">
    <button
      onClick={handleLogout}
      className="p-2 text-white-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
      title="Se déconnecter"
    >
      <LogOut size={20} />
    </button>
  </div>
</header>
  );
};

export default TopBar;