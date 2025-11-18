import { supabase } from "@/src/data/services/supabaseClient";
import { MensajeChat } from "../../models/MensajeChat";
import { RealtimeChannel } from "@supabase/supabase-js";

export class ChatUseCase {
  private channel: RealtimeChannel | null = null;

  // Obtener mensajes de una contratación
  async obtenerMensajes(contratacionId: string, limite: number = 50): Promise<MensajeChat[]> {
    try {
      const { data, error } = await supabase
        .from("mensajes_chat")
        .select(`
          *,
          emisor:perfiles(email, nombre_completo, rol)
        `)
        .eq("contratacion_id", contratacionId)
        .order("created_at", { ascending: false })
        .limit(limite);

      if (error) {
        console.error("❌ Error al obtener mensajes:", error);
        throw error;
      }

      console.log("💬 Mensajes obtenidos:", data?.length || 0);

      const mensajesFormateados = (data || []).map((msg: any) => ({
        id: msg.id,
        contratacion_id: msg.contratacion_id,
        emisor_id: msg.emisor_id,
        contenido: msg.contenido,
        leido: msg.leido,
        created_at: msg.created_at,
        emisor: msg.emisor
      }));

      return mensajesFormateados.reverse() as MensajeChat[];
    } catch (error) {
      console.error("❌ Error al obtener mensajes:", error);
      return [];
    }
  }

