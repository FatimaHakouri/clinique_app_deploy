import React from 'react';
import Footer from '../common/Footer';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;