import { supabase } from "@/src/data/services/supabaseClient";
import { Perfil } from "../../models/Perfil";

export class AuthUseCase {
  // Registrar nuevo usuario
  async registrar(email: string, password: string, nombreCompleto: string) {
    try {
      console.log("🔵 Iniciando registro:", { email, nombreCompleto });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
          },
        },
      });

      if (authError) {
        console.log("❌ Error en auth.signUp:", authError);
        throw authError;
      }

      if (!authData.user) {
        console.log("❌ No se obtuvo usuario en la respuesta");
        throw new Error("No se pudo crear el usuario");
      }

      console.log("✅ Usuario creado en Auth:", {
        id: authData.user.id,
        email: authData.user.email,
      });

      // Verificar si necesita confirmación de email
      const needsConfirmation = authData.user.identities && authData.user.identities.length === 0;
      console.log("📧 Necesita confirmación de email:", needsConfirmation);

      // Esperar a que el trigger cree el perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        user: authData.user,
        needsEmailConfirmation: needsConfirmation
      };
    } catch (error: any) {
      console.log("❌ Error en registrar:", error);
      return { success: false, error: error.message };
    }
  }

  // Iniciar sesión
  async iniciarSesion(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Cerrar sesión
  async cerrarSesion() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Recuperar contraseña
  async recuperarContrasena(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'prueba2app://reset-password',
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Obtener perfil del usuario actual
  async obtenerPerfilActual(): Promise<Perfil | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Perfil;
    } catch (error) {
      console.log("Error al obtener perfil:", error);
      return null;
    }
  }

  // Actualizar perfil
  async actualizarPerfil(datos: Partial<Perfil>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      const { error } = await supabase
        .from("perfiles")
        .update(datos)
        .eq("id", user.id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Escuchar cambios de autenticación
  onAuthStateChange(callback: (perfil: Perfil | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const perfil = await this.obtenerPerfilActual();
        callback(perfil);
      } else {
        callback(null);
      }
    });
  }
}