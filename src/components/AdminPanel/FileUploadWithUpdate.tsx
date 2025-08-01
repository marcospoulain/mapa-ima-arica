import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { parseExcelToProperties, validateFileType, exportPropertiesToExcel } from '../../utils/excelUtils';
import { bulkUpsertProperties, getProperties } from '../../supabase/propertyService';
import './FileUpload.css';

interface UploadResult {
  created: number;
  updated: number;
  errors: Array<{ index: number; error: string; rol: string }>;
}

const FileUploadWithUpdate: React.FC = () => {
  const { state, dispatch, savePropertiesToStorage } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'replace' | 'update'>('update');
  const [lastUploadResult, setLastUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar si el usuario es administrador
  console.log('Debug - Usuario actual:', state.user);
  console.log('Debug - Email del usuario:', state.user?.email);
  console.log('Debug - Role del usuario:', state.user?.role);
  
  const isAdmin = state.user?.email === 'admin@ima.cl' ||
    state.user?.email === 'marcos.vergara@municipalidadarica.cl';
  const isReadOnly = state.user?.role === 'readonly';
  const canModify = isAdmin;
  const canView = isAdmin || isReadOnly;
  
  console.log('Debug - isAdmin:', isAdmin);
  console.log('Debug - isReadOnly:', isReadOnly);
  console.log('Debug - canModify:', canModify);
  console.log('Debug - canView:', canView);

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
    setLastUploadResult(null);

    try {
      const properties = await parseExcelToProperties(file);
      
      if (uploadMode === 'replace') {
        // Modo reemplazar: usar la funcionalidad original
        dispatch({ type: 'SET_PROPERTIES', payload: properties });
        savePropertiesToStorage(properties);
        
        setLastUploadResult({
          created: properties.length,
          updated: 0,
          errors: []
        });
        
        alert(`¡Éxito! Se cargaron ${properties.length} propiedades correctamente (modo reemplazar).`);
      } else {
        // Modo actualizar: usar upsert para evitar duplicados
        const result = await bulkUpsertProperties(properties);
        setLastUploadResult(result);
        
        // Recargar todas las propiedades desde la base de datos
        const updatedProperties = await getProperties();
        dispatch({ type: 'SET_PROPERTIES', payload: updatedProperties });
        savePropertiesToStorage(updatedProperties);
        
        // Mostrar resultado detallado
        let message = `¡Proceso completado!\n`;
        message += `✅ Propiedades creadas: ${result.created}\n`;
        message += `🔄 Propiedades actualizadas: ${result.updated}\n`;
        
        if (result.errors.length > 0) {
          message += `❌ Errores: ${result.errors.length}\n\n`;
          message += `Errores encontrados:\n`;
          result.errors.slice(0, 5).forEach(error => {
            message += `• Fila ${error.index} (ROL: ${error.rol}): ${error.error}\n`;
          });
          if (result.errors.length > 5) {
            message += `... y ${result.errors.length - 5} errores más.`;
          }
        }
        
        alert(message);
      }
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
      <h2>Gestión de Archivos con Actualización</h2>
      
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

      {/* Selector de modo de carga */}
      {canModify && (
        <div className="upload-mode-selector">
          <h3>Modo de Carga</h3>
          <div className="mode-options">
            <label className={`mode-option ${uploadMode === 'update' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="update"
                checked={uploadMode === 'update'}
                onChange={(e) => setUploadMode(e.target.value as 'replace' | 'update')}
              />
              <div className="mode-content">
                <h4>Actualizar/Agregar</h4>
                <p>Actualiza propiedades existentes por ROL y agrega nuevas sin generar duplicados.</p>
                <small>Recomendado</small>
              </div>
            </label>
            
            <label className={`mode-option ${uploadMode === 'replace' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="replace"
                checked={uploadMode === 'replace'}
                onChange={(e) => setUploadMode(e.target.value as 'replace' | 'update')}
              />
              <div className="mode-content">
                <h4>Reemplazar Todo</h4>
                <p>Reemplaza completamente todos los datos existentes con los del archivo.</p>
                <small>⚠️ Precaución</small>
              </div>
            </label>
          </div>
        </div>
      )}
      
      <div className="upload-section">
        <h3>Cargar Archivo Excel</h3>
        <p className="upload-description">
          Arrastra y suelta un archivo Excel (.xlsx, .xls) o haz clic para seleccionar uno.
          {uploadMode === 'update' 
            ? ' Las propiedades se actualizarán por ROL sin generar duplicados.'
            : ' Todos los datos actuales serán reemplazados.'
          }
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
              <p>Procesando archivo en modo {uploadMode === 'update' ? 'actualización' : 'reemplazo'}...</p>
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
              {canModify && (
                <p className="upload-mode-indicator">
                  Modo actual: <strong>{uploadMode === 'update' ? 'Actualizar/Agregar' : 'Reemplazar Todo'}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mostrar resultado del último upload */}
      {lastUploadResult && (
        <div className="upload-result">
          <h3>Resultado de la Última Carga</h3>
          <div className="result-stats">
            <div className="stat-item success">
              <span className="stat-number">{lastUploadResult.created}</span>
              <span className="stat-label">Creadas</span>
            </div>
            <div className="stat-item info">
              <span className="stat-number">{lastUploadResult.updated}</span>
              <span className="stat-label">Actualizadas</span>
            </div>
            <div className="stat-item error">
              <span className="stat-number">{lastUploadResult.errors.length}</span>
              <span className="stat-label">Errores</span>
            </div>
          </div>
          
          {lastUploadResult.errors.length > 0 && (
            <div className="error-details">
              <h4>Errores Encontrados:</h4>
              <ul>
                {lastUploadResult.errors.slice(0, 10).map((error, index) => (
                  <li key={index}>
                    <strong>Fila {error.index}</strong> (ROL: {error.rol}): {error.error}
                  </li>
                ))}
                {lastUploadResult.errors.length > 10 && (
                  <li>... y {lastUploadResult.errors.length - 10} errores más.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

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
              <li><strong>Número de ROL de Avalúo</strong> (identificador único)</li>
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
              <li><strong>El ROL es obligatorio</strong> y se usa como identificador único</li>
              <li>Los valores numéricos deben ser números válidos</li>
              <li>Se omitirán las filas con datos inválidos</li>
            </ul>
          </div>
          
          <div className="requirement-item">
            <h4>Modo Actualizar/Agregar:</h4>
            <ul>
              <li>Si el ROL ya existe, se actualiza la propiedad</li>
              <li>Si el ROL no existe, se crea una nueva propiedad</li>
              <li>No se generan duplicados</li>
              <li>Las propiedades existentes no incluidas en el archivo se mantienen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadWithUpdate;