import React from 'react';
import { useApp } from '../../context/AppContext';
import './AdminStats.css';

const AdminStats: React.FC = () => {
  const { state } = useApp();
  const { properties } = state;

  const stats = {
    totalProperties: properties.length,
    totalAvaluo: properties.reduce((sum, prop) => sum + prop.avaluoTotal, 0),
    avgAvaluo: properties.length > 0 ? properties.reduce((sum, prop) => sum + prop.avaluoTotal, 0) / properties.length : 0,
    totalTerrainArea: properties.reduce((sum, prop) => sum + prop.superficieTerreno, 0),
    totalConstructionArea: properties.reduce((sum, prop) => sum + prop.superficieConstrucciones, 0),
    propertyTypes: {} as Record<string, number>,
  };

  // Calculate property types distribution
  properties.forEach(prop => {
    const type = prop.destinoBienRaiz || 'Sin especificar';
    stats.propertyTypes[type] = (stats.propertyTypes[type] || 0) + 1;
  });

  const topPropertyTypes = Object.entries(stats.propertyTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="admin-stats">
      <h2>Estadísticas del Sistema</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>Total Propiedades</h3>
            <p className="stat-number">{stats.totalProperties.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Avalúo Total</h3>
            <p className="stat-number">${stats.totalAvaluo.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Avalúo Promedio</h3>
            <p className="stat-number">${Math.round(stats.avgAvaluo).toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <h3>Superficie Total Terreno</h3>
            <p className="stat-number">{stats.totalTerrainArea.toLocaleString()} m²</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏗️</div>
          <div className="stat-content">
            <h3>Superficie Total Construcción</h3>
            <p className="stat-number">{stats.totalConstructionArea.toLocaleString()} m²</p>
          </div>
        </div>
      </div>

      {topPropertyTypes.length > 0 && (
        <div className="property-types-section">
          <h3>Tipos de Propiedades Más Comunes</h3>
          <div className="property-types-list">
            {topPropertyTypes.map(([type, count], index) => (
              <div key={type} className="property-type-item">
                <div className="type-rank">#{index + 1}</div>
                <div className="type-info">
                  <span className="type-name">{type}</span>
                  <span className="type-count">{count} propiedades</span>
                </div>
                <div className="type-percentage">
                  {((count / stats.totalProperties) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {properties.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">📋</div>
          <h3>No hay datos disponibles</h3>
          <p>Carga un archivo Excel para ver las estadísticas del sistema.</p>
        </div>
      )}
    </div>
  );
};

export default AdminStats;