import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/src/data/services/supabaseClient";
import { PlanMovil } from "../../models/PlanMovil";

export class PlanesUseCase {
  // Obtener todos los planes activos
  async obtenerPlanesActivos(): Promise<PlanMovil[]> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("activo", true)
        .order("precio", { ascending: true });

      if (error) throw error;
      
      console.log("📱 Planes activos obtenidos:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.log("❌ Error al obtener planes:", error);
      return [];
    }
  }

  // Obtener todos los planes (solo asesores)
  async obtenerTodosLosPlanes(): Promise<PlanMovil[]> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      console.log("📱 Todos los planes obtenidos:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.log("❌ Error al obtener planes:", error);
      return [];
    }
  }

  // Obtener plan por ID
  async obtenerPlanPorId(id: string): Promise<PlanMovil | null> {
    try {
      const { data, error } = await supabase
        .from("planes_moviles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.log("❌ Error al obtener plan:", error);
      return null;
    }
  }

  // Crear plan (solo asesores)
  async crearPlan(
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
  ) {
    try {
      console.log("🔵 Creando plan:", nombre);
      
      let imagenUrl = null;
      if (imagenUri) {
        console.log("📤 Subiendo imagen...");
        imagenUrl = await this.subirImagen(imagenUri);
        console.log("✅ URL de imagen:", imagenUrl);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("planes_moviles")
        .insert({
          nombre,
          precio,
          datos_gb: datosGb,
          minutos,
          sms,
          velocidad_4g: velocidad4g,
          velocidad_5g: velocidad5g,
          redes_sociales: redesSociales,
          whatsapp_incluido: whatsappIncluido,
          llamadas_internacionales: llamadasInternacionales,
          roaming,
          imagen_url: imagenUrl,
          created_by: user.id,
          activo: true,
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log("✅ Plan creado:", data);
      return { success: true, plan: data };
    } catch (error: any) {
      console.log("❌ Error al crear plan:", error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar plan (solo asesores)
  async actualizarPlan(
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
  ) {
    try {
      console.log("🔵 Actualizando plan:", id);
      
      let imagenUrl = imagenUrlAnterior;

      if (imagenUri) {
        console.log("📤 Subiendo nueva imagen...");
        
        // Eliminar imagen anterior si existe
        if (imagenUrlAnterior) {
          await this.eliminarImagen(imagenUrlAnterior);
        }
        
        imagenUrl = await this.subirImagen(imagenUri);
        console.log("✅ Nueva imagen subida:", imagenUrl);
      }

      const { data, error } = await supabase
        .from("planes_moviles")
        .update({
          nombre,
          precio,
          datos_gb: datosGb,
          minutos,
          sms,
          velocidad_4g: velocidad4g,
          velocidad_5g: velocidad5g,
          redes_sociales: redesSociales,
          whatsapp_incluido: whatsappIncluido,
          llamadas_internacionales: llamadasInternacionales,
          roaming,
          imagen_url: imagenUrl,
          activo,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      console.log("✅ Plan actualizado:", data);
      return { success: true, plan: data };
    } catch (error: any) {
      console.log("❌ Error al actualizar plan:", error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar plan (desactivar)
  async eliminarPlan(id: string) {
    try {
      const { error } = await supabase
        .from("planes_moviles")
        .update({ activo: false })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Subir imagen a Storage
  private async subirImagen(uri: string): Promise<string | null> {
    try {
      console.log("📤 [subirImagen] URI recibida:", uri);
      
      const extension = uri.split(".").pop();
      const nombreArchivo = `${Date.now()}.${extension}`;
      console.log("📝 [subirImagen] Nombre archivo:", nombreArchivo);

      console.log("📄 [subirImagen] Leyendo archivo...");
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      console.log("✅ [subirImagen] ArrayBuffer creado:", arrayBuffer.byteLength, "bytes");

      console.log("☁️ [subirImagen] Subiendo a Supabase Storage...");
      const { data, error } = await supabase.storage
        .from("planes-imagenes")
        .upload(`planes/${nombreArchivo}`, arrayBuffer, {
          contentType: `image/${extension}`,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.log("❌ [subirImagen] Error al subir:", error);
        throw error;
      }

      console.log("✅ [subirImagen] Archivo subido:", data);

      const { data: urlData } = supabase.storage
        .from("planes-imagenes")
        .getPublicUrl(`planes/${nombreArchivo}`);

      console.log("🔗 [subirImagen] URL pública:", urlData.publicUrl);
      
      return urlData.publicUrl;
    } catch (error) {
      console.log("❌ [subirImagen] Error completo:", error);
      return null;
    }
  }

  // Eliminar imagen de Storage
  private async eliminarImagen(imagenUrl: string): Promise<void> {
    try {
      console.log("🗑️ [eliminarImagen] Eliminando:", imagenUrl);
      
      const urlParts = imagenUrl.split("/");
      const nombreArchivo = urlParts[urlParts.length - 1];
      
      const { error } = await supabase.storage
        .from("planes-imagenes")
        .remove([`planes/${nombreArchivo}`]);

      if (error) {
        console.log("❌ [eliminarImagen] Error:", error);
      } else {
        console.log("✅ [eliminarImagen] Imagen eliminada");
      }
    } catch (error) {
      console.log("❌ [eliminarImagen] Error completo:", error);
    }
  }

  // Seleccionar imagen de galería
  async seleccionarImagen(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        console.log("❌ Permisos denegados");
        return null;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!resultado.canceled) {
        console.log("✅ Imagen seleccionada:", resultado.assets[0].uri);
        return resultado.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.log("❌ Error al seleccionar imagen:", error);
      return null;
    }
  }

  // Tomar foto con cámara
  async tomarFoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        console.log("❌ Permisos de cámara denegados");
        return null;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!resultado.canceled) {
        console.log("✅ Foto tomada:", resultado.assets[0].uri);
        return resultado.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.log("❌ Error al tomar foto:", error);
      return null;
    }
  }
}