import { useEffect, useState } from "react";
import { Perfil } from "../../domain/models/Perfil";
import { AuthUseCase } from "../../domain/useCases/auth/AuthUseCase";

const authUseCase = new AuthUseCase();

export function useAuth() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar sesión inicial
    verificarSesion();

    // Escuchar cambios de autenticación
    const { data: subscription } = authUseCase.onAuthStateChange((perfilActualizado) => {
      setPerfil(perfilActualizado);
      setCargando(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const verificarSesion = async () => {
    const perfilActual = await authUseCase.obtenerPerfilActual();
    setPerfil(perfilActual);
    setCargando(false);
  };

  const registrar = async (email: string, password: string, nombreCompleto: string) => {
    return await authUseCase.registrar(email, password, nombreCompleto);
  };

  const iniciarSesion = async (email: string, password: string) => {
    return await authUseCase.iniciarSesion(email, password);
  };

  const cerrarSesion = async () => {
    const resultado = await authUseCase.cerrarSesion();
    if (resultado.success) {
      setPerfil(null);
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