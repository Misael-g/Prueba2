import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Validar que existan las variables de entorno
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase. Verifica tu archivo .env');
}

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// =====================================================
// TIPOS DE DATOS
// =====================================================

export type Perfil = {
  id: string;
  email: string;
  nombre_completo?: string;
  telefono?: string;
  rol: 'asesor_comercial' | 'usuario_registrado';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type PlanMovil = {
  id: string;
  nombre: string;
  precio: number;
  datos_gb: string;
  minutos: string;
  sms: string;
  velocidad_4g?: string;
  velocidad_5g?: string;
  redes_sociales?: string;
  whatsapp_incluido: boolean;
  llamadas_internacionales?: string;
  roaming?: string;
  imagen_url?: string;
  activo: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export type Contratacion = {
  id: string;
  usuario_id: string;
  plan_id: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
  fecha_contratacion: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  numero_linea?: string;
  observaciones?: string;
  asesor_asignado?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  plan?: PlanMovil;
  usuario?: Perfil;
  asesor?: Perfil;
};

export type MensajeChat = {
  id: string;
  contratacion_id: string;
  emisor_id: string;
  contenido: string;
  leido: boolean;
  created_at: string;
  // Relaciones
  emisor?: Perfil;
};

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

/**
 * Obtener perfil del usuario autenticado
 */
export async function obtenerPerfilUsuario() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: 'No hay usuario autenticado' };
  }
  
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return { data, error };
}

/**
 * Verificar si el usuario es asesor
 */
export async function esAsesor() {
  const { data } = await obtenerPerfilUsuario();
  return data?.rol === 'asesor_comercial';
}

/**
 * Subir imagen de plan al Storage
 */
export async function subirImagenPlan(uri: string, planId: string) {
  try {
    // Convertir URI a Blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Generar nombre único
    const fileExt = uri.split('.').pop();
    const fileName = `${planId}.${fileExt}`;
    const filePath = `planes/${fileName}`;
    
    // Subir archivo
    const { data, error } = await supabase.storage
      .from('planes-imagenes')
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: true, // Sobrescribir si ya existe
      });
    
    if (error) throw error;
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('planes-imagenes')
      .getPublicUrl(filePath);
    
    return { data: publicUrl, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

/**
 * Eliminar imagen de plan del Storage
 */
export async function eliminarImagenPlan(planId: string) {
  try {
    // Listar archivos que coincidan con el planId
    const { data: files, error: listError } = await supabase.storage
      .from('planes-imagenes')
      .list('planes', {
        search: planId,
      });
    
    if (listError) throw listError;
    
    // Eliminar todos los archivos encontrados
    if (files && files.length > 0) {
      const filesToRemove = files.map(file => `planes/${file.name}`);
      const { error: removeError } = await supabase.storage
        .from('planes-imagenes')
        .remove(filesToRemove);
      
      if (removeError) throw removeError;
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Obtener ID del asesor único
 * (Para asignar automáticamente en contrataciones)
 */
export async function obtenerAsesorUnico() {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, email, nombre_completo')
    .eq('rol', 'asesor_comercial')
    .limit(1)
    .single();
  
  return { data, error };
}

/**
 * Formatear fecha para mostrar
 */
export function formatearFecha(fecha: string): string {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatear precio
 */
export function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}