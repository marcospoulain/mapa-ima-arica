import React from 'react';
import { useApp } from '../../context/AppContext';
import './StatsLabel.css';

const StatsLabel: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="stats-label">
      <span className="stats-count">{state.properties.length}</span>
      <span className="stats-text">propiedades</span>
    </div>
  );
};

export default StatsLabel;