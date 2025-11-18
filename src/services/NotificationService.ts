import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../data/services/supabaseClient';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static expoPushToken: string | null = null;

  // ✅ Registrar token y guardarlo en la tabla user_devices
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      console.log('🔵 [INICIO] registerForPushNotifications');
      
      console.log('📱 Tipo de dispositivo:', {
        isDevice: Device.isDevice,
        brand: Device.brand,
        modelName: Device.modelName,
        osName: Device.osName,
        osVersion: Device.osVersion,
      });

      if (Device.isDevice) {
        console.log('✅ Es dispositivo físico');
      } else {
        console.log('⚠️ Es emulador - El token se generará pero las notificaciones pueden no funcionar');
      }

      // Solicitar permisos
      console.log('🔐 Verificando permisos de notificación...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('📋 Estado de permisos actual:', existingStatus);
      
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('⚠️ Permisos no otorgados, solicitando...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('📋 Nuevo estado de permisos:', status);
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permisos de notificación denegados');
        return null;
      }

      console.log('✅ Permisos otorgados, obteniendo token...');

      // Obtener token de Expo
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      console.log('🔍 ProjectId encontrado:', projectId);
      
      if (!projectId) {
        console.log('❌ No se encontró projectId en app.json');
        return null;
      }

      console.log('🚀 Solicitando token a Expo Push Service...');
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      this.expoPushToken = tokenData.data;

      console.log('✅ Push token obtenido:', this.expoPushToken);

      // Configuración de canal en Android
      if (Platform.OS === 'android') {
        console.log('🤖 Configurando canal de Android...');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Tigo Conecta',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0066CC',
        });
        console.log('✅ Canal de Android configurado');
      }

      // 🆕 GUARDAR TOKEN EN LA TABLA user_devices
      console.log('💾 Guardando token en user_devices...');
      await this.saveTokenToDevicesTable(this.expoPushToken);

      console.log('🎉 [FIN] registerForPushNotifications completado exitosamente');
      return this.expoPushToken;
    } catch (error: any) {
      console.error('❌❌ Error COMPLETO al registrar notificaciones:');
      console.error('   Nombre:', error.name);
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
      return null;
    }
  }

  // 🆕 Guardar token en la tabla user_devices (permite múltiples dispositivos)
  private static async saveTokenToDevicesTable(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ No hay usuario para guardar token');
        return;
      }

      console.log(`💾 Guardando/actualizando token para: ${user.email}`);

      // Obtener nombre del dispositivo
      const deviceName = Device.deviceName || 
                        `${Device.brand || 'Desconocido'} ${Device.modelName || 'Dispositivo'}`;

      // 🔥 INSERTAR O ACTUALIZAR el token del dispositivo
      const { error: upsertError } = await supabase
        .from('user_devices')
        .upsert(
          {
            user_id: user.id,
            push_token: token,
            device_name: deviceName,
            last_active: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,push_token', // Si existe (user_id + token), actualiza
            ignoreDuplicates: false,
          }
        );

      if (upsertError) {
        console.log('⚠️ Error al guardar token:', upsertError);
      } else {
        console.log('✅ Token guardado/actualizado en user_devices');
      }
    } catch (error) {
      console.error('❌ Error al guardar token:', error);
    }
  }

  // Enviar notificación local (SOLO para el dispositivo actual)
  static async sendLocalNotification(
    title: string,
    body: string,
    data?: any
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null,
      });

      console.log('✅ Notificación local enviada:', title);
    } catch (error) {
      console.error('❌ Error al enviar notificación local:', error);
    }
  }

  // ✅✅ Enviar notificación push a TODOS los dispositivos de un usuario
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      // ✅ Verificar que NO sea el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('⚠️ No hay usuario autenticado');
        return;
      }

      if (user.id === userId) {
        console.log('❌ BLOQUEADO: Intento de enviar notificación a sí mismo');
        return;
      }

      console.log(`📤 [sendPushNotification] Enviando a todos los dispositivos de userId: ${userId}`);

      // 🆕 OBTENER TODOS LOS TOKENS DEL USUARIO RECEPTOR
      const { data: devices, error } = await supabase
        .from('user_devices')
        .select('push_token, device_name')
        .eq('user_id', userId);

      if (error) {
        console.log('❌ Error al obtener dispositivos:', error);
        return;
      }

      if (!devices || devices.length === 0) {
        console.log('⚠️ Usuario receptor no tiene dispositivos registrados');
        return;
      }

      console.log(`📋 Se encontraron ${devices.length} dispositivo(s):`);
      devices.forEach((device, i) => {
        console.log(`   ${i + 1}. ${device.device_name} - Token: ${device.push_token.substring(0, 20)}...`);
      });

      // 🚀 Enviar notificación a TODOS los dispositivos
      const messages = devices.map(device => ({
        to: device.push_token,
        sound: 'default',
        title,
        body,
        data: data || {},
        priority: 'high',
        channelId: 'default',
      }));

      console.log('📡 Enviando a Expo Push Service...');

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      
      console.log('✅ Respuesta de Expo:', result);

      if (result.data) {
        result.data.forEach((res: any, index: number) => {
          if (res.status === 'ok') {
            console.log(`✅ Notificación ${index + 1} enviada exitosamente`);
          } else {
            console.log(`❌ Error en notificación ${index + 1}:`, res.message);
          }
        });
      }

    } catch (error) {
      console.error('❌ Error en sendPushNotification:', error);
    }
  }

  // Configurar listeners de notificaciones
  static setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationTapped: (response: Notifications.NotificationResponse) => void
  ) {
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      onNotificationTapped
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }

  // Limpiar badge en iOS
  static async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  // Cancelar todas las notificaciones programadas
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // 🆕 Limpiar SOLO el token del dispositivo actual al hacer logout
  static async clearTokenOnLogout() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ No hay usuario para limpiar token');
        return;
      }

      if (!this.expoPushToken) {
        console.log('⚠️ No hay token local para limpiar');
        return;
      }

      console.log(`🧹 Limpiando token del dispositivo actual...`);

      // 🔥 ELIMINAR SOLO EL TOKEN DEL DISPOSITIVO ACTUAL
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', user.id)
        .eq('push_token', this.expoPushToken);

      if (error) {
        console.log('⚠️ Error al limpiar token:', error);
      } else {
        console.log('✅ Token del dispositivo actual eliminado');
      }

      // Limpiar la variable local
      this.expoPushToken = null;

    } catch (error) {
      console.error('❌ Error al limpiar token:', error);
    }
  }

  // 🆕 Limpiar dispositivos inactivos (opcional, para mantenimiento)
  static async cleanupInactiveDevices(daysInactive: number = 30) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', user.id)
        .lt('last_active', cutoffDate.toISOString());

      if (error) {
        console.log('⚠️ Error al limpiar dispositivos inactivos:', error);
      } else {
        console.log('✅ Dispositivos inactivos limpiados');
      }
    } catch (error) {
      console.error('❌ Error al limpiar dispositivos:', error);
    }
  }
}