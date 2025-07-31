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
          <div className="property-section">
            <h3>Imagen</h3>
            {selectedProperty.imageUrl ? (
              <div className="property-image-container" onClick={openImageModal}>
                <img 
                  src={selectedProperty.imageUrl} 
                  alt={`Propiedad ${selectedProperty.numeroRol || selectedProperty.title}`}
                  className="property-image"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="image-overlay">
                  <div className="zoom-text">
                    🔍 Clic para ampliar
                  </div>
                </div>
              </div>
            ) : (
              <div className="property-image-container">
                <div className="no-image">
                  <span>Sin imagen disponible</span>
                </div>
              </div>
            )}
          </div>

          <div className="property-section">
            <h3>Identificación</h3>
            <div className="property-field">
              <label>N° ROL de Avalúo:</label>
              <span className="value highlight">{selectedProperty.numeroRol || selectedProperty.title}</span>
            </div>
            <div className="property-field">
              <label>Destino del bien raíz:</label>
              <span className="value">{selectedProperty.destinoBienRaiz || selectedProperty.type}</span>
            </div>
          </div>

          <div className="property-section">
            <h3>Propietario</h3>
            <div className="property-field">
              <label>Registrado a nombre de:</label>
              <span className="value">{selectedProperty.registradoNombre || 'No disponible'}</span>
            </div>
            <div className="property-field">
              <label>RUT registrado:</label>
              <span className="value">{selectedProperty.rutRegistrado || 'No disponible'}</span>
            </div>
          </div>

          <div className="property-section">
            <h3>Superficies</h3>
            <div className="property-field">
              <label>Superficie Terreno:</label>
              <span className="value">{(selectedProperty.superficieTerreno || selectedProperty.area || 0).toLocaleString()} m²</span>
            </div>
            <div className="property-field">
              <label>Superficie Construcciones:</label>
              <span className="value">{(selectedProperty.superficieConstrucciones || 0).toLocaleString()} m²</span>
            </div>
          </div>

          <div className="property-section">
            <h3>Avalúos</h3>
            <div className="property-field">
              <label>Avalúo Terreno Propio:</label>
              <span className="value">${(selectedProperty.avaluoTerrenoPropio || 0).toLocaleString()}</span>
            </div>
            <div className="property-field">
              <label>Avalúo Construcciones:</label>
              <span className="value">${(selectedProperty.avaluoConstrucciones || 0).toLocaleString()}</span>
            </div>
            <div className="property-field total">
              <label>Avalúo Total:</label>
              <span className="value highlight">${(selectedProperty.avaluoTotal || selectedProperty.price || 0).toLocaleString()}</span>
            </div>
            <div className="property-field">
              <label>Avalúo Exento de Impuesto:</label>
              <span className="value">${(selectedProperty.avaluoExentoImpuesto || 0).toLocaleString()}</span>
            </div>
            <div className="property-field">
              <label>Avalúo Afecto a Impuesto:</label>
              <span className="value">${(selectedProperty.avaluoAfectoImpuesto || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="property-section">
            <h3>Ubicación</h3>
            <div className="property-field">
              <label>Dirección:</label>
              <span className="value">{selectedProperty.direccion || selectedProperty.location}</span>
            </div>
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