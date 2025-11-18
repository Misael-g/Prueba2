import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Perfil } from "../../domain/models/Perfil";
import { AuthUseCase } from "../../domain/useCases/auth/AuthUseCase";

const authUseCase = new AuthUseCase();

export function useAuth() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    console.log("🔵 useAuth iniciado");
    
    // Verificar sesión inicial
    verificarSesion();

    // Escuchar cambios de autenticación
    const { data: subscription } = authUseCase.onAuthStateChange(async (perfilActualizado) => {
      console.log("🔔 Cambio de auth state:", perfilActualizado?.email || 'sin sesión');
      
      setPerfil(perfilActualizado);
      setCargando(false);

      // IMPORTANTE: Navegar automáticamente según el rol
      if (perfilActualizado) {
        console.log("✅ Perfil obtenido, navegando según rol:", perfilActualizado.rol);
        
        // 🆕 REGISTRAR NOTIFICACIONES PUSH (CRÍTICO)
        try {
          console.log("📱 Registrando push token para:", perfilActualizado.email);
          const { NotificationService } = await import('@/src/services/NotificationService');
          const token = await NotificationService.registerForPushNotifications();
          
          if (token) {
            console.log("✅ Push token registrado exitosamente");
            console.log("   Token:", token.substring(0, 50) + "...");
          } else {
            console.log("⚠️ No se pudo obtener push token");
          }
        } catch (error) {
          console.log("⚠️ Error al registrar notificaciones:", error);
        }
        
        setTimeout(() => {
          if (perfilActualizado.rol === 'asesor_comercial') {
            console.log("➡️ Navegando a dashboard asesor");
            router.replace('/(asesor)/dashboard');
          } else if (perfilActualizado.rol === 'usuario_registrado') {
            console.log("➡️ Navegando a catálogo usuario");
            router.replace('/(usuario)/catalogo');
          }
        }, 300);
      }
    });

    return () => {
      console.log("🔴 useAuth limpiando suscripción");
      subscription.subscription.unsubscribe();
    };
  }, []);

  const verificarSesion = async () => {
    console.log("🔍 Verificando sesión actual...");
    setCargando(true);
    
    const perfilActual = await authUseCase.obtenerPerfilActual();
    
    console.log("📊 Perfil actual:", perfilActual?.email || 'sin sesión');
    
    setPerfil(perfilActual);
    setCargando(false);

    // 🆕 Si hay sesión, registrar push token
    if (perfilActual) {
      try {
        console.log("📱 Sesión existente detectada, registrando push token...");
        const { NotificationService } = await import('@/src/services/NotificationService');
        const token = await NotificationService.registerForPushNotifications();
        
        if (token) {
          console.log("✅ Push token actualizado para sesión existente");
        }
      } catch (error) {
        console.log("⚠️ Error al registrar push token:", error);
      }
    }
  };

  const registrar = async (email: string, password: string, nombreCompleto: string) => {
    console.log("🔵 Iniciando registro desde hook");
    const resultado = await authUseCase.registrar(email, password, nombreCompleto);
    
    if (resultado.success && !resultado.needsEmailConfirmation) {
      // Si el registro fue exitoso y no necesita confirmación, recargar perfil
      await verificarSesion();
    }
    
    return resultado;
  };

  const iniciarSesion = async (email: string, password: string) => {
    console.log("🔵 Iniciando sesión desde hook");
    
    const resultado = await authUseCase.iniciarSesion(email, password);
    
    if (resultado.success) {
      console.log("✅ Login exitoso en hook, recargando perfil...");
      
      // Esperar un momento y recargar el perfil
      await new Promise(resolve => setTimeout(resolve, 500));
      await verificarSesion();
    }
    
    return resultado;
  };

  const cerrarSesion = async () => {
    console.log("🔵 Cerrando sesión desde hook");
    
    // 🆕 IMPORTANTE: Limpiar el push token ANTES de cerrar sesión
    try {
      console.log("🧹 Limpiando push token antes de logout...");
      const { NotificationService } = await import('@/src/services/NotificationService');
      await NotificationService.clearTokenOnLogout();
      console.log("✅ Token limpiado correctamente");
    } catch (error) {
      console.log("⚠️ Error al limpiar token:", error);
    }
    
    const resultado = await authUseCase.cerrarSesion();
    
    if (resultado.success) {
      console.log("✅ Sesión cerrada en hook");
      setPerfil(null);
      
      // Navegar a login después de un momento
      setTimeout(() => {
        router.replace('/auth/login');
      }, 300);
    }
    
    return resultado;
  };

  const recuperarContrasena = async (email: string) => {
    return await authUseCase.recuperarContrasena(email);
  };

  const actualizarPerfil = async (datos: Partial<Perfil>) => {
    const resultado = await authUseCase.actualizarPerfil(datos);
    
    if (resultado.success && perfil) {
      // Actualizar el perfil localmente
      setPerfil({ ...perfil, ...datos });
    }
    
    return resultado;
  };

  return {
    perfil,
    cargando,
    registrar,
    iniciarSesion,
    cerrarSesion,
    recuperarContrasena,
    actualizarPerfil,
    esAsesor: perfil?.rol === "asesor_comercial",
    esUsuario: perfil?.rol === "usuario_registrado",
  };
}