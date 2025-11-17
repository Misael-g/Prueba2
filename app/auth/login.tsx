import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

export default function LoginScreen() {
  const router = useRouter();
  const { iniciarSesion } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const validarFormulario = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'El email es obligatorio');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Ingresa un email válido');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'La contraseña es obligatoria');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validarFormulario()) return;

    console.log("🔵 Botón de login presionado");
    setCargando(true);

    try {
      const resultado = await iniciarSesion(email.trim(), password);
      
      console.log("📊 Resultado del login:", resultado);

      if (resultado.success) {
        console.log("✅ Login exitoso, esperando navegación automática...");
        // La navegación se manejará automáticamente por useAuth
        // NO llamamos a setCargando(false) aquí para que siga mostrando el loading
        // hasta que se complete la navegación
      } else {
        setCargando(false);
        Alert.alert(
          'Error de inicio de sesión',
          resultado.error || 'Credenciales incorrectas'
        );
      }
    } catch (error: any) {
      setCargando(false);
      console.log("❌ Error inesperado en login:", error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo y título */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>📱</Text>
          </View>
          <Text style={styles.titulo}>Tigo Conecta</Text>
          <Text style={styles.subtitulo}>Inicia sesión en tu cuenta</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          <View style={styles.campo}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!cargando}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[globalStyles.input, styles.passwordInput]}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
                editable={!cargando}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setMostrarPassword(!mostrarPassword)}
                disabled={cargando}
              >
                <Text style={styles.passwordToggleText}>
                  {mostrarPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/auth/forgot-password')}
            disabled={cargando}
          >
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              globalStyles.button,
              globalStyles.buttonPrimary,
              styles.botonLogin,
              cargando && globalStyles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={cargando}
          >
            {cargando ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={[globalStyles.buttonText, styles.loadingText]}>
                  Iniciando sesión...
                </Text>
              </View>
            ) : (
              <Text style={globalStyles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Registro */}
        <View style={styles.registroContainer}>
          <Text style={styles.registroTexto}>¿No tienes una cuenta?</Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/register')}
            disabled={cargando}
          >
            <Text style={styles.registroLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTexto}>
            💡 Tip: Si eres asesor comercial, usa tus credenciales de empleado
          </Text>
        </View>
      </ScrollView>

      {/* Overlay de carga */}
      {cargando && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.overlayText}>Autenticando...</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 64,
  },
  titulo: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitulo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  formulario: {
    marginBottom: spacing.xl,
  },
  campo: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing.xxl,
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    padding: spacing.xs,
  },
  passwordToggleText: {
    fontSize: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  botonLogin: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    marginLeft: spacing.sm,
  },
  registroContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  registroTexto: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  registroLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: spacing.xl,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  infoTexto: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 200,
  },
  overlayText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});