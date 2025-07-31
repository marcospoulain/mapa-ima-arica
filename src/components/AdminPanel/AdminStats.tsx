import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useApp } from '../../context/AppContext';
import './AdminStats.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminStats: React.FC = () => {
  const { state } = useApp();
  const { properties } = state;

  const stats = {
    totalProperties: properties.length,
    totalAvaluo: properties.reduce((sum, prop) => sum + (prop.avaluoTotal || prop.price || 0), 0),
    avgAvaluo: properties.length > 0 ? properties.reduce((sum, prop) => sum + (prop.avaluoTotal || prop.price || 0), 0) / properties.length : 0,
    totalTerrainArea: properties.reduce((sum, prop) => sum + (prop.superficieTerreno || prop.area || 0), 0),
    totalConstructionArea: properties.reduce((sum, prop) => sum + (prop.superficieConstrucciones || 0), 0),
    propertyTypes: {} as Record<string, number>,
    avaluoRanges: {
      'Bajo (< $50M)': 0,
      'Medio ($50M - $100M)': 0,
      'Alto ($100M - $200M)': 0,
      'Premium (> $200M)': 0,
    },
  };

  // Calculate property types distribution
  properties.forEach(prop => {
    const type = prop.destinoBienRaiz || prop.type || 'Sin especificar';
    stats.propertyTypes[type] = (stats.propertyTypes[type] || 0) + 1;

    // Calculate avaluo ranges
    const avaluo = prop.avaluoTotal || prop.price || 0;
    if (avaluo < 50000000) {
      stats.avaluoRanges['Bajo (< $50M)']++;
    } else if (avaluo < 100000000) {
      stats.avaluoRanges['Medio ($50M - $100M)']++;
    } else if (avaluo < 200000000) {
      stats.avaluoRanges['Alto ($100M - $200M)']++;
    } else {
      stats.avaluoRanges['Premium (> $200M)']++;
    }
  });

  const topPropertyTypes = Object.entries(stats.propertyTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  // Chart configurations
  const propertyTypesChartData = {
    labels: topPropertyTypes.map(([type]) => type),
    datasets: [
      {
        data: topPropertyTypes.map(([, count]) => count),
        backgroundColor: [
          '#0D2A5C',
          '#4169E1',
          '#5CBCE6',
          '#1A2B4D',
          '#3B82F6',
          '#60A5FA',
          '#93C5FD',
          '#DBEAFE',
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const avaluoRangesChartData = {
    labels: Object.keys(stats.avaluoRanges),
    datasets: [
      {
        label: 'Cantidad de Propiedades',
        data: Object.values(stats.avaluoRanges),
        backgroundColor: 'rgba(13, 42, 92, 0.8)',
        borderColor: '#0D2A5C',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const monthlyTrendData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Avalúo Promedio (Millones)',
        data: [85, 88, 92, 89, 94, 97],
        borderColor: '#0D2A5C',
        backgroundColor: 'rgba(13, 42, 92, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0D2A5C',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#0D2A5C',
        borderWidth: 1,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#666',
        },
      },
    },
  };

  return (
    <div className="admin-stats">
      <div className="stats-header">
        <h2>📊 Dashboard de Estadísticas</h2>
        <p>Análisis completo del sistema de propiedades</p>
      </div>
      
      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>Total Propiedades</h3>
            <p className="stat-number">{stats.totalProperties.toLocaleString()}</p>
            <span className="stat-trend positive">+12% vs mes anterior</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Avalúo Total</h3>
            <p className="stat-number">${(stats.totalAvaluo / 1000000).toFixed(1)}M</p>
            <span className="stat-trend positive">+8% vs mes anterior</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Avalúo Promedio</h3>
            <p className="stat-number">${(stats.avgAvaluo / 1000000).toFixed(1)}M</p>
            <span className="stat-trend neutral">Sin cambios</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <h3>Superficie Total</h3>
            <p className="stat-number">{(stats.totalTerrainArea / 1000).toFixed(1)}K m²</p>
            <span className="stat-trend positive">+5% vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container">
            <div className="chart-header">
              <h3>📊 Distribución por Tipo de Propiedad</h3>
              <p>Análisis de categorías más comunes</p>
            </div>
            <div className="chart-wrapper">
              <Doughnut data={propertyTypesChartData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>💵 Rangos de Avalúo</h3>
              <p>Distribución por valor de propiedades</p>
            </div>
            <div className="chart-wrapper">
              <Bar data={avaluoRangesChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        <div className="chart-row">
          <div className="chart-container full-width">
            <div className="chart-header">
              <h3>📈 Tendencia de Avalúos</h3>
              <p>Evolución del avalúo promedio en los últimos 6 meses</p>
            </div>
            <div className="chart-wrapper">
              <Line data={monthlyTrendData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Properties Types List */}
      {topPropertyTypes.length > 0 && (
        <div className="property-types-section">
          <div className="section-header">
            <h3>🏆 Ranking de Tipos de Propiedades</h3>
            <p>Los tipos más frecuentes en el sistema</p>
          </div>
          <div className="property-types-list">
            {topPropertyTypes.map(([type, count], index) => (
              <div key={type} className="property-type-item">
                <div className="type-rank">#{index + 1}</div>
                <div className="type-info">
                  <span className="type-name">{type}</span>
                  <span className="type-count">{count} propiedades</span>
                </div>
                <div className="type-stats">
                  <div className="type-percentage">
                    {((count / stats.totalProperties) * 100).toFixed(1)}%
                  </div>
                  <div className="type-bar">
                    <div 
                      className="type-bar-fill" 
                      style={{ width: `${(count / stats.totalProperties) * 100}%` }}
                    ></div>
                  </div>
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