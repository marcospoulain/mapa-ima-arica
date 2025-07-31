import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { Property, User } from '../types';
import { loadInitialData } from '../utils/initialDataLoader';

export interface AppState {
  properties: Property[];
  selectedProperty: Property | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  showReadOnlyNotice: boolean;
}

type Action =
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'SELECT_PROPERTY'; payload: Property | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL_PROPERTIES' }
  | { type: 'CLEAR_ALL_DATA' }
  | { type: 'DISMISS_READONLY_NOTICE' };

const initialState: AppState = {
  properties: [],
  selectedProperty: null,
  user: null,
  loading: false,
  error: null,
  showReadOnlyNotice: true,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload, loading: false };
    case 'ADD_PROPERTY':
      return { ...state, properties: [...state.properties, action.payload] };
    case 'UPDATE_PROPERTY':
      return {
        ...state,
        properties: state.properties.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PROPERTY':
      return {
        ...state,
        properties: state.properties.filter(p => p.id !== action.payload),
        selectedProperty: state.selectedProperty?.id === action.payload ? null : state.selectedProperty,
      };
    case 'SELECT_PROPERTY':
      return { ...state, selectedProperty: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ALL_PROPERTIES':
      return { ...state, properties: [], selectedProperty: null };
    case 'CLEAR_ALL_DATA':
      return { ...state, properties: [], selectedProperty: null };
    case 'DISMISS_READONLY_NOTICE':
      return { ...state, showReadOnlyNotice: false };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loadPropertiesFromStorage: () => void;
  savePropertiesToStorage: (properties: Property[]) => void;
  loadInitialDataIfEmpty: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadPropertiesFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('arica-properties');
      if (stored) {
        const properties = JSON.parse(stored);
        dispatch({ type: 'SET_PROPERTIES', payload: properties });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading properties from storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los datos almacenados' });
      return false;
    }
  }, []);

  const savePropertiesToStorage = useCallback((properties: Property[]) => {
    try {
      localStorage.setItem('arica-properties', JSON.stringify(properties));
    } catch (error) {
      console.error('Error saving properties to storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al guardar los datos' });
    }
  }, []);

  const loadInitialDataIfEmpty = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Primero intentar cargar desde localStorage
      const hasStoredData = loadPropertiesFromStorage();
      
      // Si no hay datos almacenados, cargar datos iniciales
      if (!hasStoredData) {
        console.log('No hay datos almacenados, cargando datos iniciales...');
        const initialProperties = await loadInitialData();
        
        if (initialProperties.length > 0) {
          dispatch({ type: 'SET_PROPERTIES', payload: initialProperties });
          savePropertiesToStorage(initialProperties);
          console.log(`Cargadas ${initialProperties.length} propiedades iniciales`);
        } else {
          dispatch({ type: 'SET_PROPERTIES', payload: [] });
        }
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los datos iniciales' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadPropertiesFromStorage, savePropertiesToStorage]);

  // Cargar datos al inicializar la aplicación
  useEffect(() => {
    loadInitialDataIfEmpty();
  }, [loadInitialDataIfEmpty]);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch, 
      loadPropertiesFromStorage, 
      savePropertiesToStorage,
      loadInitialDataIfEmpty 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}