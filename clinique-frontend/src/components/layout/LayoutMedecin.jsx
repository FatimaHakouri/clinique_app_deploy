// src/components/layout/LayoutMedecin.jsx
import React from 'react';
import Sidebar from '../SidebarM';
import TopBar from '../TopBar';

const LayoutMedecin = ({ children }) => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* ➤ Sidebar fixe */}
      <div className="fixed left-0 top-0 h-full z-30 w-64 bg-white shadow-md">
        <Sidebar />
      </div>

      {/* ➤ Contenu principal */}
      <div className="flex-1 flex flex-col ml-64">
        {/* ➤ TopBar fixe */}
        <div className="fixed top-0 right-0 left-64 z-20 bg-white shadow-sm">
          <TopBar />
        </div>

        {/* ➤ Contenu scrollable */}
        <div className="pt-16 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LayoutMedecin;