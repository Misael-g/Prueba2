import { PlanMovil } from "./PlanMovil";
import { Perfil } from "./Perfil";

export interface Contratacion {
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
  // Relaciones (joins)
  plan?: PlanMovil;
  usuario?: Perfil;
  asesor?: Perfil;
}