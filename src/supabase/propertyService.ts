import { supabase } from './config';
import { Property } from '../types';
import { Database } from '../types/supabase';

// Tipo para los datos de Supabase
type SupabaseProperty = Database['public']['Tables']['properties']['Row'];

// Obtener todas las propiedades
export const getProperties = async (): Promise<Property[]> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Mapear los datos de Supabase al formato de Property
    return data.map((item: SupabaseProperty) => ({
      id: item.id,
      title: item.title || '',
      type: item.type || '',
      price: item.price || 0,
      location: item.location || '',
      description: item.description || '',
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bathrooms || 0,
      area: item.area || 0,
      coordinates: (item.coordinates as { lat: number; lng: number }) || { lat: -18.4783, lng: -70.3126 },
      imageUrl: item.image_url || '',
      features: (item.features as string[]) || [],
      status: item.status || 'active',
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      // Campos adicionales para compatibilidad
      latitud: (item.coordinates as any)?.lat || -18.4783,
      longitud: (item.coordinates as any)?.lng || -70.3126
    }));
  } catch (error) {
    console.error('Error getting properties:', error);
    throw error;
  }
};

// Agregar nueva propiedad
export const addProperty = async (property: Omit<Property, 'id'>): Promise<string> => {
  try {
    // Convertir de formato Property a formato Supabase
    const supabaseProperty = {
      title: property.title || property.direccion || 'Sin título',
      type: property.type || property.destinoBienRaiz || 'Sin especificar',
      price: property.price || property.avaluoTotal || 0,
      location: property.location || property.direccion || '',
      description: property.description || '',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      area: property.area || property.superficieTerreno || 0,
      coordinates: property.coordinates || { 
        lat: property.latitud || -18.4783, 
        lng: property.longitud || -70.3126 
      },
      image_url: property.imageUrl || '',
      features: property.features || [],
      status: property.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('properties')
      .insert(supabaseProperty)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error adding property:', error);
    throw error;
  }
};

// Actualizar propiedad
export const updateProperty = async (id: string, property: Partial<Property>): Promise<void> => {
  try {
    // Convertir de formato Property a formato Supabase
    const supabaseProperty: any = {};
    
    if (property.title !== undefined) supabaseProperty.title = property.title;
    if (property.type !== undefined) supabaseProperty.type = property.type;
    if (property.price !== undefined) supabaseProperty.price = property.price;
    if (property.location !== undefined) supabaseProperty.location = property.location;
    if (property.description !== undefined) supabaseProperty.description = property.description;
    if (property.bedrooms !== undefined) supabaseProperty.bedrooms = property.bedrooms;
    if (property.bathrooms !== undefined) supabaseProperty.bathrooms = property.bathrooms;
    if (property.area !== undefined) supabaseProperty.area = property.area;
    if (property.coordinates !== undefined) supabaseProperty.coordinates = property.coordinates;
    if (property.imageUrl !== undefined) supabaseProperty.image_url = property.imageUrl;
    if (property.features !== undefined) supabaseProperty.features = property.features;
    if (property.status !== undefined) supabaseProperty.status = property.status;
    
    // Mapear campos adicionales
    if (property.direccion !== undefined && !supabaseProperty.title) {
      supabaseProperty.title = property.direccion;
      supabaseProperty.location = property.direccion;
    }
    if (property.destinoBienRaiz !== undefined && !supabaseProperty.type) {
      supabaseProperty.type = property.destinoBienRaiz;
    }
    if (property.avaluoTotal !== undefined && !supabaseProperty.price) {
      supabaseProperty.price = property.avaluoTotal;
    }
    if (property.superficieTerreno !== undefined && !supabaseProperty.area) {
      supabaseProperty.area = property.superficieTerreno;
    }
    if ((property.latitud !== undefined || property.longitud !== undefined) && !supabaseProperty.coordinates) {
      supabaseProperty.coordinates = {
        lat: property.latitud || -18.4783,
        lng: property.longitud || -70.3126
      };
    }
    
    supabaseProperty.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('properties')
      .update(supabaseProperty)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

// Eliminar propiedad
export const deleteProperty = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// Subir imagen a Supabase Storage
export const uploadPropertyImage = async (file: File, propertyId: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}-${Date.now()}.${fileExt}`;
    const filePath = `properties/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Buscar propiedad por ROL (identificador único)
export const getPropertyByROL = async (rol: string): Promise<Property | null> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('title', rol)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró la propiedad
        return null;
      }
      throw error;
    }

    // Mapear los datos de Supabase al formato de Property
    return {
      id: data.id,
      title: data.title || '',
      type: data.type || '',
      price: data.price || 0,
      location: data.location || '',
      description: data.description || '',
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      area: data.area || 0,
      coordinates: (data.coordinates as { lat: number; lng: number }) || { lat: -18.4783, lng: -70.3126 },
      imageUrl: data.image_url || '',
      features: (data.features as string[]) || [],
      status: data.status || 'active',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      // Campos adicionales para compatibilidad
      latitud: (data.coordinates as any)?.lat || -18.4783,
      longitud: (data.coordinates as any)?.lng || -70.3126
    };
  } catch (error) {
    console.error('Error getting property by ROL:', error);
    throw error;
  }
};

