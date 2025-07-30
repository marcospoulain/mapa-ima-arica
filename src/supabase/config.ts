import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Configuración de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Crear cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export default supabase;