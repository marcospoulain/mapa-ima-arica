import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './PropertySidebar.css';

interface PropertySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertySidebar: React.FC<PropertySidebarProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useApp();
  const { selectedProperty } = state;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImageModalOpen) {
        setIsImageModalOpen(false);
      }
    };

    if (isImageModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isImageModalOpen]);

  if (!selectedProperty) return null;

  const handleClose = () => {
    dispatch({ type: 'SELECT_PROPERTY', payload: null });
    onClose();
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${selectedProperty.latitud},${selectedProperty.longitud}`;
    window.open(url, '_blank');
  };

  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={handleClose} />
      <div className={`property-sidebar ${selectedProperty ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>Información de Propiedad</h2>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>
        
        <div className="sidebar-content">
          {/* Image Section */}
          {selectedProperty.imageUrl && (
            <div className="property-section image-section">
              <h3>Imagen de la Propiedad</h3>
              <div className="property-image-container" onClick={openImageModal}>
                <img 
                  src={selectedProperty.imageUrl} 
                  alt="Propiedad" 
                  className="property-image"
                />
                <div className="image-overlay">
                  <span className="zoom-text">Click para ampliar</span>
                </div>
              </div>
            </div>
          )}

          <div className="property-section">
            <h3>Identificación</h3>
            <div className="property-field">
              <label>N° ROL de Avalúo:</label>
              <span className="value highlight">{selectedProperty.numeroRol}</span>
            </div>
            <div className="property-field">
              <label>Dirección:</label>
              <span className="value">{selectedProperty.direccion}</span>
            </div>
            <div className="property-field">
              <label>Destino del bien raíz:</label>
              <span className="value">{selectedProperty.destinoBienRaiz}</span>
            </div>
          </div>

          <div className="property-section">
            <h3>Propietario</h3>
            <div className="property-field">
              <label>Registrado a nombre de:</label>
              <span className="value">{selectedProperty.registradoNombre}</span>
            </div>
            <div className="property-field">
              <label>RUT registrado:</label>
              <span className="value">{selectedProperty.rutRegistrado}</span>
            </div>
          </div>

          <div className="property-section">
            <h3>Superficies</h3>
            <div className="property-field">
              <label>Superficie Terreno:</label>
              <span className="value">{selectedProperty.superficieTerreno.toLocaleString()} m²</span>
            </div>
            <div className="property-field">
              <label>Superficie Construcciones:</label>
              <span className="value">{selectedProperty.superficieConstrucciones.toLocaleString()} m²</span>
            </div>
          </div>

          <div className="property-section">
            <h3>Avalúos</h3>
            <div className="property-field">
              <label>Avalúo Terreno Propio:</label>
              <span className="value">${selectedProperty.avaluoTerrenoPropio.toLocaleString()}</span>
            </div>
            <div className="property-field">
              <label>Avalúo Construcciones:</label>
              <span className="value">${selectedProperty.avaluoConstrucciones.toLocaleString()}</span>
            </div>
            <div className="property-field total">
              <label>Avalúo Total:</label>
              <span className="value highlight">${selectedProperty.avaluoTotal.toLocaleString()}</span>
            </div>
            <div className="property-field">
              <label>Avalúo Exento de Impuesto:</label>
              <span className="value">${selectedProperty.avaluoExentoImpuesto.toLocaleString()}</span>
            </div>
            <div className="property-field">
              <label>Avalúo Afecto a Impuesto:</label>
              <span className="value">${selectedProperty.avaluoAfectoImpuesto.toLocaleString()}</span>
            </div>
          </div>

          <div className="property-section">
            <h3>Ubicación</h3>
            <div className="property-field">
              <label>Latitud:</label>
              <span className="value">{selectedProperty.latitud}</span>
            </div>
            <div className="property-field">
              <label>Longitud:</label>
              <span className="value">{selectedProperty.longitud}</span>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="btn btn-primary" onClick={openGoogleMaps}>
              Ver en Google Maps
            </button>
          </div>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {isImageModalOpen && selectedProperty.imageUrl && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>
              ✕
            </button>
            <img 
              src={selectedProperty.imageUrl} 
              alt="Propiedad - Vista ampliada" 
              className="image-modal-img"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PropertySidebar;