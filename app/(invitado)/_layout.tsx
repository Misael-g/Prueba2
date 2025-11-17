import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '@/src/styles/theme';

export default function InvitadoLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.loginButtonText}>🔑 Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Stack.Screen
        name="catalogo"
        options={{
          title: 'Catálogo de Planes',
          headerLeft: () => (
            <View style={styles.guestBadge}>
              <Text style={styles.guestBadgeText}>👤 Invitado</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="plan/[id]"
        options={{
          title: 'Detalle del Plan',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  loginButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  loginButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  guestBadge: {
    backgroundColor: colors.white + '40',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  guestBadgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '600',
  },
});