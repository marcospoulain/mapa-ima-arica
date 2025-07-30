import React, { useState } from 'react';
import { Property } from '../../types';
import CoordinateSelector from './CoordinateSelector';
import './PropertyModal.css';

interface PropertyModalProps {
  property: Property;
  onSave: (property: Property) => void;
  onCancel: () => void;
}

const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Property>(property);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(property.imageUrl || null);
  const [showCoordinateSelector, setShowCoordinateSelector] = useState(false);

  const handleInputChange = (field: keyof Property, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          imageUrl: 'Por favor selecciona un archivo de imagen válido'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          imageUrl: 'La imagen no puede ser mayor a 5MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          imageUrl: result
        }));
        
        // Clear error
        if (errors.imageUrl) {
          setErrors(prev => ({
            ...prev,
            imageUrl: ''
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: undefined
    }));
  };

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

  const handlePlaceholderClick = () => {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.numeroRol.trim()) {
      newErrors.numeroRol = 'El ROL es requerido';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.registradoNombre.trim()) {
      newErrors.registradoNombre = 'El propietario es requerido';
    }

    if (formData.latitud < -90 || formData.latitud > 90) {
      newErrors.latitud = 'La latitud debe estar entre -90 y 90';
    }

    if (formData.longitud < -180 || formData.longitud > 180) {
      newErrors.longitud = 'La longitud debe estar entre -180 y 180';
    }

    if (formData.superficieTerreno < 0) {
      newErrors.superficieTerreno = 'La superficie del terreno no puede ser negativa';
    }

    if (formData.superficieConstrucciones < 0) {
      newErrors.superficieConstrucciones = 'La superficie de construcción no puede ser negativa';
    }

    if (formData.avaluoTerrenoPropio < 0) {
      newErrors.avaluoTerrenoPropio = 'El avalúo del terreno no puede ser negativo';
    }

    if (formData.avaluoConstrucciones < 0) {
      newErrors.avaluoConstrucciones = 'El avalúo de construcción no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Calculate total avaluo
      const updatedProperty = {
        ...formData,
        avaluoTotal: formData.avaluoTerrenoPropio + formData.avaluoConstrucciones
      };
      
      onSave(updatedProperty);
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Propiedad</h2>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="numeroRol">ROL de Avalúo *</label>
              <input
                type="text"
                id="numeroRol"
                value={formData.numeroRol}
                onChange={e => handleInputChange('numeroRol', e.target.value)}
                className={errors.numeroRol ? 'error' : ''}
              />
              {errors.numeroRol && <span className="error-text">{errors.numeroRol}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <input
                type="text"
                id="direccion"
                value={formData.direccion}
                onChange={e => handleInputChange('direccion', e.target.value)}
                className={errors.direccion ? 'error' : ''}
              />
              {errors.direccion && <span className="error-text">{errors.direccion}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="destinoBienRaiz">Destino del bien raíz</label>
              <input
                type="text"
                id="destinoBienRaiz"
                value={formData.destinoBienRaiz}
                onChange={e => handleInputChange('destinoBienRaiz', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="registradoNombre">Propietario *</label>
              <input
                type="text"
                id="registradoNombre"
                value={formData.registradoNombre}
                onChange={e => handleInputChange('registradoNombre', e.target.value)}
                className={errors.registradoNombre ? 'error' : ''}
              />
              {errors.registradoNombre && <span className="error-text">{errors.registradoNombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="rutRegistrado">RUT</label>
              <input
                type="text"
                id="rutRegistrado"
                value={formData.rutRegistrado}
                onChange={e => handleInputChange('rutRegistrado', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="superficieTerreno">Superficie Terreno (m²)</label>
              <input
                type="number"
                id="superficieTerreno"
                value={formData.superficieTerreno}
                onChange={e => handleInputChange('superficieTerreno', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className={errors.superficieTerreno ? 'error' : ''}
              />
              {errors.superficieTerreno && <span className="error-text">{errors.superficieTerreno}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="superficieConstrucciones">Superficie Construcción (m²)</label>
              <input
                type="number"
                id="superficieConstrucciones"
                value={formData.superficieConstrucciones}
                onChange={e => handleInputChange('superficieConstrucciones', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className={errors.superficieConstrucciones ? 'error' : ''}
              />
              {errors.superficieConstrucciones && <span className="error-text">{errors.superficieConstrucciones}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="avaluoTerrenoPropio">Avalúo Terreno ($)</label>
              <input
                type="number"
                id="avaluoTerrenoPropio"
                value={formData.avaluoTerrenoPropio}
                onChange={e => handleInputChange('avaluoTerrenoPropio', parseFloat(e.target.value) || 0)}
                min="0"
                className={errors.avaluoTerrenoPropio ? 'error' : ''}
              />
              {errors.avaluoTerrenoPropio && <span className="error-text">{errors.avaluoTerrenoPropio}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="avaluoConstrucciones">Avalúo Construcción ($)</label>
              <input
                type="number"
                id="avaluoConstrucciones"
                value={formData.avaluoConstrucciones}
                onChange={e => handleInputChange('avaluoConstrucciones', parseFloat(e.target.value) || 0)}
                min="0"
                className={errors.avaluoConstrucciones ? 'error' : ''}
              />
              {errors.avaluoConstrucciones && <span className="error-text">{errors.avaluoConstrucciones}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="avaluoExentoImpuesto">Avalúo Exento ($)</label>
              <input
                type="number"
                id="avaluoExentoImpuesto"
                value={formData.avaluoExentoImpuesto}
                onChange={e => handleInputChange('avaluoExentoImpuesto', parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="avaluoAfectoImpuesto">Avalúo Afecto ($)</label>
              <input
                type="number"
                id="avaluoAfectoImpuesto"
                value={formData.avaluoAfectoImpuesto}
                onChange={e => handleInputChange('avaluoAfectoImpuesto', parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="codigoPostal">Código Postal</label>
              <div className="coordinate-input-container">
                <input
                  type="text"
                  id="codigoPostal"
                  value={formData.codigoPostal || ''}
                  onChange={e => handleInputChange('codigoPostal', e.target.value)}
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

            <div className="form-group form-group-full">
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="latitud">Latitud *</label>
                  <div className="coordinate-input-container">
                    <input
                      type="number"
                      id="latitud"
                      value={formData.latitud}
                      onChange={e => handleInputChange('latitud', parseFloat(e.target.value) || 0)}
                      step="0.000001"
                      min="-90"
                      max="90"
                      className={errors.latitud ? 'error' : ''}
                    />
                    {errors.latitud && <span className="error-text">{errors.latitud}</span>}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="longitud">Longitud *</label>
                  <div className="coordinate-input-container">
                    <input
                      type="number"
                      id="longitud"
                      value={formData.longitud}
                      onChange={e => handleInputChange('longitud', parseFloat(e.target.value) || 0)}
                      step="0.000001"
                      min="-180"
                      max="180"
                      className={errors.longitud ? 'error' : ''}
                    />
                    {errors.longitud && <span className="error-text">{errors.longitud}</span>}
                  </div>
                </div>
                <div style={{ alignSelf: 'flex-end', marginBottom: '5px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary coordinate-btn"
                    onClick={() => setShowCoordinateSelector(true)}
                    title="Seleccionar ubicación en el mapa"
                  >
                    📍
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="imageUpload">Imagen de la Propiedad</label>
              <div className="image-upload-container">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Vista previa" className="preview-image" />
                    <button type="button" className="remove-image-btn" onClick={removeImage}>
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder" onClick={handlePlaceholderClick}>
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
              {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
            </div>
          </div>

          <div className="form-summary">
            <div className="summary-item">
              <strong>Avalúo Total: </strong>
              ${(formData.avaluoTerrenoPropio + formData.avaluoConstrucciones).toLocaleString('es-CL')}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Cambios
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
    </div>
  );
};

export default PropertyModal;