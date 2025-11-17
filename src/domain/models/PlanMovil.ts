export interface PlanMovil {
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
}