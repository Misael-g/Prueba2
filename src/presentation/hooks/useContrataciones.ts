import { useEffect, useState, useCallback } from "react";
import { Contratacion } from "../../domain/models/Contratacion";
import { ContratacionesUseCase } from "../../domain/useCases/contrataciones/ContratacionesUseCase";

const contratacionesUseCase = new ContratacionesUseCase();

export function useContrataciones() {
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarMisContrataciones = useCallback(async () => {
    setCargando(true);
    const data = await contratacionesUseCase.obtenerMisContrataciones();
    setContrataciones(data);
    setCargando(false);
  }, []);

  const cargarTodasLasContrataciones = useCallback(async () => {
    setCargando(true);
    const data = await contratacionesUseCase.obtenerTodasLasContrataciones();
    setContrataciones(data);
    setCargando(false);
  }, []);

  const cargarContratacionesPendientes = useCallback(async () => {
    setCargando(true);
    const data = await contratacionesUseCase.obtenerContratacionesPendientes();
    setContrataciones(data);
    setCargando(false);
  }, []);

  const crear = async (planId: string) => {
    const resultado = await contratacionesUseCase.crearContratacion(planId);
    if (resultado.success) {
      await cargarMisContrataciones();
    }
    return resultado;
  };

  const actualizarEstado = async (
    id: string,
    estado: 'aprobada' | 'rechazada' | 'cancelada',
    numeroLinea?: string,
    observaciones?: string
  ) => {
    const resultado = await contratacionesUseCase.actualizarEstadoContratacion(
      id,
      estado,
      numeroLinea,
      observaciones
    );
    
    if (resultado.success) {
      await cargarTodasLasContrataciones();
    }
    return resultado;
  };

  const obtenerPorId = async (id: string) => {
    return await contratacionesUseCase.obtenerContratacionPorId(id);
  };

  const cancelar = async (id: string) => {
    const resultado = await contratacionesUseCase.cancelarContratacion(id);
    if (resultado.success) {
      await cargarMisContrataciones();
    }
    return resultado;
  };

  return {
    contrataciones,
    cargando,
    cargarMisContrataciones,
    cargarTodasLasContrataciones,
    cargarContratacionesPendientes,
    crear,
    actualizarEstado,
    obtenerPorId,
    cancelar,
  };
}