import React, { useState } from 'react';
import { Property } from '../../types';
import './PropertyImagePopup.css';

interface PropertyImagePopupProps {
  property: Property;
  onClose: () => void;
  position: { x: number; y: number };
}

const PropertyImagePopup: React.FC<PropertyImagePopupProps> = ({
  property,
  onClose,
  position
}) => {
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  if (!property.imageUrl) {
    return null;
  }

  const handleImageClick = () => {
    setIsImageExpanded(true);
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
        className="property-image-popup"
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
        <div className="popup-info">
          <p className="popup-rol">ROL: {property.rol}</p>
          <p className="popup-owner">Propietario: {property.propietario}</p>
        </div>
      </div>

      {isImageExpanded && (
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
              <p>ROL: {property.rol}</p>
              <p>Propietario: {property.propietario}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyImagePopup;