import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { parseExcelToProperties, validateFileType, exportPropertiesToExcel } from '../../utils/excelUtils';
import './FileUpload.css';

const FileUpload: React.FC = () => {
  const { state, dispatch, savePropertiesToStorage } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar si el usuario es administrador o readonly
  const isAdmin = state.user?.email === 'admin@ima.cl' || 
                 state.user?.email === 'test@mapa-ima.com' || 
                 state.user?.email === 'marcos.vergara@municipalidadarica.cl';
  
  const isReadOnly = state.user?.role === 'readonly';
  const canModify = isAdmin; // Solo admin puede modificar
  const canView = isAdmin || isReadOnly; // Admin y readonly pueden ver

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!canModify) {
      alert('No tienes permisos para cargar archivos. Solo los administradores pueden realizar esta acción.');
      return;
    }

    if (!validateFileType(file)) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Tipo de archivo no válido. Solo se permiten archivos .xlsx y .xls' 
      });
      return;
    }

    setUploading(true);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const properties = await parseExcelToProperties(file);
      dispatch({ type: 'SET_PROPERTIES', payload: properties });
      savePropertiesToStorage(properties);
      
      // Show success message
      alert(`¡Éxito! Se cargaron ${properties.length} propiedades correctamente.`);
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al procesar el archivo' 
      });
    } finally {
      setUploading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    if (state.properties.length === 0) {
      alert('No hay propiedades para exportar');
      return;
    }

    const success = exportPropertiesToExcel(state.properties);
    if (success) {
      alert('Archivo exportado exitosamente');
    } else {
      alert('Error al exportar el archivo');
    }
  };

  const openFileDialog = () => {
    if (!canModify) {
      alert('No tienes permisos para cargar archivos. Solo los administradores pueden realizar esta acción.');
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <h2>Gestión de Archivos</h2>
      
      {!canModify && canView && (
        <div className="user-notification">
          <div className="notification-content">
            <h3>Modo Solo Lectura</h3>
            <p>Tienes acceso de visualización completa. Solo los administradores pueden cargar archivos. Puedes exportar los datos existentes.</p>
          </div>
        </div>
      )}
      
      {!canView && (
        <div className="user-notification">
          <div className="notification-content">
            <h3>Acceso Restringido</h3>
            <p>Solo los administradores pueden cargar y gestionar archivos. Puedes exportar los datos existentes.</p>
          </div>
        </div>
      )}
      
      <div className="upload-section">
        <h3>Cargar Archivo Excel</h3>
        <p className="upload-description">
          Arrastra y suelta un archivo Excel (.xlsx, .xls) o haz clic para seleccionar uno.
          El archivo debe contener todas las columnas requeridas.
        </p>
        
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''} ${!canModify ? 'disabled' : ''}`}
          onDragEnter={canModify ? handleDrag : undefined}
          onDragLeave={canModify ? handleDrag : undefined}
          onDragOver={canModify ? handleDrag : undefined}
          onDrop={canModify ? handleDrop : undefined}
          onClick={canModify ? openFileDialog : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          
          {uploading ? (
            <div className="upload-loading">
              <div className="spinner"></div>
              <p>Procesando archivo...</p>
            </div>
          ) : (
            <div className="upload-content">
              <div className="upload-icon">📁</div>
              <p className="upload-text">
                {!canModify 
                  ? (isReadOnly 
                      ? 'Solo los administradores pueden cargar archivos (Modo Solo Lectura)'
                      : 'Solo los administradores pueden cargar archivos')
                  : dragActive 
                    ? 'Suelta el archivo aquí' 
                    : 'Arrastra un archivo Excel aquí o haz clic para seleccionar'
                }
              </p>
              {canModify && <p className="upload-formats">Formatos soportados: .xlsx, .xls</p>}
            </div>
          )}
        </div>
      </div>

      <div className="export-section">
        <h3>Exportar Datos</h3>
        <p className="export-description">
          Descarga todas las propiedades actuales en formato Excel.
        </p>
        
        <div className="export-actions">
          <button 
            onClick={handleExport}
            className="btn btn-success"
            disabled={state.properties.length === 0}
          >
            📥 Exportar a Excel ({state.properties.length} propiedades)
          </button>
        </div>
      </div>

      <div className="file-requirements">
        <h3>Requisitos del Archivo</h3>
        <div className="requirements-grid">
          <div className="requirement-item">
            <h4>Columnas Requeridas:</h4>
            <ul>
              <li>Número de ROL de Avalúo</li>
              <li>Dirección</li>
              <li>Destino del bien raíz</li>
              <li>Registrado a Nombre de</li>
              <li>RUT registrado</li>
              <li>SUPERFICIE TERRENO</li>
              <li>SUPERFICIE CONSTRUCCIONES</li>
              <li>AVALÚO TERRENO PROPIO</li>
              <li>AVALÚO CONSTRUCCIONES</li>
              <li>AVALÚO TOTAL</li>
              <li>AVALÚO EXENTO DE IMPUESTO</li>
              <li>AVALÚO AFECTO A IMPUESTO</li>
              <li>Latitud</li>
              <li>Longitud</li>
              <li>Google Maps</li>
            </ul>
          </div>
          
          <div className="requirement-item">
            <h4>Validaciones:</h4>
            <ul>
              <li>Las coordenadas deben ser válidas (-90 a 90 para latitud, -180 a 180 para longitud)</li>
              <li>El ROL y la dirección son campos obligatorios</li>
              <li>Los valores numéricos deben ser números válidos</li>
              <li>Se omitirán las filas con datos inválidos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;