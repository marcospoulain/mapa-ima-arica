import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import FileUpload from './FileUpload';
import PropertyTable from './PropertyTable';
import AdminStats from './AdminStats';
import PropertyCreator from './PropertyCreator';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'stats' | 'create'>('stats');

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/');
  };

  const handleClearAllData = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todas las propiedades? Esta acción no se puede deshacer.')) {
      dispatch({ type: 'CLEAR_ALL_PROPERTIES' });
      localStorage.removeItem('arica-properties');
      dispatch({ type: 'SET_ERROR', payload: null });
      alert('Todos los datos han sido eliminados exitosamente.');
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div className="admin-title">
              <div className="admin-logo">
                <img 
                  src="/logo-horizontal-ima.png" 
                  alt="IMA Logo" 
                  className="admin-logo-image"
                />
              </div>
              <div className="admin-title-text">
                <h1>Panel de Administración</h1>
                <p>Municipalidad de Arica - Gestión de Propiedades</p>
              </div>
            </div>
            <div className="admin-actions">
              <button onClick={() => navigate('/')} className="btn btn-secondary">
                Ver Mapa
              </button>
              <button onClick={handleLogout} className="btn btn-danger">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              📊 Estadísticas
            </button>
            <button
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              📁 Cargar Datos
            </button>
            <button
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              ➕ Crear Propiedad
            </button>
            <button
              className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              📋 Gestionar Propiedades
            </button>
          </div>

          {state.error && (
            <div className="error">
              {state.error}
              <button 
                onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
                className="error-close"
              >
                ✕
              </button>
            </div>
          )}

          <div className="tab-content">
            {activeTab === 'stats' && <AdminStats />}
            {activeTab === 'upload' && <FileUpload />}
            {activeTab === 'create' && <PropertyCreator />}
            {activeTab === 'manage' && <PropertyTable />}
          </div>

          {state.properties.length > 0 && (
            <div className="admin-danger-zone">
              <h3>Zona de Peligro</h3>
              <p>Las siguientes acciones son irreversibles:</p>
              <button 
                onClick={handleClearAllData}
                className="btn btn-danger"
              >
                🗑️ Eliminar Todas las Propiedades
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;