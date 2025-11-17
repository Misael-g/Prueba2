import { useState, useEffect, useCallback } from "react";
import { ChatUseCase } from "@/src/domain/useCases/chat/ChatUseCase";
import { MensajeChat } from "@/src/domain/models/MensajeChat";

const chatUseCase = new ChatUseCase();

export function useChat(contratacionId: string) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);

  // Cargar mensajes
  const cargarMensajes = useCallback(async () => {
    if (!contratacionId) return;
    
    setCargando(true);
    const mensajesObtenidos = await chatUseCase.obtenerMensajes(contratacionId);
    setMensajes(mensajesObtenidos);
    setCargando(false);
  }, [contratacionId]);

  // Enviar mensaje
  const enviarMensaje = useCallback(async (contenido: string) => {
    if (!contenido.trim() || enviando || !contratacionId) {
      return { success: false, error: "El mensaje está vacío" };
    }

    setEnviando(true);
    const resultado = await chatUseCase.enviarMensaje(contratacionId, contenido);
    setEnviando(false);

    return resultado;
  }, [contratacionId, enviando]);

  // Marcar mensaje como leído
  const marcarComoLeido = useCallback(async (mensajeId: string) => {
    return await chatUseCase.marcarComoLeido(mensajeId);
  }, []);

  // Marcar todos como leídos
  const marcarTodosComoLeidos = useCallback(async () => {
    if (!contratacionId) return;
    
    const resultado = await chatUseCase.marcarTodosComoLeidos(contratacionId);
    if (resultado.success) {
      setMensajesNoLeidos(0);
    }
  }, [contratacionId]);

  // Obtener conteo de no leídos
  const actualizarNoLeidos = useCallback(async () => {
    if (!contratacionId) return;
    
    const count = await chatUseCase.obtenerMensajesNoLeidos(contratacionId);
    setMensajesNoLeidos(count);
  }, [contratacionId]);

  // Eliminar mensaje
  const eliminarMensaje = useCallback(async (mensajeId: string) => {
    const resultado = await chatUseCase.eliminarMensaje(mensajeId);
    if (resultado.success) {
      setMensajes(prev => prev.filter(m => m.id !== mensajeId));
    }
    return resultado;
  }, []);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!contratacionId) return;

    // Cargar mensajes iniciales
    cargarMensajes();
    actualizarNoLeidos();

    // Suscribirse a nuevos mensajes
    const desuscribir = chatUseCase.suscribirseAMensajes(contratacionId, (nuevoMensaje) => {
      setMensajes(prev => {
        // Evitar duplicados
        if (prev.some(m => m.id === nuevoMensaje.id)) {
          return prev;
        }
        return [...prev, nuevoMensaje];
      });

      // Actualizar contador de no leídos
      actualizarNoLeidos();
    });

    return () => {
      desuscribir();
    };
  }, [contratacionId, cargarMensajes, actualizarNoLeidos]);

  return {
    mensajes,
    cargando,
    enviando,
    mensajesNoLeidos,
    enviarMensaje,
    marcarComoLeido,
    marcarTodosComoLeidos,
    recargarMensajes: cargarMensajes,
    eliminarMensaje,
  };
}