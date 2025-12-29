import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X} from 'lucide-react';
import styles from '../CliniqueInfo.module.css'; // ✅ tu réutilises ton style existant

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logo}>🏥 SantéPlus</Link>
          <button
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <ul className={`${styles.navList} ${isMenuOpen ? styles.navListOpen : ''}`}>
          <li><Link to="/" className={styles.navLink}>Accueil</Link></li>
          <li><Link to="/services" className={styles.navLink}>Services</Link></li>
          <li><Link to="/medecins" className={styles.navLink}>Médecins</Link></li>
          <li><Link to="/urgences" className={styles.navLink}>Urgences</Link></li>
          <li><Link to="/contact" className={styles.navLink}>Contact</Link></li>
          <li>
            <Link to="/login" className={styles.ctaButton}>
              Login 
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
