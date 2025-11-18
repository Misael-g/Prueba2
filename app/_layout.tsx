import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { colors } from '@/src/styles/theme';

export default function RootLayout() {
  const { cargando } = useAuth();
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Configurar listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificación recibida:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuario tocó notificación:', response);
      
      // Navegar según el tipo de notificación
      const data = response.notification.request.content.data;
      
      if (data.type === 'nuevo_mensaje') {
        router.push(`/(usuario)/chat/${data.contratacion_id}`);
      } else if (data.type === 'contratacion_aprobada') {
        router.push('/(usuario)/contrataciones');
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="(invitado)" />
        <Stack.Screen name="(usuario)" />
        <Stack.Screen name="(asesor)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}