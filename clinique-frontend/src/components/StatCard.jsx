// src/components/StatCard.jsx
import { Stethoscope, UserPlus, CalendarCheck, Clock } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon, color }) => {
  const iconColor = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    teal: 'text-teal-600'
  }[color];

  return (
    <div className={`p-6 rounded-xl shadow-sm ${color === 'blue' ? 'bg-blue-500' : 
                      color === 'green' ? 'bg-green-500' : 
                      color === 'purple' ? 'bg-purple-500' : 'bg-teal-500'} text-white`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className="text-sm opacity-80 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconColor} bg-white/20`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;