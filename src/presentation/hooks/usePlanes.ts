import { useEffect, useState, useCallback } from "react";
import { PlanMovil } from "../../domain/models/PlanMovil";
import { PlanesUseCase } from "../../domain/useCases/planes/PlanesUseCase";

const planesUseCase = new PlanesUseCase();

export function usePlanes() {
  const [planes, setPlanes] = useState<PlanMovil[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = useCallback(async () => {
    setCargando(true);
    const data = await planesUseCase.obtenerPlanesActivos();
    setPlanes(data);
    setCargando(false);
  }, []);

  const cargarTodosLosPlanes = useCallback(async () => {
    setCargando(true);
    const data = await planesUseCase.obtenerTodosLosPlanes();
    setPlanes(data);
    setCargando(false);
  }, []);

  const obtenerPlanPorId = async (id: string) => {
    return await planesUseCase.obtenerPlanPorId(id);
  };

  const crear = async (
    nombre: string,
    precio: number,
    datosGb: string,
    minutos: string,
    sms: string,
    velocidad4g: string,
    velocidad5g: string | null,
    redesSociales: string,
    whatsappIncluido: boolean,
    llamadasInternacionales: string,
    roaming: string,
    imagenUri?: string
  ) => {
    const resultado = await planesUseCase.crearPlan(
      nombre,
      precio,
      datosGb,
      minutos,
      sms,
      velocidad4g,
      velocidad5g,
      redesSociales,
      whatsappIncluido,
      llamadasInternacionales,
      roaming,
      imagenUri
    );
    
    if (resultado.success) {
      await cargarTodosLosPlanes();
    }
    return resultado;
  };

  const actualizar = async (
    id: string,
    nombre: string,
    precio: number,
    datosGb: string,
    minutos: string,
    sms: string,
    velocidad4g: string,
    velocidad5g: string | null,
    redesSociales: string,
    whatsappIncluido: boolean,
    llamadasInternacionales: string,
    roaming: string,
    activo: boolean,
    imagenUri?: string,
    imagenUrlAnterior?: string
  ) => {
    const resultado = await planesUseCase.actualizarPlan(
      id,
      nombre,
      precio,
      datosGb,
      minutos,
      sms,
      velocidad4g,
      velocidad5g,
      redesSociales,
      whatsappIncluido,
      llamadasInternacionales,
      roaming,
      activo,
      imagenUri,
      imagenUrlAnterior
    );
    
    if (resultado.success) {
      await cargarTodosLosPlanes();
    }
    return resultado;
  };

  const eliminar = async (id: string) => {
    const resultado = await planesUseCase.eliminarPlan(id);
    if (resultado.success) {
      await cargarTodosLosPlanes();
    }
    return resultado;
  };

  const seleccionarImagen = async () => {
    return await planesUseCase.seleccionarImagen();
  };

  const tomarFoto = async () => {
    return await planesUseCase.tomarFoto();
  };

  return {
    planes,
    cargando,
    cargarPlanes,
    cargarTodosLosPlanes,
    obtenerPlanPorId,
    crear,
    actualizar,
    eliminar,
    seleccionarImagen,
    tomarFoto,
  };
}