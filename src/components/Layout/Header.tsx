import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import SearchBar from '../Search/SearchBar';
import { useApp } from '../../context/AppContext';
import './Header.css';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Recargar la página inicial
    window.location.href = '/';
  };

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/');
  };

  const isAuthenticated = state.user?.isAuthenticated;
  const isAdmin = state.user?.email === 'admin@ima.cl' || 
                 state.user?.email === 'test@mapa-ima.com' || 
                 state.user?.email === 'marcos.vergara@municipalidadarica.cl';
  const isReadOnly = state.user?.role === 'readonly';
  const userEmail = state.user?.email || state.user?.name || '';

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
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="user-info">
                  {userEmail}
                  {isAdmin && <span className="user-badge admin">👑</span>}
                  {isReadOnly && <span className="user-badge readonly">👁️</span>}
                </span>
                <Link to="/admin" className="nav-link admin-link" title="Panel de Administración">
                  <Icon name="settings" size="large" />
                </Link>
                <button onClick={handleLogout} className="nav-link logout-btn" title="Cerrar Sesión">
                  <Icon name="sign out" size="large" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-link login-link" title="Iniciar Sesión">
                <Icon name="user circle" size="large" />
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;