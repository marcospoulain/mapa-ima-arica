import React, { useState } from 'react';
import { Property } from '../../types';
import './PropertyInfoPopup.css';

interface PropertyInfoPopupProps {
  property: Property;
  onClose: () => void;
  position: { x: number; y: number };
}

const PropertyInfoPopup: React.FC<PropertyInfoPopupProps> = ({
  property,
  onClose,
  position
}) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const handleImageClick = () => {
    if (property.imageUrl) {
      setIsImageExpanded(true);
    }
  };

  const handleExpandedClose = () => {
    setIsImageExpanded(false);
  };

  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div 
        className="property-info-popup"
        style={{
          left: position.x,
          top: position.y
        }}
        onClick={handlePopupClick}
      >
        <div className="popup-header">
          <h4 className="popup-title">{property.direccion}</h4>
          <button className="popup-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="popup-content">
          <div className="popup-info">
            <div className="info-row">
              <span className="info-label">ROL:</span>
              <span className="info-value">{property.numeroRol || property.rol}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Propietario:</span>
              <span className="info-value">{property.propietario}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Superficie Terreno:</span>
              <span className="info-value">{(property.superficieTerreno || 0).toLocaleString()} m²</span>
            </div>
            <div className="info-row">
              <span className="info-label">Superficie Construcción:</span>
              <span className="info-value">{(property.superficieConstrucciones || property.superficieConstruccion || 0).toLocaleString()} m²</span>
            </div>
            <div className="info-row">
              <span className="info-label">Avalúo Terreno:</span>
              <span className="info-value">${(property.avaluoTerrenoPropio || property.avaluoTerreno || 0).toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Avalúo Construcción:</span>
              <span className="info-value">${(property.avaluoConstrucciones || property.avaluoConstruccion || 0).toLocaleString()}</span>
            </div>
            <div className="info-row highlight">
              <span className="info-label">Avalúo Total:</span>
              <span className="info-value">${(property.avaluoTotal || 0).toLocaleString()}</span>
            </div>
          </div>
          
          {property.imageUrl && (
            <div className="popup-image-section">
              <div className="popup-image-container" onClick={handleImageClick}>
                <img 
                  src={property.imageUrl} 
                  alt={`Propiedad en ${property.direccion}`}
                  className="popup-image"
                  title="Click para agrandar"
                />
                <div className="image-expand-hint">
                  <span>🔍</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isImageExpanded && property.imageUrl && (
        <div className="image-modal-overlay" onClick={handleExpandedClose}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={handleExpandedClose}>
              ×
            </button>
            <img 
              src={property.imageUrl} 
              alt={`Propiedad en ${property.direccion}`}
              className="image-modal-img"
            />
            <div className="image-modal-info">
              <h3>{property.direccion}</h3>
              <p>ROL: {property.numeroRol || property.rol}</p>
              <p>Propietario: {property.propietario}</p>
              <p>Avalúo Total: ${(property.avaluoTotal || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyInfoPopup;