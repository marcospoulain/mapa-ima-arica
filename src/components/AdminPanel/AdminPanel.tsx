import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import AdminStats from './AdminStats';
import FileUpload from './FileUpload';
import FileUploadWithUpdate from './FileUploadWithUpdate';
import PropertyCreator from './PropertyCreator';
import PropertyTable from './PropertyTable';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'stats' | 'upload' | 'update' | 'create' | 'properties'>('stats');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const navigate = useNavigate();

  const isAdmin = state.user?.email === 'admin@ima.cl' || 
                 state.user?.email === 'test@mapa-ima.com' || 
                 state.user?.email === 'marcos.vergara@municipalidadarica.cl';
  const isReadOnly = state.user?.role === 'readonly';
  const isAuthenticated = state.user?.isAuthenticated;
  const userEmail = state.user?.email || state.user?.name || '';

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/');
  };

  const handleBackToMap = () => {
    navigate('/');
  };

  const handleClearAllData = () => {
    dispatch({ type: 'CLEAR_ALL_DATA' });
    setShowClearConfirm(false);
  };

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div className="admin-title">
              <img 
                src="/logo-horizontal-ima.png" 
                alt="Municipalidad de Arica" 
                className="admin-logo-image"
              />
              <div className="admin-title-text">
                {isAdmin ? (
                  <>
                    <h1 style={{ fontWeight: 'bold', color: 'white' }}>Panel de Administración</h1>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'white' }}>
                      Gestión de propiedades y datos del sistema
                    </p>
                  </>
                ) : isReadOnly ? (
                  <>
                    <h1 style={{ fontWeight: 'bold', color: 'white' }}>Panel de Administración</h1>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'white' }}>
                      Visualización completa del sistema (Solo Lectura)
                    </p>
                  </>
                ) : (
                  <>
                    <h1 style={{ fontWeight: 'bold' }}>Panel de Estadísticas</h1>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'white' }}>
                       Visualización de estadísticas de propiedades
                     </p>
                  </>
                )}
              </div>
            </div>
            <div className="admin-user-section">
              <div className="admin-user-info">
                <span>Bienvenido, {userEmail}</span>
                {isAdmin && <span className="admin-badge">👑 Administrador</span>}
                {isReadOnly && <span className="admin-badge readonly-badge">👁️ Solo Lectura</span>}
              </div>
              <div className="admin-actions">
                <button onClick={handleBackToMap} className="btn">
                  🗺️ Volver al Mapa
                </button>
                <button onClick={handleLogout} className="btn">
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Separador colorido */}
      <div className="color-separator"></div>

      <div className="container">
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Estadísticas
          </button>
          {(isAdmin || isReadOnly) && (
            <>
              <button
                className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                📁 Cargar Datos
              </button>
              <button
                className={`tab-btn ${activeTab === 'update' ? 'active' : ''}`}
                onClick={() => setActiveTab('update')}
              >
                🔄 Actualizar Datos
              </button>
              <button
                className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                ➕ Crear Propiedad
              </button>
              <button
                className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
                onClick={() => setActiveTab('properties')}
              >
                🏠 Gestionar Propiedades
              </button>
            </>
          )}
        </div>

        <div className="tab-content">
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'upload' && (isAdmin || isReadOnly) && <FileUpload />}
          {activeTab === 'update' && (isAdmin || isReadOnly) && <FileUploadWithUpdate />}
          {activeTab === 'create' && (isAdmin || isReadOnly) && <PropertyCreator />}
          {activeTab === 'properties' && (isAdmin || isReadOnly) && <PropertyTable />}
          
          {/* Mensaje para usuarios no admin que intentan acceder a tabs restringidos */}
          {!isAdmin && !isReadOnly && activeTab !== 'stats' && (
            <div className="access-restricted">
              <h3>🔒 Acceso Restringido</h3>
              <p>Esta funcionalidad está disponible solo para administradores.</p>
              <p>Puedes ver las estadísticas en la pestaña correspondiente.</p>
              <button 
                onClick={() => setActiveTab('stats')}
                className="btn btn-primary"
              >
                Ver Estadísticas
              </button>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="admin-actions">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="btn btn-danger"
            >
              🗑️ Limpiar Todos los Datos
            </button>
          </div>
        )}
      </div>

      {showClearConfirm && isAdmin && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>⚠️ Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar todos los datos?</p>
            <p>Esta acción no se puede deshacer.</p>
            <div className="popup-actions">
              <button
                onClick={handleClearAllData}
                className="btn btn-danger"
              >
                Sí, eliminar todo
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="popup-close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;