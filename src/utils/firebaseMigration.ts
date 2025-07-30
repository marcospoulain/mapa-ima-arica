import { addProperty } from '../firebase/propertyService';
import { Property } from '../types';

// Función para migrar datos del Excel a Firebase
export const migrateExcelDataToFirebase = async (excelData: any[]): Promise<void> => {
  try {
    console.log('Iniciando migración de datos a Firebase...');
    
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      
      // Mapear los datos del Excel al formato de Property
      const property: Omit<Property, 'id'> = {
        title: row.titulo || row.title || `Propiedad ${i + 1}`,
        type: row.tipo || row.type || 'casa',
        price: parseFloat(row.precio || row.price || '0'),
        location: row.ubicacion || row.location || '',
        description: row.descripcion || row.description || '',
        bedrooms: parseInt(row.habitaciones || row.bedrooms || '0'),
        bathrooms: parseInt(row.baños || row.bathrooms || '0'),
        area: parseFloat(row.area || row.superficie || '0'),
        coordinates: {
          lat: parseFloat(row.latitud || row.lat || '0'),
          lng: parseFloat(row.longitud || row.lng || '0')
        },
        imageUrl: row.imagen || row.image || '/placeholder-property.jpg',
        features: row.caracteristicas ? row.caracteristicas.split(',') : [],
        status: row.estado || row.status || 'disponible',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Validar que tenga coordenadas válidas
      if (property.coordinates.lat !== 0 && property.coordinates.lng !== 0) {
        await addProperty(property);
        console.log(`Propiedad ${i + 1} migrada exitosamente`);
      } else {
        console.warn(`Propiedad ${i + 1} omitida: coordenadas inválidas`);
      }
    }
    
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
};

// Función para exportar datos de Firebase a Excel (backup)
export const exportFirebaseDataToExcel = async (): Promise<void> => {
  // Esta función se puede implementar más tarde si necesitas hacer backups
  console.log('Función de exportación disponible para implementar');
};