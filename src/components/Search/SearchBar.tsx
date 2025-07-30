import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'semantic-ui-react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';
import './SearchBar.css';

const SearchBar: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'direccion' | 'rol'>('direccion');
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm, searchType);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchType, state.properties]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = (term: string, type: 'direccion' | 'rol') => {
    const filtered = state.properties.filter(property => {
      if (type === 'direccion') {
        return property.direccion?.toLowerCase().includes(term.toLowerCase());
      } else {
        return (property.numeroRol || property.rol || '').toString().includes(term);
      }
    });

    setSearchResults(filtered.slice(0, 10)); // Limit to 10 results
    setShowResults(filtered.length > 0);
  };

  const handleSelectProperty = (property: Property) => {
    dispatch({ type: 'SELECT_PROPERTY', payload: property });
    setShowResults(false);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    dispatch({ type: 'SELECT_PROPERTY', payload: null });
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-wrapper">
        <div className="search-type-buttons">
          <button
            type="button"
            className={`search-type-btn ${searchType === 'direccion' ? 'active' : ''}`}
            onClick={() => setSearchType('direccion')}
            title="Buscar por dirección"
          >
            <Icon name="map marker alternate" />
          </button>
          <button
            type="button"
            className={`search-type-btn ${searchType === 'rol' ? 'active' : ''}`}
            onClick={() => setSearchType('rol')}
            title="Buscar por ROL"
          >
            <Icon name="search" />
          </button>
        </div>
        
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchType === 'direccion' ? 'Buscar por dirección...' : 'Buscar por ROL...'}
            className="search-input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="clear-search-btn"
              title="Limpiar búsqueda"
            >
              <Icon name="times" />
            </button>
          )}
        </div>
      </div>

      {showResults && (
        <div className="search-results">
          <div className="search-results-header">
            <span>Resultados ({searchResults.length})</span>
          </div>
          <div className="search-results-list">
            {searchResults.map((property) => (
              <div
                key={property.id}
                className="search-result-item"
                onClick={() => handleSelectProperty(property)}
              >
                <div className="result-main">
                  <span className="result-rol">ROL: {property.numeroRol || property.rol}</span>
                  <span className="result-address">{property.direccion}</span>
                </div>
                <div className="result-details">
                  <span className="result-value">${(property.avaluoTotal || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;