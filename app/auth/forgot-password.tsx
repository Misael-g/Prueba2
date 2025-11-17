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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { recuperarContrasena } = useAuth();

  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

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

    return true;
  };

  const handleEnviar = async () => {
    if (!validarFormulario()) return;

    setCargando(true);
    const resultado = await recuperarContrasena(email.trim());
    setCargando(false);

    if (resultado.success) {
      setEnviado(true);
    } else {
      Alert.alert(
        'Error',
        resultado.error || 'No se pudo enviar el correo de recuperación'
      );
    }
  };

  const handleVolverAlLogin = () => {
    router.back();
  };

  if (enviado) {
    return (
      <View style={[globalStyles.container, styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>✅</Text>
            </View>

            <Text style={styles.successTitle}>
              ¡Correo Enviado!
            </Text>

            <Text style={styles.successText}>
              Hemos enviado las instrucciones para restablecer tu contraseña a:
            </Text>

            <View style={styles.emailBadge}>
              <Text style={styles.emailBadgeText}>{email}</Text>
            </View>

            <View style={styles.instrucciones}>
              <Text style={styles.instruccionesTitle}>Próximos pasos:</Text>
              <Text style={styles.instruccionItem}>
                1. Revisa tu bandeja de entrada
              </Text>
              <Text style={styles.instruccionItem}>
                2. Abre el correo de Tigo Conecta
              </Text>
              <Text style={styles.instruccionItem}>
                3. Haz clic en el enlace para restablecer tu contraseña
              </Text>
              <Text style={styles.instruccionItem}>
                4. Crea una nueva contraseña segura
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                💡 Si no ves el correo en unos minutos, revisa tu carpeta de spam
              </Text>
            </View>

            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonPrimary]}
              onPress={handleVolverAlLogin}
            >
              <Text style={globalStyles.buttonText}>Volver al Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reenviarButton}
              onPress={() => {
                setEnviado(false);
                setEmail('');
              }}
            >
              <Text style={styles.reenviarText}>
                ¿No recibiste el correo? Intenta de nuevo
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

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
        {/* Logo e ícono */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>🔒</Text>
          </View>
          <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitulo}>
            No te preocupes, te ayudaremos a recuperarla
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formulario}>
          <Text style={styles.descripcion}>
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
          </Text>

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

          <TouchableOpacity
            style={[
              globalStyles.button,
              globalStyles.buttonPrimary,
              styles.botonEnviar,
              cargando && globalStyles.buttonDisabled,
            ]}
            onPress={handleEnviar}
            disabled={cargando}
          >
            <Text style={globalStyles.buttonText}>
              {cargando ? 'Enviando...' : 'Enviar Instrucciones'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón volver */}
        <TouchableOpacity
          style={styles.volverContainer}
          onPress={handleVolverAlLogin}
          disabled={cargando}
        >
          <Text style={styles.volverIcono}>←</Text>
          <Text style={styles.volverTexto}>Volver al inicio de sesión</Text>
        </TouchableOpacity>

        {/* Ayuda adicional */}
        <View style={styles.ayudaContainer}>
          <Text style={styles.ayudaTitle}>¿Necesitas más ayuda?</Text>
          <Text style={styles.ayudaText}>
            Contacta a nuestro equipo de soporte:
          </Text>
          <View style={styles.contactoItem}>
            <Text style={styles.contactoIcono}>📧</Text>
            <Text style={styles.contactoTexto}>soporte@tigo.com.ec</Text>
          </View>
          <View style={styles.contactoItem}>
            <Text style={styles.contactoIcono}>📞</Text>
            <Text style={styles.contactoTexto}>1-800-TIGO-123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconEmoji: {
    fontSize: 56,
  },
  titulo: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formulario: {
    marginBottom: spacing.xl,
  },
  descripcion: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
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
  botonEnviar: {
    marginTop: spacing.sm,
  },
  volverContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  volverIcono: {
    fontSize: 20,
    color: colors.primary,
  },
  volverTexto: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  ayudaContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ayudaTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  ayudaText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  contactoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  contactoIcono: {
    fontSize: 18,
  },
  contactoTexto: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  // Estilos para pantalla de éxito
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successEmoji: {
    fontSize: 64,
  },
  successTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emailBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  emailBadgeText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  instrucciones: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instruccionesTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  instruccionItem: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  infoBoxText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  reenviarButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  reenviarText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});