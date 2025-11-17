import { Perfil } from "./Perfil";

export interface MensajeChat {
  id: string;
  contratacion_id: string;
  emisor_id: string;
  contenido: string;
  leido: boolean;
  created_at: string;
  // Relaciones
  emisor?: Perfil;
}