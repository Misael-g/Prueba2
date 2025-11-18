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

  // Registrar token y guardar en Supabase
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      // Verificar si es dispositivo físico
      if (!Device.isDevice) {
        console.log('⚠️ Las notificaciones push solo funcionan en dispositivos físicos');
        return null;
      }

      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permisos de notificación denegados');
        return null;
      }

      // Obtener token de Expo
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.log('⚠️ No se encontró projectId en app.json');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      this.expoPushToken = tokenData.data;

      console.log('✅ Push token obtenido:', this.expoPushToken);

      // Configuración de canal en Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Tigo Conecta',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0066CC',
        });
      }

      // Guardar token en perfil del usuario
      await this.saveTokenToProfile(this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Error al registrar notificaciones:', error);
      return null;
    }
  }

  // Guardar token en Supabase
  private static async saveTokenToProfile(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('perfiles')
        .update({ push_token: token })
        .eq('id', user.id);

      if (error) {
        console.log('⚠️ Error al guardar token:', error);
      } else {
        console.log('✅ Token guardado en perfil');
      }
    } catch (error) {
      console.error('❌ Error al guardar token:', error);
    }
  }

  // Enviar notificación local (para testing)
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
        trigger: null, // Enviar inmediatamente
      });

      console.log('✅ Notificación local enviada:', title);
    } catch (error) {
      console.error('❌ Error al enviar notificación local:', error);
    }
  }

  // Enviar notificación push a un usuario específico
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      // 🆕 En Expo Go, usar notificaciones locales
      if (!Device.isDevice || __DEV__) {
        console.log('📱 Expo Go detectado - usando notificación local');
        await this.sendLocalNotification(title, body, data);
        return;
      }

      // Obtener token del usuario
      const { data: perfil, error } = await supabase
        .from('perfiles')
        .select('push_token')
        .eq('id', userId)
        .single();

      if (error || !perfil?.push_token) {
        console.log('⚠️ Usuario no tiene token de push - enviando local');
        await this.sendLocalNotification(title, body, data);
        return;
      }

      const message = {
        to: perfil.push_token,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('✅ Push notification enviada:', result);
    } catch (error) {
      console.error('❌ Error al enviar push notification:', error);
      // Fallback a notificación local
      await this.sendLocalNotification(title, body, data);
    }
  }

  // Configurar listeners de notificaciones
  static setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationTapped: (response: Notifications.NotificationResponse) => void
  ) {
    // Escuchar notificaciones recibidas
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

    // Escuchar cuando el usuario toca una notificación
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
}