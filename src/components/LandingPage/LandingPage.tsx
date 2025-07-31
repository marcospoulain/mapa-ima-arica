import React from 'react';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import MapComponent from '../Map/MapComponent';
import PropertySidebar from '../Property/PropertySidebar';
import { useApp } from '../../context/AppContext';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const { state } = useApp();

  return (
    <div className="landing-page">
      <Header />
      
      <main className="main-content">
        <div className="map-section">
          <MapComponent />
        </div>
      </main>

      <PropertySidebar 
        isOpen={!!state.selectedProperty} 
        onClose={() => {}} 
      />
      
      {/* Separador colorido */}
      <div className="color-separator"></div>
      
      <Footer />
    </div>
  );
};

export default LandingPage;