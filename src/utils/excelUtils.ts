import * as XLSX from 'xlsx';
import { Property } from '../types';

export interface ExcelRow {
  'Número de ROL de Avalúo': string;
  'Dirección': string;
  'Destino del bien raíz': string;
  'Registrado a Nombre de': string;
  'RUT registrado': string;
  'SUPERFICIE TERRENO': number;
  'SUPERFICIE CONSTRUCCIONES': number;
  'AVALÚO TERRENO PROPIO': number;
  'AVALÚO CONSTRUCCIONES': number;
  'AVALÚO TOTAL': number;
  'AVALÚO EXENTO DE IMPUESTO': number;
  'AVALÚO AFECTO A IMPUESTO': number;
  'Latitud': number;
  'Longitud': number;
  'Google Maps': string;
}

export const validateExcelColumns = (headers: string[]): { isValid: boolean; missingColumns: string[] } => {
  const requiredColumns = [
    'Número de ROL de Avalúo',
    'Dirección',
    'Destino del bien raíz',
    'Registrado a Nombre de',
    'RUT registrado',
    'SUPERFICIE TERRENO',
    'SUPERFICIE CONSTRUCCIONES',
    'AVALÚO TERRENO PROPIO',
    'AVALÚO CONSTRUCCIONES',
    'AVALÚO TOTAL',
    'AVALÚO EXENTO DE IMPUESTO',
    'AVALÚO AFECTO A IMPUESTO',
    'Latitud',
    'Longitud',
    'Google Maps'
  ];

  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns
  };
};

export const parseExcelToProperties = (file: File): Promise<Property[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length < 2) {
          reject(new Error('El archivo Excel debe contener al menos una fila de encabezados y una fila de datos'));
          return;
        }
        
        const headers = jsonData[0] as string[];
        const validation = validateExcelColumns(headers);
        
        if (!validation.isValid) {
          reject(new Error(`Faltan las siguientes columnas requeridas: ${validation.missingColumns.join(', ')}`));
          return;
        }
        
        const properties: Property[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          if (row.length === 0 || !row[0]) continue; // Skip empty rows
          
          try {
            const property: Property = {
              id: `prop_${Date.now()}_${i}`,
              title: String(row[headers.indexOf('Número de ROL de Avalúo')] || ''),
              type: String(row[headers.indexOf('Destino del bien raíz')] || 'residencial'),
              price: Number(row[headers.indexOf('AVALÚO TOTAL')] || 0),
              location: String(row[headers.indexOf('Dirección')] || ''),
              description: `Propiedad con ROL ${String(row[headers.indexOf('Número de ROL de Avalúo')] || '')}`,
              bedrooms: 0, // Valor por defecto
              bathrooms: 0, // Valor por defecto
              area: Number(row[headers.indexOf('SUPERFICIE TERRENO')] || 0),
              coordinates: {
                lat: Number(row[headers.indexOf('Latitud')] || 0),
                lng: Number(row[headers.indexOf('Longitud')] || 0)
              },
              imageUrl: '/placeholder-property.jpg', // Imagen por defecto
              features: [],
              status: 'disponible',
              createdAt: new Date(),
              updatedAt: new Date(),
              
              // Campos adicionales del modelo anterior
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
            
            // Validate required fields
            if (!property.title || !property.location) {
              console.warn(`Fila ${i + 1}: Título o ubicación faltante, omitiendo`);
              continue;
            }
            
            // Validate coordinates
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
        
        if (properties.length === 0) {
          reject(new Error('No se pudieron procesar propiedades válidas del archivo'));
          return;
        }
        
        resolve(properties);
      } catch (error) {
        reject(new Error(`Error al procesar el archivo Excel: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const exportPropertiesToExcel = (properties: Property[], filename: string = 'propiedades_arica.xlsx') => {
  try {
    // Convert properties to Excel format
    const excelData = properties.map(property => ({
      'Número de ROL de Avalúo': property.rol || property.title,
      'Dirección': property.direccion || property.location,
      'Destino del bien raíz': property.destinoBienRaiz || property.type,
      'Registrado a Nombre de': property.registradoNombre || '',
      'RUT registrado': property.rutRegistrado || '',
      'SUPERFICIE TERRENO': property.superficieTerreno || property.area,
      'SUPERFICIE CONSTRUCCIONES': property.superficieConstrucciones || 0,
      'AVALÚO TERRENO PROPIO': property.avaluoTerrenoPropio || 0,
      'AVALÚO CONSTRUCCIONES': property.avaluoConstrucciones || 0,
      'AVALÚO TOTAL': property.avaluoTotal || property.price,
      'AVALÚO EXENTO DE IMPUESTO': property.avaluoExentoImpuesto || 0,
      'AVALÚO AFECTO A IMPUESTO': property.avaluoAfectoImpuesto || 0,
      'Latitud': property.latitud || property.coordinates.lat,
      'Longitud': property.longitud || property.coordinates.lng,
      'Código Postal': property.codigoPostal || '',
      'Habitaciones': property.bedrooms || 0,
      'Baños': property.bathrooms || 0,
      'Estado': property.status || 'disponible',
      'Características': property.features ? property.features.join(', ') : '',
    }));
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Propiedades');
    
    // Save file
    XLSX.writeFile(workbook, filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const validateFileType = (file: File): boolean => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];
  
  return validTypes.includes(file.type) || 
         file.name.toLowerCase().endsWith('.xlsx') || 
         file.name.toLowerCase().endsWith('.xls');
};