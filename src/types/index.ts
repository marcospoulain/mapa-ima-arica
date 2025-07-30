export interface Property {
  id: string;
  rol: string; // ROL de avalúo
  numeroRol: string; // Alias for rol
  direccion: string;
  destino: string; // Destino del bien raíz
  destinoBienRaiz: string; // Alias for destino
  propietario: string; // Propietario
  registradoNombre: string; // Alias for propietario
  rut: string; // RUT
  rutRegistrado: string; // Alias for rut
  superficieTerreno: number;
  superficieConstruccion: number; // Superficie construcción
  superficieConstrucciones: number; // Alias for superficieConstruccion
  avaluoTerreno: number; // Avalúo terreno
  avaluoTerrenoPropio: number; // Alias for avaluoTerreno
  avaluoConstruccion: number; // Avalúo construcción
  avaluoConstrucciones: number; // Alias for avaluoConstruccion
  avaluoTotal: number;
  avaluoExento: number; // Avalúo exento
  avaluoExentoImpuesto: number; // Alias for avaluoExento
  avaluoAfecto: number; // Avalúo afecto
  avaluoAfectoImpuesto: number; // Alias for avaluoAfecto
  latitud: number;
  longitud: number;
  codigoPostal?: string; // Código postal
  imageUrl?: string; // URL de la imagen de la propiedad
}

export interface User {
  username: string;
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