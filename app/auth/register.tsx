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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

export default function RegisterScreen() {
  const router = useRouter();
  const { registrar } = useAuth();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const validarFormulario = () => {
    if (!nombreCompleto.trim()) {
      Alert.alert('Error', 'El nombre completo es obligatorio');
      return false;
    }

    if (nombreCompleto.trim().length < 3) {
      Alert.alert('Error', 'El nombre debe tener al menos 3 caracteres');
      return false;
    }

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

    if (password !== confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validarFormulario()) return;

    setCargando(true);
    const resultado = await registrar(
      email.trim(),
      password,
      nombreCompleto.trim()
    );
    setCargando(false);

    if (resultado.success) {
      if (resultado.needsEmailConfirmation) {
        Alert.alert(
          '¡Registro Exitoso!',
          'Te hemos enviado un correo de confirmación. Por favor, verifica tu email antes de iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );
      } else {
        Alert.alert(
          '¡Bienvenido!',
          'Tu cuenta ha sido creada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => {
                // La navegación se manejará automáticamente
              },
            },
          ]
        );
      }
    } else {
      Alert.alert(
        'Error en el registro',
        resultado.error || 'No se pudo crear la cuenta'
      );
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
          <Text style={styles.titulo}>Crear Cuenta</Text>
          <Text style={styles.subtitulo}>Únete a Tigo Conecta</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          <View style={styles.campo}>
            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Juan Pérez"
              value={nombreCompleto}
              onChangeText={setNombreCompleto}
              autoCapitalize="words"
              editable={!cargando}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Email *</Text>
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
            <Text style={styles.label}>Contraseña *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[globalStyles.input, styles.passwordInput]}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
                editable={!cargando}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setMostrarPassword(!mostrarPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {mostrarPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Confirmar Contraseña *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[globalStyles.input, styles.passwordInput]}
                placeholder="Repite tu contraseña"
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                secureTextEntry={!mostrarConfirmar}
                autoCapitalize="none"
                editable={!cargando}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
              >
                <Text style={styles.passwordToggleText}>
                  {mostrarConfirmar ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.requisitos}>
            <Text style={styles.requisitosTitle}>Requisitos de contraseña:</Text>
            <Text style={styles.requisitoItem}>• Mínimo 6 caracteres</Text>
          </View>

          <TouchableOpacity
            style={[
              globalStyles.button,
              globalStyles.buttonPrimary,
              styles.botonRegistro,
              cargando && globalStyles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={cargando}
          >
            <Text style={globalStyles.buttonText}>
              {cargando ? 'Creando cuenta...' : 'Registrarse'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginTexto}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            disabled={cargando}
          >
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Términos y condiciones */}
        <View style={styles.terminosContainer}>
          <Text style={styles.terminosTexto}>
            Al registrarte, aceptas nuestros{' '}
            <Text style={styles.terminosLink}>Términos de Servicio</Text>
            {' '}y{' '}
            <Text style={styles.terminosLink}>Política de Privacidad</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 56,
  },
  titulo: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitulo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  formulario: {
    marginBottom: spacing.lg,
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
  requisitos: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  requisitosTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  requisitoItem: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  botonRegistro: {
    marginTop: spacing.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  loginTexto: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: 'bold',
  },
  terminosContainer: {
    paddingHorizontal: spacing.md,
  },
  terminosTexto: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  terminosLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});