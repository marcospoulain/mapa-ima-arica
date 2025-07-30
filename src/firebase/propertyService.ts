import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import { Property } from '../types';

// Colección de propiedades
const PROPERTIES_COLLECTION = 'properties';

// Obtener todas las propiedades
export const getProperties = async (): Promise<Property[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PROPERTIES_COLLECTION));
    const properties: Property[] = [];
    
    querySnapshot.forEach((doc) => {
      properties.push({
        id: doc.id,
        ...doc.data()
      } as Property);
    });
    
    return properties;
  } catch (error) {
    console.error('Error getting properties:', error);
    throw error;
  }
};

// Agregar nueva propiedad
export const addProperty = async (property: Omit<Property, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), property);
    return docRef.id;
  } catch (error) {
    console.error('Error adding property:', error);
    throw error;
  }
};

// Actualizar propiedad
export const updateProperty = async (id: string, property: Partial<Property>): Promise<void> => {
  try {
    const propertyRef = doc(db, PROPERTIES_COLLECTION, id);
    await updateDoc(propertyRef, property);
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

// Eliminar propiedad
export const deleteProperty = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PROPERTIES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// Subir imagen a Firebase Storage
export const uploadPropertyImage = async (file: File, propertyId: string): Promise<string> => {
  try {
    const imageRef = ref(storage, `properties/${propertyId}/${file.name}`);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Buscar propiedades por filtros
export const searchProperties = async (filters: {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}): Promise<Property[]> => {
  try {
    let q = query(collection(db, PROPERTIES_COLLECTION));
    
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    if (filters.minPrice) {
      q = query(q, where('price', '>=', filters.minPrice));
    }
    
    if (filters.maxPrice) {
      q = query(q, where('price', '<=', filters.maxPrice));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const properties: Property[] = [];
    
    querySnapshot.forEach((doc) => {
      properties.push({
        id: doc.id,
        ...doc.data()
      } as Property);
    });
    
    return properties;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};