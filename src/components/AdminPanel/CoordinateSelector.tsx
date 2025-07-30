import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CoordinateSelector.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface CoordinateSelectorProps {
  onCoordinateSelect: (lat: number, lng: number, address?: string) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface MapUpdaterProps {
  center: [number, number];
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 15);
  }, [map, center]);
  
  return null;
};

const CoordinateSelector: React.FC<CoordinateSelectorProps> = ({
  onCoordinateSelect,
  onClose,
  initialLat,
  initialLng
}) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialLat && initialLng ? [initialLat, initialLng] : [-18.4783, -70.3126] // Arica, Chile por defecto
  );
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundAddress, setFoundAddress] = useState<string>('');

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
  };

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) {
      setSearchError('Por favor ingresa una dirección');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      // Usar Nominatim API para geocodificación
      const query = encodeURIComponent(`${searchAddress}, Arica, Chile`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=cl`
      );
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const displayName = data[0].display_name;
        
        setSelectedPosition([lat, lng]);
        setMapCenter([lat, lng]);
        setFoundAddress(displayName);
        setSearchError('');
      } else {
        setSearchError('No se encontró la dirección. Intenta con una dirección más específica.');
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchError('Error al buscar la dirección. Intenta nuevamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddressSearch();
    }
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onCoordinateSelect(selectedPosition[0], selectedPosition[1], foundAddress);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedPosition([lat, lng]);
          setMapCenter([lat, lng]);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener la ubicación actual');
        }
      );
    } else {
      alert('Geolocalización no soportada por este navegador');
    }
  };

  return (
    <div className="coordinate-selector-overlay">
      <div className="coordinate-selector-modal">
        <div className="coordinate-selector-header">
          <h3>Seleccionar Coordenadas</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="coordinate-selector-content">
          <div className="search-section">
            <h4>Buscar por Dirección</h4>
            <div className="search-container">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Ej: Av. Capitán Ávalos 1234, Arica"
                className="search-input"
                disabled={isSearching}
              />
              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={isSearching || !searchAddress.trim()}
                className="search-btn"
              >
                {isSearching ? '🔍' : '🔍'}
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {searchError && (
              <div className="search-error">
                ⚠️ {searchError}
              </div>
            )}
          </div>

          <div className="coordinate-info">
            <p>O haz clic directamente en el mapa para seleccionar las coordenadas</p>
            {selectedPosition && (
              <div className="selected-coordinates">
                <strong>Coordenadas seleccionadas:</strong>
                <br />
                Latitud: {selectedPosition[0].toFixed(6)}
                <br />
                Longitud: {selectedPosition[1].toFixed(6)}
                {foundAddress && (
                  <>
                    <br />
                    <strong>Dirección:</strong> {foundAddress}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '350px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              <MapUpdater center={mapCenter} />
              {selectedPosition && (
                <Marker position={selectedPosition} />
              )}
            </MapContainer>
          </div>
        </div>
        
        <div className="coordinate-selector-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCurrentLocation}
          >
            📍 Usar Ubicación Actual
          </button>
          <div className="action-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={!selectedPosition}
            >
              Confirmar Coordenadas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinateSelector;