import * as XLSX from 'xlsx';
import { Property } from '../types';
import { parseExcelToProperties } from './excelUtils';

// Función para cargar el archivo Excel de datos iniciales
export const loadInitialData = async (): Promise<Property[]> => {
  try {
    // Cargar el archivo Excel desde la carpeta public/data
    const response = await fetch('/data/base-datos.xlsx');
    
    if (!response.ok) {
      console.warn('No se pudo cargar el archivo de datos iniciales');
      return [];
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Obtener la primera hoja de trabajo
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (jsonData.length < 2) {
      console.warn('El archivo de datos iniciales no contiene datos válidos');
      return [];
    }
    
    const headers = jsonData[0] as string[];
    const properties: Property[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      if (row.length === 0 || !row[0]) continue; // Saltar filas vacías
      
      try {
        const property: Property = {
          id: `initial_${Date.now()}_${i}`,
          title: String(row[headers.indexOf('Número de ROL de Avalúo')] || ''),
          type: String(row[headers.indexOf('Destino del bien raíz')] || 'residencial'),
          price: Number(row[headers.indexOf('AVALÚO TOTAL')] || 0),
          location: String(row[headers.indexOf('Dirección')] || ''),
          description: `Propiedad con ROL ${String(row[headers.indexOf('Número de ROL de Avalúo')] || '')}`,
          bedrooms: 0,
          bathrooms: 0,
          area: Number(row[headers.indexOf('SUPERFICIE TERRENO')] || 0),
          coordinates: {
            lat: Number(row[headers.indexOf('Latitud')] || 0),
            lng: Number(row[headers.indexOf('Longitud')] || 0)
          },
          imageUrl: '',
          features: [],
          status: 'disponible',
          createdAt: new Date(),
          updatedAt: new Date(),
          
          // Campos adicionales
          rol: String(row[headers.indexOf('Número de ROL de Avalúo')] || ''),
          numeroRol: String(row[headers.indexOf('Número de ROL de Avalúo')] || ''),
          direccion: String(row[headers.indexOf('Dirección')] || ''),
          destino: String(row[headers.indexOf('Destino del bien raíz')] || ''),
          destinoBienRaiz: String(row[headers.indexOf('Destino del bien raíz')] || ''),
          propietario: String(row[headers.indexOf('Registrado a Nombre de')] || ''),
          registradoNombre: String(row[headers.indexOf('Registrado a Nombre de')] || ''),
          rut: String(row[headers.indexOf('RUT registrado')] || ''),
          rutRegistrado: String(row[headers.indexOf('RUT registrado')] || ''),
          superficieTerreno: Number(row[headers.indexOf('SUPERFICIE TERRENO')] || 0),
          superficieConstruccion: Number(row[headers.indexOf('SUPERFICIE CONSTRUCCIONES')] || 0),
          superficieConstrucciones: Number(row[headers.indexOf('SUPERFICIE CONSTRUCCIONES')] || 0),
          avaluoTerreno: Number(row[headers.indexOf('AVALÚO TERRENO PROPIO')] || 0),
          avaluoTerrenoPropio: Number(row[headers.indexOf('AVALÚO TERRENO PROPIO')] || 0),
          avaluoConstruccion: Number(row[headers.indexOf('AVALÚO CONSTRUCCIONES')] || 0),
          avaluoConstrucciones: Number(row[headers.indexOf('AVALÚO CONSTRUCCIONES')] || 0),
          avaluoTotal: Number(row[headers.indexOf('AVALÚO TOTAL')] || 0),
          avaluoExento: Number(row[headers.indexOf('AVALÚO EXENTO DE IMPUESTO')] || 0),
          avaluoExentoImpuesto: Number(row[headers.indexOf('AVALÚO EXENTO DE IMPUESTO')] || 0),
          avaluoAfecto: Number(row[headers.indexOf('AVALÚO AFECTO A IMPUESTO')] || 0),
          avaluoAfectoImpuesto: Number(row[headers.indexOf('AVALÚO AFECTO A IMPUESTO')] || 0),
          latitud: Number(row[headers.indexOf('Latitud')] || 0),
          longitud: Number(row[headers.indexOf('Longitud')] || 0),
          codigoPostal: String(row[headers.indexOf('Código Postal')] || ''),
        };
        
        // Validar campos requeridos
        if (!property.title || !property.location) {
          console.warn(`Fila ${i + 1}: Título o ubicación faltante, omitiendo`);
          continue;
        }
        
        // Validar coordenadas
        if (!property.coordinates.lat || !property.coordinates.lng || 
            property.coordinates.lat < -90 || property.coordinates.lat > 90 ||
            property.coordinates.lng < -180 || property.coordinates.lng > 180) {
          console.warn(`Fila ${i + 1}: Coordenadas inválidas, omitiendo`);
          continue;
        }
        
        properties.push(property);
      } catch (error) {
        console.warn(`Error procesando fila ${i + 1}:`, error);
      }
    }
    
    console.log(`Cargadas ${properties.length} propiedades desde el archivo inicial`);
    return properties;
  } catch (error) {
    console.error('Error cargando datos iniciales:', error);
    return [];
  }
};