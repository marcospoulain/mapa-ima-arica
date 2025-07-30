import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';
import PropertyModal from './PropertyModal';
import './PropertyTable.css';

const PropertyTable: React.FC = () => {
  const { state, dispatch, savePropertiesToStorage } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Property>('numeroRol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = state.properties.filter(property =>
      property.numeroRol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.registradoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.rutRegistrado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.destinoBienRaiz.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.avaluoTotal.toString().includes(searchTerm) ||
      property.superficieTerreno.toString().includes(searchTerm)
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [state.properties, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredAndSortedProperties.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof Property) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (propertyId: string) => {
    const property = state.properties.find(p => p.id === propertyId);
    if (property && window.confirm(`¿Estás seguro de que quieres eliminar la propiedad ROL ${property.numeroRol}?`)) {
      dispatch({ type: 'DELETE_PROPERTY', payload: propertyId });
      const updatedProperties = state.properties.filter(p => p.id !== propertyId);
      savePropertiesToStorage(updatedProperties);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
  };

  const handleSaveEdit = (updatedProperty: Property) => {
    dispatch({ type: 'UPDATE_PROPERTY', payload: updatedProperty });
    const updatedProperties = state.properties.map(p => 
      p.id === updatedProperty.id ? updatedProperty : p
    );
    savePropertiesToStorage(updatedProperties);
    setEditingProperty(null);
  };

  const getSortIcon = (field: keyof Property) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (state.properties.length === 0) {
    return (
      <div className="property-table">
        <h2>Gestión de Propiedades</h2>
        <div className="no-properties">
          <div className="no-properties-icon">📋</div>
          <h3>No hay propiedades registradas</h3>
          <p>Carga un archivo Excel para comenzar a gestionar las propiedades.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="property-table">
      <h2>Gestión de Propiedades</h2>
      
      <div className="table-controls">
        <div className="search-control">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Buscar por ROL, dirección, propietario, RUT, destino, avalúo o superficie..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input search-input"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="clear-search-btn"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="pagination-control">
          <label>
            Mostrar:
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="input"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>

      <div className="table-info">
        <span>
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedProperties.length)} 
          de {filteredAndSortedProperties.length} propiedades
          {searchTerm && ` (filtradas de ${state.properties.length} total)`}
        </span>
      </div>

      <div className="table-container">
        <table className="properties-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('numeroRol')} className="sortable">
                ROL {getSortIcon('numeroRol')}
              </th>
              <th onClick={() => handleSort('direccion')} className="sortable">
                Dirección {getSortIcon('direccion')}
              </th>
              <th onClick={() => handleSort('registradoNombre')} className="sortable">
                Propietario {getSortIcon('registradoNombre')}
              </th>
              <th onClick={() => handleSort('avaluoTotal')} className="sortable">
                Avalúo Total {getSortIcon('avaluoTotal')}
              </th>
              <th onClick={() => handleSort('superficieTerreno')} className="sortable">
                Superficie {getSortIcon('superficieTerreno')}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProperties.map((property) => (
              <tr key={property.id}>
                <td className="rol-cell">{property.numeroRol}</td>
                <td className="address-cell">{property.direccion}</td>
                <td className="owner-cell">{property.registradoNombre}</td>
                <td className="avaluo-cell">${property.avaluoTotal.toLocaleString()}</td>
                <td className="surface-cell">{property.superficieTerreno.toLocaleString()} m²</td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleEdit(property)}
                    className="btn btn-secondary btn-sm"
                    title="Editar propiedad"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="btn btn-danger btn-sm"
                    title="Eliminar propiedad"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            ⏮️
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            ⏪
          </button>
          
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            ⏩
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            ⏭️
          </button>
        </div>
      )}

      {editingProperty && (
        <PropertyModal
          property={editingProperty}
          onSave={handleSaveEdit}
          onCancel={() => setEditingProperty(null)}
        />
      )}
    </div>
  );
};

export default PropertyTable;