// Función para actualizar o insertar propiedades (upsert) sin duplicidad
export const upsertProperty = async (property: Omit<Property, 'id'>): Promise<{ id: string; isNew: boolean }> => {
  try {
    const rol = property.title || property.rol || '';
    
    if (!rol) {
      throw new Error('ROL es requerido para identificar la propiedad');
    }

    // Buscar si ya existe una propiedad con este ROL
    const existingProperty = await getPropertyByROL(rol);

    if (existingProperty) {
      // Actualizar propiedad existente
      await updateProperty(existingProperty.id, property);
      return { id: existingProperty.id, isNew: false };
    } else {
      // Crear nueva propiedad
      const newId = await addProperty(property);
      return { id: newId, isNew: true };
    }
  } catch (error) {
    console.error('Error upserting property:', error);
    throw error;
  }
};

// Función para procesar múltiples propiedades con upsert
export const bulkUpsertProperties = async (properties: Omit<Property, 'id'>[]): Promise<{
  created: number;
  updated: number;
  errors: Array<{ index: number; error: string; rol: string }>;
}> => {
  const results = {
    created: 0,
    updated: 0,
    errors: [] as Array<{ index: number; error: string; rol: string }>
  };

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    const rol = property.title || property.rol || `Propiedad ${i + 1}`;

    try {
      const result = await upsertProperty(property);
      if (result.isNew) {
        results.created++;
      } else {
        results.updated++;
      }
    } catch (error) {
      results.errors.push({
        index: i + 1,
        error: error instanceof Error ? error.message : 'Error desconocido',
        rol: rol
      });
    }
  }

  return results;
};

// Buscar propiedades por filtros
export const searchProperties = async (filters: {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}): Promise<Property[]> => {
  try {
    let query = supabase
      .from('properties')
      .select('*');
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;

    if (error) throw error;

    // Mapear los datos de Supabase al formato de Property
    return data.map((item: SupabaseProperty) => ({
      id: item.id,
      title: item.title || '',
      type: item.type || '',
      price: item.price || 0,
      location: item.location || '',
      description: item.description || '',
      bedrooms: item.bedrooms || 0,
      bathrooms: item.bathrooms || 0,
      area: item.area || 0,
      coordinates: (item.coordinates as { lat: number; lng: number }) || { lat: -18.4783, lng: -70.3126 },
      imageUrl: item.image_url || '',
      features: (item.features as string[]) || [],
      status: item.status || 'active',
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      // Campos adicionales para compatibilidad
      latitud: (item.coordinates as any)?.lat || -18.4783,
      longitud: (item.coordinates as any)?.lng || -70.3126
    }));
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};