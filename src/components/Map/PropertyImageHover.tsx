import React, { useEffect, useState } from 'react';
import { Property } from '../../types';
import './PropertyImageHover.css';

interface PropertyImageHoverProps {
  property: Property;
  position: { x: number; y: number };
}

const PropertyImageHover: React.FC<PropertyImageHoverProps> = ({
  property,
  position
}) => {
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    // Ajustar posición para evitar que el tooltip salga de la pantalla
    const tooltipWidth = 250;
    const tooltipHeight = 200;
    const padding = 10;

    let newX = position.x;
    let newY = position.y;

    // Verificar límites horizontales
    if (newX + tooltipWidth / 2 > window.innerWidth - padding) {
      newX = window.innerWidth - tooltipWidth / 2 - padding;
    }
    if (newX - tooltipWidth / 2 < padding) {
      newX = tooltipWidth / 2 + padding;
    }

    // Verificar límites verticales
    if (newY - tooltipHeight < padding) {
      newY = tooltipHeight + padding;
    }

    setAdjustedPosition({ x: newX, y: newY });
  }, [position]);

  if (!property.imageUrl) {
    return null;
  }

  // Determinar el tipo de propiedad basado en el destino
  const getPropertyType = (destino: string) => {
    if (!destino) return 'Propiedad';
    const destinoLower = destino.toLowerCase();
    if (destinoLower.includes('oficina') || destinoLower.includes('office')) return 'Oficina';
    if (destinoLower.includes('casa') || destinoLower.includes('house')) return 'Casa';
    if (destinoLower.includes('departamento') || destinoLower.includes('apartment')) return 'Departamento';
    if (destinoLower.includes('comercial') || destinoLower.includes('commercial')) return 'Local Comercial';
    return 'Propiedad';
  };

  const propertyType = getPropertyType(property.destino || property.destinoBienRaiz || '');
  const totalArea = (property.superficieTerreno || 0) + (property.superficieConstrucciones || property.superficieConstruccion || 0);

  return (
    <div 
      className="property-image-hover"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`
      }}
    >
      <div className="hover-image-container">
        <img 
          src={property.imageUrl} 
          alt={`Propiedad en ${property.direccion}`}
          className="hover-image"
          onError={(e) => {
            // Ocultar tooltip si la imagen no carga
            const target = e.target as HTMLImageElement;
            const container = target.closest('.property-image-hover') as HTMLElement;
            if (container) {
              container.style.display = 'none';
            }
          }}
        />
      </div>
      <div className="hover-info">
        <div className="hover-title">{propertyType}</div>
        <div className="hover-address">{property.direccion}</div>
        <div className="hover-details">
          {totalArea > 0 && (
            <span className="hover-area">{totalArea.toLocaleString()} m²</span>
          )}
          {property.avaluoTotal > 0 && (
            <span className="hover-price">${property.avaluoTotal.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyImageHover;