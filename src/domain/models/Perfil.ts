export interface Perfil {
  id: string;
  email: string;
  nombre_completo?: string;
  telefono?: string;
  rol: 'asesor_comercial' | 'usuario_registrado';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}