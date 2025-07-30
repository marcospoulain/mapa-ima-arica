import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';
import './MapComponent.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const selectedIcon = createCustomIcon('#ef4444');
const defaultIcon = createCustomIcon('#3b82f6');

// Component to handle map updates and markers
interface MapControllerProps {
  // No props needed anymore
}

const MapController: React.FC<MapControllerProps> = () => {
  const { state, dispatch } = useApp();
  const map = useMap();
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    if (markersRef.current) {
      map.removeLayer(markersRef.current);
    }

    // Create marker cluster group
    markersRef.current = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    // Add markers for each property
    if (state.properties.length > 0 && markersRef.current) {
      state.properties.forEach((property) => {
        if (property.latitud && property.longitud && !isNaN(property.latitud) && !isNaN(property.longitud)) {
          const isSelected = state.selectedProperty?.id === property.id;
          const icon = isSelected ? selectedIcon : defaultIcon;
          
          const marker = L.marker([property.latitud, property.longitud], { icon })
            .bindPopup(createPopupContent(property))
            .on('click', (e) => {
              // Prevent map click when clicking on marker
              L.DomEvent.stopPropagation(e);
              
              // Select the property
              dispatch({ type: 'SELECT_PROPERTY', payload: property });
              
              // El popup nativo de Leaflet se mostrará automáticamente
            });

          markersRef.current!.addLayer(marker);
        }
      });

      // Add cluster group to map
      if (markersRef.current) {
        map.addLayer(markersRef.current as L.Layer);

        // Only fit bounds on initial load, not when properties change due to selection
        if (!hasInitializedRef.current && markersRef.current.getLayers().length > 0) {
          try {
            const bounds = markersRef.current.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [20, 20] });
              hasInitializedRef.current = true;
            }
          } catch (error) {
            console.warn('Error fitting bounds:', error);
          }
        }
      }
    }

    // Cleanup function
    return () => {
      if (markersRef.current && map) {
        map.removeLayer(markersRef.current as L.Layer);
      }
    };
  }, [state.properties, state.selectedProperty, dispatch, map]);

  // Handle selected property view change
  useEffect(() => {
    if (state.selectedProperty && map) {
      const { latitud, longitud } = state.selectedProperty;
      if (latitud && longitud && !isNaN(latitud) && !isNaN(longitud)) {
        // Get current zoom level to maintain it
        const currentZoom = map.getZoom();
        // Only zoom in if current zoom is less than 14, otherwise maintain current zoom
        const targetZoom = currentZoom < 14 ? 14 : currentZoom;
        
        map.setView([latitud, longitud], targetZoom, {
          animate: true,
          duration: 1,
        });
      }
    }
    // Note: We don't reset the view when selectedProperty becomes null
    // This allows the user to stay in the same area after closing the sidebar
  }, [state.selectedProperty, map]);

  return null;
};

const createPopupContent = (property: Property) => {
  const imageSection = property.imageUrl ? 
    `<div class="popup-image-container">
       <img src="${property.imageUrl}" alt="Propiedad" class="popup-image" onclick="openImageModal('${property.imageUrl}')" />
       <div class="image-overlay">
         <span class="zoom-icon">🔍</span>
         <span class="zoom-text">Click para ampliar</span>
       </div>
     </div>` : '';
  
  return `
    <div class="custom-popup">
      ${imageSection}
      <div class="popup-info">
        <h3>ROL: ${property.numeroRol || property.rol || 'N/A'}</h3>
        <p><strong>Dirección:</strong> ${property.direccion || 'N/A'}</p>
        <p><strong>Superficie Terreno:</strong> ${(property.superficieTerreno || 0).toLocaleString()} m²</p>
        <p><strong>Superficie Construcción:</strong> ${(property.superficieConstrucciones || property.superficieConstruccion || 0).toLocaleString()} m²</p>
        <p><strong>Avalúo Terreno:</strong> $${(property.avaluoTerrenoPropio || property.avaluoTerreno || 0).toLocaleString()}</p>
        <p><strong>Avalúo Construcción:</strong> $${(property.avaluoConstrucciones || property.avaluoConstruccion || 0).toLocaleString()}</p>
        <p class="highlight"><strong>Avalúo Total:</strong> $${(property.avaluoTotal || 0).toLocaleString()}</p>
      </div>
    </div>
  `;
};

interface MapClickHandlerProps {
  onMapClick: () => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

const MapComponent: React.FC = () => {
  const { state } = useApp();
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  // Arica coordinates as default center
  const defaultCenter: [number, number] = [-18.4783, -70.3126];

  const handleMapClick = () => {
    // Clear any selected property when clicking on the map
  };

  // Add global function for opening image modal
  useEffect(() => {
    (window as any).openImageModal = (imageUrl: string) => {
      setImageModalUrl(imageUrl);
    };

    return () => {
      delete (window as any).openImageModal;
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // Cleanup function if needed
    };
  }, []);

  return (
    <div className="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        <MapClickHandler onMapClick={handleMapClick} />
        <MapController />
      </MapContainer>
      
      {/* Image Modal */}
      {imageModalUrl && (
        <div className="image-modal-overlay" onClick={() => setImageModalUrl(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="image-modal-close" 
              onClick={() => setImageModalUrl(null)}
            >
              ✕
            </button>
            <img src={imageModalUrl} alt="Propiedad ampliada" className="image-modal-img" />
          </div>
        </div>
      )}
      
      {state.loading && (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Cargando propiedades...</p>
        </div>
      )}
      
      {state.properties.length === 0 && !state.loading && (
        <div className="map-empty">
          <p>No hay propiedades para mostrar</p>
          <p>Carga un archivo Excel desde el panel de administración</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;