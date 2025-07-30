import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';
import CoordinateSelector from './CoordinateSelector';
import './PropertyCreator.css';

const PropertyCreator: React.FC = () => {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState<Partial<Property>>({
    numeroRol: '',
    direccion: '',
    superficieTerreno: 0,
    superficieConstrucciones: 0,
    avaluoTerrenoPropio: 0,
    avaluoConstrucciones: 0,
    avaluoTotal: 0,
    registradoNombre: '',
    rutRegistrado: '',
    imageUrl: '',
    latitud: 0,
    longitud: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCoordinateSelector, setShowCoordinateSelector] = useState(false);

  const handleCoordinateSelect = (latitude: number, longitude: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      latitud: latitude,
      longitud: longitude,
      ...(address && { direccion: address })
    }));
    setShowCoordinateSelector(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Opcional: mostrar una notificación de éxito
    }).catch(err => {
      console.error('Error al copiar al portapapeles:', err);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericFields = ['superficieTerreno', 'superficieConstrucciones', 'avaluoTerrenoPropio', 'avaluoConstrucciones', 'latitud', 'longitud'];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value
    }));

    // Auto-calculate total avaluo
    if (name === 'avaluoTerrenoPropio' || name === 'avaluoConstrucciones') {
      const terreno = name === 'avaluoTerrenoPropio' ? (parseFloat(value) || 0) : (formData.avaluoTerrenoPropio || 0);
      const construcciones = name === 'avaluoConstrucciones' ? (parseFloat(value) || 0) : (formData.avaluoConstrucciones || 0);
      
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
        avaluoTotal: terreno + construcciones
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.numeroRol || !formData.direccion) {
        throw new Error('ROL y dirección son campos obligatorios');
      }

      // Generate unique ID
      const newProperty: Property = {
        ...formData as Property,
        id: Date.now().toString(),
        numeroRol: formData.numeroRol!,
        direccion: formData.direccion!,
        superficieTerreno: formData.superficieTerreno || 0,
        superficieConstrucciones: formData.superficieConstrucciones || 0,
        avaluoTerrenoPropio: formData.avaluoTerrenoPropio || 0,
        avaluoConstrucciones: formData.avaluoConstrucciones || 0,
        avaluoTotal: (formData.avaluoTerrenoPropio || 0) + (formData.avaluoConstrucciones || 0),
        registradoNombre: formData.registradoNombre || '',
        rutRegistrado: formData.rutRegistrado || '',
        imageUrl: formData.imageUrl || '',
        latitud: formData.latitud || -18.4783, // Default to Arica coordinates
        longitud: formData.longitud || -70.3126,
        // Required fields with default values
        rol: formData.numeroRol!,
        destino: '',
        destinoBienRaiz: '',
        propietario: formData.registradoNombre || '',
        rut: formData.rutRegistrado || '',
        superficieConstruccion: formData.superficieConstrucciones || 0,
        avaluoTerreno: formData.avaluoTerrenoPropio || 0,
        avaluoConstruccion: formData.avaluoConstrucciones || 0,
        avaluoExento: 0,
        avaluoExentoImpuesto: 0,
        avaluoAfecto: (formData.avaluoTerrenoPropio || 0) + (formData.avaluoConstrucciones || 0),
        avaluoAfectoImpuesto: (formData.avaluoTerrenoPropio || 0) + (formData.avaluoConstrucciones || 0)
      };

      // Add property to state
      dispatch({ type: 'ADD_PROPERTY', payload: newProperty });

      // Reset form
      setFormData({
        numeroRol: '',
        direccion: '',
        superficieTerreno: 0,
        superficieConstrucciones: 0,
        avaluoTerrenoPropio: 0,
        avaluoConstrucciones: 0,
        avaluoTotal: 0,
        registradoNombre: '',
        rutRegistrado: '',
        imageUrl: '',
        latitud: 0,
        longitud: 0
      });
      removeImage();

      alert('Propiedad creada exitosamente');
    } catch (error) {
      console.error('Error creating property:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al crear la propiedad' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="property-creator">
      <div className="creator-header">
        <h2>Crear Nueva Propiedad</h2>
        <p>Complete los datos de la nueva propiedad</p>
      </div>

      <form onSubmit={handleSubmit} className="creator-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="numeroRol">ROL *</label>
            <input
              type="text"
              id="numeroRol"
              name="numeroRol"
              value={formData.numeroRol || ''}
              onChange={handleInputChange}
              required
              placeholder="Ej: 123-456-789"
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección *</label>
            <div className="address-input-container">
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion || ''}
                onChange={handleInputChange}
                required
                placeholder="Ej: Av. Principal 123"
              />
              {formData.direccion && (
                <small className="address-note">
                  💡 Puedes usar el selector de mapa para obtener la dirección automáticamente
                </small>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="superficieTerreno">Superficie Terreno (m²)</label>
            <input
              type="number"
              id="superficieTerreno"
              name="superficieTerreno"
              value={formData.superficieTerreno || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="superficieConstrucciones">Superficie Construcción (m²)</label>
            <input
              type="number"
              id="superficieConstrucciones"
              name="superficieConstrucciones"
              value={formData.superficieConstrucciones || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avaluoTerrenoPropio">Avalúo Terreno ($)</label>
            <input
              type="number"
              id="avaluoTerrenoPropio"
              name="avaluoTerrenoPropio"
              value={formData.avaluoTerrenoPropio || ''}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avaluoConstrucciones">Avalúo Construcción ($)</label>
            <input
              type="number"
              id="avaluoConstrucciones"
              name="avaluoConstrucciones"
              value={formData.avaluoConstrucciones || ''}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avaluoTotal">Avalúo Total ($)</label>
            <input
              type="number"
              id="avaluoTotal"
              name="avaluoTotal"
              value={formData.avaluoTotal || 0}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="registradoNombre">Propietario</label>
            <input
              type="text"
              id="registradoNombre"
              name="registradoNombre"
              value={formData.registradoNombre || ''}
              onChange={handleInputChange}
              placeholder="Nombre del propietario"
            />
          </div>

          <div className="form-group">
            <label htmlFor="rutRegistrado">RUT Propietario</label>
            <input
              type="text"
              id="rutRegistrado"
              name="rutRegistrado"
              value={formData.rutRegistrado || ''}
              onChange={handleInputChange}
              placeholder="12.345.678-9"
            />
          </div>

          <div className="form-group">
            <label htmlFor="codigoPostal">Código Postal</label>
            <div className="address-input-container">
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={formData.codigoPostal || ''}
                onChange={handleInputChange}
                placeholder="Ej: 8320000"
              />
              {formData.codigoPostal && (
                <button
                  type="button"
                  className="btn btn-secondary coordinate-btn"
                  onClick={() => copyToClipboard(formData.codigoPostal || '')}
                  title="Copiar código postal"
                >
                  📋
                </button>
              )}
            </div>
          </div>

          <div className="form-group coordinates-group">
            <label>Coordenadas</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  name="latitud"
                  value={formData.latitud || ''}
                  onChange={handleInputChange}
                  placeholder="Latitud"
                  step="any"
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  name="longitud"
                  value={formData.longitud || ''}
                  onChange={handleInputChange}
                  placeholder="Longitud"
                  step="any"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-secondary map-selector-btn"
                  onClick={() => setShowCoordinateSelector(true)}
                  style={{ marginBottom: '0' }}
                >
                  📍 Buscar en el mapa
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="image-section">
          <label>Imagen de la Propiedad</label>
          <div className="image-upload-area" onClick={() => document.getElementById('imageUpload')?.click()}>
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Vista previa" className="preview-image" />
                <button type="button" className="remove-image-btn" onClick={(e) => { e.stopPropagation(); removeImage(); }}>
                  ×
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span>📷</span>
                <p>Haz clic para subir una imagen</p>
              </div>
            )}
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageUpload}
              className="image-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear Propiedad'}
          </button>
        </div>
      </form>
      
      {showCoordinateSelector && (
        <CoordinateSelector
          onCoordinateSelect={handleCoordinateSelect}
          onClose={() => setShowCoordinateSelector(false)}
          initialLat={formData.latitud}
          initialLng={formData.longitud}
        />
      )}
    </div>
  );
};

export default PropertyCreator;