import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { colors } from '@/src/styles/theme';

export default function Index() {
  const router = useRouter();
  const { perfil, cargando } = useAuth();

  useEffect(() => {
    if (!cargando) {
      if (!perfil) {
        // Usuario no autenticado -> Login
        router.replace('/auth/login');
      } else if (perfil.rol === 'asesor_comercial') {
        // Asesor -> Dashboard de planes
        router.replace('/(asesor)/dashboard');
      } else if (perfil.rol === 'usuario_registrado') {
        // Usuario -> Catálogo
        router.replace('/(usuario)/catalogo');
      }
    }
  }, [perfil, cargando]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});