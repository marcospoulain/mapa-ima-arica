import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Property, User, AppState } from '../types';

type Action =
  | { type: 'SET_PROPERTIES'; payload: Property[] }
  | { type: 'ADD_PROPERTY'; payload: Property }
  | { type: 'UPDATE_PROPERTY'; payload: Property }
  | { type: 'DELETE_PROPERTY'; payload: string }
  | { type: 'SELECT_PROPERTY'; payload: Property | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL_PROPERTIES' };

const initialState: AppState = {
  properties: [],
  selectedProperty: null,
  user: null,
  loading: false,
  error: null,
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
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loadPropertiesFromStorage: () => void;
  savePropertiesToStorage: (properties: Property[]) => void;
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
      }
    } catch (error) {
      console.error('Error loading properties from storage:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los datos almacenados' });
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

  return (
    <AppContext.Provider value={{ state, dispatch, loadPropertiesFromStorage, savePropertiesToStorage }}>
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