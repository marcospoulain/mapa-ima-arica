import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import SearchBar from '../Search/SearchBar';
import './Header.css';

const Header: React.FC = () => {
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Recargar la página inicial
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="header-logo" onClick={handleLogoClick}>
            <img 
              src="/logo-horizontal-ima.png" 
              alt="Municipalidad de Arica" 
              className="logo-image"
            />
          </Link>
          
          <div className="header-search">
            <SearchBar />
          </div>
          
          <nav className="header-nav">
            <Link to="/login" className="nav-link login-link" title="Iniciar Sesión">
              <Icon name="user circle" size="large" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;