  // Enviar mensaje - ✅✅ COMPLETAMENTE CORREGIDO
  async enviarMensaje(
    contratacionId: string,
    contenido: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "Usuario no autenticado" };
      }

      console.log("📤 [ENVIAR] Usuario:", user.email, "ID:", user.id);

      // 📋 PRIMERO: Obtener información de la contratación ANTES de insertar
      const { data: contratacion, error: errorContratacion } = await supabase
        .from("contrataciones")
        .select(`
          usuario_id,
          asesor_asignado,
          usuario:perfiles!contrataciones_usuario_id_fkey(nombre_completo, email),
          asesor:perfiles!contrataciones_asesor_asignado_fkey(nombre_completo, email),
          plan:planes_moviles(nombre)
        `)
        .eq("id", contratacionId)
        .single();

      if (errorContratacion || !contratacion) {
        console.log("❌ No se encontró la contratación");
        return { success: false, error: "Contratación no encontrada" };
      }

      console.log("📋 Contratación:");
      console.log(`   ├─ Usuario: ${contratacion.usuario?.email} (${contratacion.usuario_id})`);
      console.log(`   └─ Asesor: ${contratacion.asesor?.email} (${contratacion.asesor_asignado})`);

      // ✅✅ DETERMINAR RECEPTOR ANTES DE INSERTAR
      let receptorId: string | null = null;
      let nombreEmisor = "Usuario";

      if (user.id === contratacion.usuario_id) {
        // El emisor es el USUARIO → receptor es el ASESOR
        receptorId = contratacion.asesor_asignado;
        nombreEmisor = contratacion.usuario?.nombre_completo || contratacion.usuario?.email || 'Usuario';
        console.log("👤 Emisor: USUARIO → Receptor: ASESOR");
      } else if (user.id === contratacion.asesor_asignado) {
        // El emisor es el ASESOR → receptor es el USUARIO
        receptorId = contratacion.usuario_id;
        nombreEmisor = contratacion.asesor?.nombre_completo || contratacion.asesor?.email || 'Asesor';
        console.log("👔 Emisor: ASESOR → Receptor: USUARIO");
      } else {
        console.log("❌ El usuario no pertenece a esta contratación");
        return { success: false, error: "No autorizado" };
      }

      // ✅✅ VALIDACIÓN CRÍTICA FINAL
      if (!receptorId || receptorId === user.id) {
        console.log("❌ BLOQUEADO: Receptor inválido o es el mismo emisor");
        console.log(`   ├─ ReceptorId: ${receptorId}`);
        console.log(`   └─ EmisorId: ${user.id}`);
        return { success: false, error: "Receptor inválido" };
      }

      console.log("✅ Validación OK:");
      console.log(`   ├─ Emisor: ${user.id}`);
      console.log(`   └─ Receptor: ${receptorId} ✓`);

      // AHORA SÍ: Insertar el mensaje
      const { data, error } = await supabase
        .from("mensajes_chat")
        .insert({
          contratacion_id: contratacionId,
          emisor_id: user.id,
          contenido,
        })
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Mensaje insertado en BD");

      // 📤 ENVIAR NOTIFICACIÓN AL RECEPTOR
      try {
        const { NotificationService } = await import('@/src/services/NotificationService');
        
        console.log(`📤 Enviando notificación push:`);
        console.log(`   ├─ De: ${nombreEmisor}`);
        console.log(`   ├─ Para: ${receptorId}`);
        console.log(`   └─ Contenido: "${contenido.substring(0, 50)}..."`);
        
        await NotificationService.sendPushNotification(
          receptorId,
          `💬 ${nombreEmisor}`,
          contenido.length > 100 ? `${contenido.substring(0, 100)}...` : contenido,
          { 
            type: 'nuevo_mensaje', 
            contratacion_id: contratacionId,
            emisor_id: user.id,
            plan_nombre: contratacion.plan?.nombre
          }
        );

        console.log("✅ Notificación enviada correctamente");

      } catch (notifError) {
        console.log("⚠️ Error al enviar notificación:", notifError);
        // No fallar el envío del mensaje si la notificación falla
      }

      return { success: true };

    } catch (error: any) {
      console.error("❌ Error al enviar mensaje:", error);
      return { success: false, error: error.message };
    }
  }

  // Marcar mensaje como leído
  async marcarComoLeido(mensajeId: string) {
    try {
      const { error } = await supabase
        .from("mensajes_chat")
        .update({ leido: true })
        .eq("id", mensajeId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Marcar todos los mensajes de una contratación como leídos
  async marcarTodosComoLeidos(contratacionId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      // Marcar como leídos solo los mensajes que NO son del usuario actual
      const { error } = await supabase
        .from("mensajes_chat")
        .update({ leido: true })
        .eq("contratacion_id", contratacionId)
        .neq("emisor_id", user.id)
        .eq("leido", false);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Suscribirse a mensajes en tiempo real
  suscribirseAMensajes(contratacionId: string, callback: (mensaje: MensajeChat) => void) {
    this.channel = supabase.channel(`mensajes-${contratacionId}`);

    this.channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `contratacion_id=eq.${contratacionId}`
        },
        async (payload) => {
          console.log('📨 Nuevo mensaje recibido!', payload.new);

          try {
            const { data, error } = await supabase
              .from("mensajes_chat")
              .select(`
                *,
                emisor:perfiles(email, nombre_completo, rol)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('⚠️ Error al obtener mensaje completo:', error);

              const mensajeFallback: MensajeChat = {
                id: payload.new.id,
                contratacion_id: payload.new.contratacion_id,
                emisor_id: payload.new.emisor_id,
                contenido: payload.new.contenido,
                leido: payload.new.leido,
                created_at: payload.new.created_at,
                emisor: {
                  id: payload.new.emisor_id,
                  email: 'usuario@tigo.com',
                  rol: 'usuario_registrado',
                  created_at: '',
                  updated_at: ''
                }
              };

              callback(mensajeFallback);
              return;
            }

            if (data) {
              console.log('✅ Mensaje completo obtenido:', data);
              
              const mensajeFormateado: MensajeChat = {
                id: data.id,
                contratacion_id: data.contratacion_id,
                emisor_id: data.emisor_id,
                contenido: data.contenido,
                leido: data.leido,
                created_at: data.created_at,
                emisor: data.emisor
              };

              callback(mensajeFormateado);
            }
          } catch (err) {
            console.error('❌ Error inesperado:', err);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de suscripción chat:', status);
      });

    return () => {
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }
    };
  }

  // Obtener conteo de mensajes no leídos
  async obtenerMensajesNoLeidos(contratacionId: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from("mensajes_chat")
        .select("*", { count: 'exact', head: true })
        .eq("contratacion_id", contratacionId)
        .eq("leido", false)
        .neq("emisor_id", user.id);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("❌ Error al contar no leídos:", error);
      return 0;
    }
  }

  // Eliminar mensaje
  async eliminarMensaje(mensajeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("mensajes_chat")
        .delete()
        .eq('id', mensajeId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("❌ Error al eliminar mensaje:", error);
      return { success: false, error: error.message };
    }
  }
}