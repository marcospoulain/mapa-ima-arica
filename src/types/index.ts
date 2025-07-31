export interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  features: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Campos adicionales para compatibilidad con el modelo anterior
  rol?: string; // ROL de avalúo
  numeroRol?: string; // Alias for rol
  direccion?: string;
  destino?: string; // Destino del bien raíz
  destinoBienRaiz?: string; // Alias for destino
  propietario?: string; // Propietario
  registradoNombre?: string; // Alias for propietario
  rut?: string; // RUT
  rutRegistrado?: string; // Alias for rut
  superficieTerreno?: number;
  superficieConstruccion?: number; // Superficie construcción
  superficieConstrucciones?: number; // Alias for superficieConstruccion
  avaluoTerreno?: number; // Avalúo terreno
  avaluoTerrenoPropio?: number; // Alias for avaluoTerreno
  avaluoConstruccion?: number; // Avalúo construcción
  avaluoConstrucciones?: number; // Alias for avaluoConstruccion
  avaluoTotal?: number;
  avaluoExento?: number; // Avalúo exento
  avaluoExentoImpuesto?: number; // Alias for avaluoExento
  avaluoAfecto?: number; // Avalúo afecto
  avaluoAfectoImpuesto?: number; // Alias for avaluoAfecto
  latitud?: number;
  longitud?: number;
  codigoPostal?: string; // Código postal
}

export interface User {
  id?: string;
  username?: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'user' | 'readonly';
  isAuthenticated: boolean;
}

export interface AppState {
  properties: Property[];
  selectedProperty: Property | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SearchFilters {
  rol?: string;
  direccion?: string;
  avaluoMin?: number;
  avaluoMax?: number;
  destinoBienRaiz?: string;
}