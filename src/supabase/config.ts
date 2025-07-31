import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Configuración de Supabase con fallbacks
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://gpvjloxxxxasypjrihiq.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwdmpsb3h4eHhhc3lwanJpaGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODU4ODcsImV4cCI6MjA2OTQ2MTg4N30.zrQu7hzxebJThMIdLth2QTYVtKFM_0Oxh0V9kW5YT8k';

// Log de configuración para debug
console.log('Supabase Configuration:', {
  url: supabaseUrl,
  keyExists: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  envUrl: process.env.REACT_APP_SUPABASE_URL,
  envKeyExists: !!process.env.REACT_APP_SUPABASE_ANON_KEY
});

// Validar configuración
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('URL:', supabaseUrl);
  console.error('Key exists:', !!supabaseAnonKey);
} else if (!supabaseUrl.includes('supabase.co')) {
  console.error('❌ Invalid Supabase URL format');
} else if (supabaseAnonKey.length < 50) {
  console.error('❌ Invalid Supabase key format');
} else {
  console.log('✅ Supabase configuration is valid');
}

// Crear cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'mapa-propiedades-arica'
    }
  }
});

// Agregar propiedades para acceso directo
(supabase as any).supabaseUrl = supabaseUrl;
(supabase as any).supabaseKey = supabaseAnonKey;

// Test de conexión
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Error testing Supabase connection:', error);
  } else {
    console.log('✅ Supabase connection test successful');
    if (data.session) {
      console.log('📝 Active session found:', data.session.user.email);
    }
  }
}).catch(error => {
  console.error('❌ Failed to test Supabase connection:', error);
});

export default supabase;