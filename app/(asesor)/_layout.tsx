import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { colors } from '@/src/styles/theme';

export default function AsesorLayout() {
  const router = useRouter();
  const { perfil, cargando } = useAuth();

  useEffect(() => {
    if (!cargando) {
      if (!perfil) {
        router.replace('/auth/login');
      } else if (perfil.rol === 'usuario_registrado') {
        router.replace('/(usuario)/catalogo');
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
        name="dashboard"
        options={{
          title: 'Planes',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📱</Text>,
          headerTitle: 'Gestión de Planes',
        }}
      />
      <Tabs.Screen
        name="contrataciones"
        options={{
          title: 'Contratos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
          headerTitle: 'Contrataciones',
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💬</Text>,
          headerTitle: 'Chats con Clientes',
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
        name="plan/crear"
        options={{
          href: null,
          headerTitle: 'Crear Plan',
        }}
      />
      <Tabs.Screen
        name="plan/editar/[id]"
        options={{
          href: null,
          headerTitle: 'Editar Plan',
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
          headerTitle: 'Chat con Cliente',
        }}
      />
    </Tabs>
  );
}