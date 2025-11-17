import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { colors } from '@/src/styles/theme';

export default function UsuarioLayout() {
  const router = useRouter();
  const { perfil, cargando } = useAuth();

  useEffect(() => {
    if (!cargando) {
      if (!perfil) {
        router.replace('/auth/login');
      } else if (perfil.rol === 'asesor_comercial') {
        router.replace('/(asesor)/dashboard');
      }
    }
  }, [perfil, cargando]);

  if (cargando || !perfil) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="catalogo"
        options={{
          title: 'Planes',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📱</Text>,
          headerTitle: 'Catálogo de Planes',
        }}
      />
      <Tabs.Screen
        name="contrataciones"
        options={{
          title: 'Mis Contratos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
          headerTitle: 'Mis Contrataciones',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
          headerTitle: 'Mi Perfil',
        }}
      />
      
      {/* Pantallas ocultas del tab bar */}
      <Tabs.Screen
        name="plan/[id]"
        options={{
          href: null,
          headerTitle: 'Detalle del Plan',
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
          headerTitle: 'Chat con Asesor',
        }}
      />
    </Tabs>
  );
}