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
    
    verificarSesion();

    const { data: subscription } = authUseCase.onAuthStateChange(async (perfilActualizado) => {
      console.log("🔔 Cambio de auth state:", perfilActualizado?.email || 'sin sesión');
      
      setPerfil(perfilActualizado);
      setCargando(false);

      if (perfilActualizado) {
        console.log("✅ Perfil obtenido, navegando según rol:", perfilActualizado.rol);
        
        // ✅ Registrar notificaciones
        try {
          console.log("📱 Registrando notificaciones para:", perfilActualizado.email);
          const { NotificationService } = await import('@/src/services/NotificationService');
          
          const token = await NotificationService.registerForPushNotifications();
          
          if (token) {
            console.log("✅ Notificaciones configuradas");
            
            // ✅ CARGAR NOTIFICACIONES PENDIENTES
            await NotificationService.loadPendingNotifications();
            
            // ✅ SUSCRIBIRSE A NUEVAS NOTIFICACIONES (Realtime)
            NotificationService.subscribeToNotifications((notification) => {
              console.log("🔔 Notificación recibida:", notification.title);
            });
          } else {
            console.log("⚠️ No se pudieron configurar notificaciones");
          }
        } catch (error) {
          console.log("⚠️ Error al configurar notificaciones:", error);
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

    if (perfilActual) {
      try {
        console.log("📱 Sesión existente detectada, configurando notificaciones...");
        const { NotificationService } = await import('@/src/services/NotificationService');
        
        const token = await NotificationService.registerForPushNotifications();
        
        if (token) {
          console.log("✅ Notificaciones configuradas para sesión existente");
          
          // Cargar notificaciones que llegaron mientras estaba cerrada
          await NotificationService.loadPendingNotifications();
          
          // Suscribirse a nuevas
          NotificationService.subscribeToNotifications((notification) => {
            console.log("🔔 Nueva notificación:", notification.title);
          });
        }
      } catch (error) {
        console.log("⚠️ Error al configurar notificaciones:", error);
      }
    }
  };

  const registrar = async (email: string, password: string, nombreCompleto: string) => {
    console.log("🔵 Iniciando registro desde hook");
    const resultado = await authUseCase.registrar(email, password, nombreCompleto);
    
    if (resultado.success && !resultado.needsEmailConfirmation) {
      await verificarSesion();
    }
    
    return resultado;
  };

  const iniciarSesion = async (email: string, password: string) => {
    console.log("🔵 Iniciando sesión desde hook");
    
    const resultado = await authUseCase.iniciarSesion(email, password);
    
    if (resultado.success) {
      console.log("✅ Login exitoso en hook, recargando perfil...");
      await new Promise(resolve => setTimeout(resolve, 500));
      await verificarSesion();
    }
    
    return resultado;
  };

  const cerrarSesion = async () => {
    console.log("🔵 Cerrando sesión desde hook");
    
    try {
      console.log("🧹 Limpiando notificaciones antes de logout...");
      const { NotificationService } = await import('@/src/services/NotificationService');
      await NotificationService.clearTokenOnLogout();
      console.log("✅ Notificaciones limpiadas");
    } catch (error) {
      console.log("⚠️ Error al limpiar notificaciones:", error);
    }
    
    const resultado = await authUseCase.cerrarSesion();
    
    if (resultado.success) {
      console.log("✅ Sesión cerrada en hook");
      setPerfil(null);
      
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