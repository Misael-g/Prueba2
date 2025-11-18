import { supabase } from "@/src/data/services/supabaseClient";
import { Contratacion } from "../../models/Contratacion";

export class ContratacionesUseCase {
  // Obtener ID del asesor único - MEJORADO
  private async obtenerAsesorUnico() {
    try {
      console.log("🔍 Buscando asesor disponible...");
      
      // ✅ SIN .single() - Retorna array
      const { data, error } = await supabase
        .from("perfiles")
        .select("id, email, nombre_completo, rol")
        .eq("rol", "asesor_comercial")
        .limit(1);

      if (error) {
        console.log("❌ Error al buscar asesor:", error);
        throw error;
      }

      // ✅ Verificar si hay resultados
      if (!data || data.length === 0) {
        console.log("⚠️ No se encontró ningún asesor comercial");
        
        // 🆕 CREAR ASESOR DE SISTEMA SI NO EXISTE
        console.log("🔧 Intentando crear asesor de sistema automáticamente...");
        
        const { data: nuevoAsesor, error: errorCrear } = await supabase
          .from("perfiles")
          .insert({
            email: 'sistema@tigo.com.ec',
            nombre_completo: 'Sistema Tigo',
            rol: 'asesor_comercial',
            telefono: '1-800-TIGO'
          })
          .select()
          .single();

        if (errorCrear) {
          console.log("❌ No se pudo crear asesor automático:", errorCrear);
          
          // Debug: Ver todos los perfiles
          const { data: todosPerfiles } = await supabase
            .from("perfiles")
            .select("email, rol");
          console.log("📋 Perfiles disponibles:", todosPerfiles);
          
          return null;
        }

        console.log("✅ Asesor de sistema creado:", nuevoAsesor.email);
        return nuevoAsesor.id;
      }

      const asesor = data[0]; // ✅ Tomar el primer resultado
      
      console.log("✅ Asesor encontrado:", {
        id: asesor.id,
        email: asesor.email,
        nombre: asesor.nombre_completo,
        rol: asesor.rol
      });

      return asesor.id;
    } catch (error: any) {
      console.log("❌ Error completo al obtener asesor:", error);
      return null;
    }
  }

  // Crear contratación (usuario) - MEJORADO
  async crearContratacion(planId: string) {
    try {
      console.log("🔵 Creando contratación para plan:", planId);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("❌ Usuario no autenticado");
        throw new Error("Usuario no autenticado");
      }

      console.log("👤 Usuario actual:", user.email);

      // Obtener asesor único
      const asesorId = await this.obtenerAsesorUnico();
      
      if (!asesorId) {
        console.log("❌ No hay asesores disponibles en la base de datos");
        
        // 🆕 Intentar crear el asesor si no existe
        console.log("🔧 Verificando si existe algún usuario que pueda ser asesor...");
        const { data: todosPerfiles } = await supabase
          .from("perfiles")
          .select("email, rol");
        
        console.log("📋 Perfiles disponibles:", todosPerfiles);
        
        throw new Error(
          "No hay asesores disponibles. Por favor, contacta al administrador del sistema."
        );
      }

      console.log("📤 Insertando contratación...");
      const { data, error } = await supabase
        .from("contrataciones")
        .insert({
          usuario_id: user.id,
          plan_id: planId,
          estado: "pendiente",
          asesor_asignado: asesorId,
        })
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:perfiles!contrataciones_usuario_id_fkey(*),
          asesor:perfiles!contrataciones_asesor_asignado_fkey(*)
        `)
        .single();

      if (error) {
        console.log("❌ Error al insertar contratación:", error);
        throw error;
      }

      console.log("✅ Contratación creada exitosamente:", data.id);
      return { success: true, contratacion: data };
    } catch (error: any) {
      console.log("❌ Error al crear contratación:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener contrataciones del usuario
  async obtenerMisContrataciones(): Promise<Contratacion[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:planes_moviles(*),
          asesor:perfiles!contrataciones_asesor_asignado_fkey(*)
        `)
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("📋 Mis contrataciones:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.log("❌ Error al obtener contrataciones:", error);
      return [];
    }
  }

  // Obtener todas las contrataciones (asesor)
  async obtenerTodasLasContrataciones(): Promise<Contratacion[]> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:perfiles!contrataciones_usuario_id_fkey(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("📋 Todas las contrataciones:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.log("❌ Error al obtener contrataciones:", error);
      return [];
    }
  }

  // Obtener contrataciones pendientes (asesor)
  async obtenerContratacionesPendientes(): Promise<Contratacion[]> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:perfiles!contrataciones_usuario_id_fkey(*)
        `)
        .eq("estado", "pendiente")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("⏳ Contrataciones pendientes:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.log("❌ Error al obtener pendientes:", error);
      return [];
    }
  }

  // Actualizar estado de contratación (asesor)
  async actualizarEstadoContratacion(
    id: string,
    estado: 'aprobada' | 'rechazada' | 'cancelada',
    numeroLinea?: string,
    observaciones?: string
  ) {
    try {
      console.log("🔵 Actualizando contratación:", { id, estado });

      const updateData: any = {
        estado,
        observaciones,
      };

      // Si se aprueba, agregar fechas y número de línea
      if (estado === 'aprobada') {
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setFullYear(fechaFin.getFullYear() + 1); // 1 año después

        updateData.fecha_inicio = fechaInicio.toISOString().split('T')[0];
        updateData.fecha_fin = fechaFin.toISOString().split('T')[0];
        updateData.numero_linea = numeroLinea;
      }

      const { data, error } = await supabase
        .from("contrataciones")
        .update(updateData)
        .eq("id", id)
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:perfiles!contrataciones_usuario_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      console.log("✅ Contratación actualizada:", data);
      return { success: true, contratacion: data };
    } catch (error: any) {
      console.log("❌ Error al actualizar contratación:", error);
      return { success: false, error: error.message };
    }
  }

  // Obtener contratación por ID
  async obtenerContratacionPorId(id: string): Promise<Contratacion | null> {
    try {
      const { data, error } = await supabase
        .from("contrataciones")
        .select(`
          *,
          plan:planes_moviles(*),
          usuario:perfiles!contrataciones_usuario_id_fkey(*),
          asesor:perfiles!contrataciones_asesor_asignado_fkey(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.log("❌ Error al obtener contratación:", error);
      return null;
    }
  }

  // Cancelar contratación (usuario)
  async cancelarContratacion(id: string) {
    try {
      const { error } = await supabase
        .from("contrataciones")
        .update({ estado: "cancelada" })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}