import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../data/services/supabaseClient';

// ⚙️ Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static localUserId: string | null = null;
  private static isRegistered: boolean = false;

  // ✅ Registrar usuario para notificaciones (SIN FCM)
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      console.log('🔵 [INICIO] registerForPushNotifications (Local Only)');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ No hay usuario autenticado');
        return null;
      }

      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('🔐 Solicitando permisos...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permisos denegados');
        return null;
      }

      console.log('✅ Permisos otorgados');

      // Configurar canal Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Tigo Conecta - Mensajes',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0066CC',
          sound: 'default',
        });
        console.log('✅ Canal Android configurado');
      }

      // Guardar userId
      this.localUserId = user.id;
      this.isRegistered = true;

      // Guardar en Supabase
      await this.saveNotificationPreferences(user.id, true);

      console.log('✅ Usuario registrado para notificaciones locales');
      return `LOCAL_${user.id}`;
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      return null;
    }
  }

  // 💾 Guardar preferencias en Supabase
  private static async saveNotificationPreferences(userId: string, enabled: boolean) {
    try {
      const deviceName = Device.deviceName || `${Device.brand} ${Device.modelName}`;

      await supabase
        .from('user_devices')
        .upsert(
          {
            user_id: userId,
            push_token: `LOCAL_${userId}`,
            device_name: deviceName,
            last_active: new Date().toISOString(),
          },
          { onConflict: 'user_id,push_token' }
        );

      console.log('💾 Preferencias guardadas');
    } catch (error) {
      console.error('⚠️ Error al guardar preferencias:', error);
    }
  }

  // 📱 Enviar notificación LOCAL inmediata
  static async sendLocalNotification(title: string, body: string, data?: any) {
    try {
      if (!this.isRegistered) {
        console.log('⚠️ Usuario no registrado para notificaciones');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Inmediato
      });

      console.log('✅ Notificación local mostrada:', title);
    } catch (error) {
      console.error('❌ Error al mostrar notificación:', error);
    }
  }

  // 🔔 Sistema de "Push" INSTANTÁNEO mediante Supabase Realtime + Notificaciones Locales
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('⚠️ No hay usuario autenticado');
        return;
      }

      if (user.id === userId) {
        console.log('❌ No enviar notificación a sí mismo');
        return;
      }

      console.log(`📤 Guardando notificación para: ${userId}`);

      // ✅ ESTRATEGIA MEJORADA: Guardar en tabla Y usar Broadcast Channel
      const notificationData = {
        user_id: userId,
        title,
        body,
        data: data || {},
        read: false,
        created_at: new Date().toISOString(),
      };

      // 1️⃣ Guardar en base de datos (backup)
      const { error } = await supabase
        .from('pending_notifications')
        .insert(notificationData);

      if (error) {
        console.error('❌ Error al guardar notificación:', error);
        return;
      }

      console.log('✅ Notificación guardada en BD');

      // 2️⃣ ENVIAR POR BROADCAST CHANNEL (INSTANTÁNEO)
      try {
        const channel = supabase.channel(`instant-notifications`);
        
        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Enviar broadcast INSTANTÁNEO
            await channel.send({
              type: 'broadcast',
              event: 'instant_notification',
              payload: {
                recipient_id: userId,
                title,
                body,
                data: data || {},
                timestamp: Date.now(),
              },
            });

            console.log('⚡ Broadcast enviado INSTANTÁNEAMENTE');
            
            // Limpiar canal
            setTimeout(() => {
              supabase.removeChannel(channel);
            }, 1000);
          }
        });
      } catch (broadcastError) {
        console.log('⚠️ Error en broadcast (no crítico):', broadcastError);
      }

      console.log('✅ Notificación enviada por ambos canales');
    } catch (error) {
      console.error('❌ Error completo:', error);
    }
  }

  // 🔄 Suscribirse a notificaciones INSTANTÁNEAS (Broadcast + Realtime)
  static subscribeToNotifications(callback: (notification: any) => void) {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    };

    getUserId().then((userId) => {
      if (!userId) {
        console.log('⚠️ No hay usuario para suscribir');
        return;
      }

      console.log('🔄 Suscribiendo a notificaciones INSTANTÁNEAS...');

      // 1️⃣ BROADCAST CHANNEL (INSTANTÁNEO - 0ms delay)
      const instantChannel = supabase
        .channel(`instant-notifications`)
        .on('broadcast', { event: 'instant_notification' }, async (payload) => {
          console.log('⚡ Broadcast recibido:', payload);

          // Solo procesar si es para este usuario
          if (payload.payload.recipient_id !== userId) {
            console.log('⏩ Broadcast no es para este usuario');
            return;
          }

          console.log('🎯 Broadcast ES PARA ESTE USUARIO!');

          const { title, body, data } = payload.payload;

          // Mostrar notificación LOCAL INMEDIATAMENTE
          await this.sendLocalNotification(title, body, data);

          // Callback
          callback({ title, body, data });
        })
        .subscribe((status) => {
          console.log('📡 Broadcast channel status:', status);
        });

      // 2️⃣ REALTIME (Backup - para mensajes perdidos)
      const realtimeChannel = supabase
        .channel(`notifications-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'pending_notifications',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            console.log('🔔 Realtime recibido (backup):', payload.new);

            const notification = payload.new;

            // Solo mostrar si no fue mostrada ya por broadcast
            // (el broadcast es instantáneo, esto es backup)
            setTimeout(async () => {
              // Verificar si ya fue leída (broadcast la marcó)
              const { data: check } = await supabase
                .from('pending_notifications')
                .select('read')
                .eq('id', notification.id)
                .single();

              if (check && !check.read) {
                console.log('📬 Mostrando notificación de backup');
                await this.sendLocalNotification(
                  notification.title,
                  notification.body,
                  notification.data
                );

                // Marcar como leída
                await supabase
                  .from('pending_notifications')
                  .update({ read: true })
                  .eq('id', notification.id);

                callback(notification);
              } else {
                console.log('✅ Ya fue procesada por broadcast');
              }
            }, 500); // Esperar 500ms para ver si el broadcast la procesó
          }
        )
        .subscribe((status) => {
          console.log('📡 Realtime status:', status);
        });

      // Retornar función de cleanup
      return () => {
        console.log('🔴 Desuscribiendo notificaciones');
        supabase.removeChannel(instantChannel);
        supabase.removeChannel(realtimeChannel);
      };
    });

    // Retorno temporal mientras se obtiene el userId
    return () => {};
  }

  // 🔄 Cargar notificaciones pendientes al abrir app
  static async loadPendingNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('📥 Cargando notificaciones pendientes...');

      const { data: notifications, error } = await supabase
        .from('pending_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !notifications || notifications.length === 0) {
        console.log('✅ No hay notificaciones pendientes');
        return;
      }

      console.log(`📬 ${notifications.length} notificaciones pendientes`);

      // Mostrar cada una
      for (const notif of notifications) {
        await this.sendLocalNotification(notif.title, notif.body, notif.data);

        // Marcar como leída
        await supabase
          .from('pending_notifications')
          .update({ read: true })
          .eq('id', notif.id);

        // Esperar 500ms entre notificaciones
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('✅ Notificaciones pendientes mostradas');
    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
    }
  }

  // 🔔 Configurar listeners
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

  // 🧹 Limpiar al cerrar sesión
  static async clearTokenOnLogout() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🧹 Limpiando configuración de notificaciones...');

      await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', user.id)
        .eq('push_token', `LOCAL_${user.id}`);

      this.localUserId = null;
      this.isRegistered = false;

      console.log('✅ Configuración limpiada');
    } catch (error) {
      console.error('❌ Error al limpiar:', error);
    }
  }

  // 🏷️ Badge count
  static async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  // 🚫 Cancelar todas
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}