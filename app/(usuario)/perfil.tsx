import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

export default function PerfilUsuarioScreen() {
  const router = useRouter();
  const { perfil, cerrarSesion, actualizarPerfil, recuperarContrasena } = useAuth();
  
  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState(perfil?.nombre_completo || '');
  const [telefono, setTelefono] = useState(perfil?.telefono || '');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (!nombreCompleto.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    setGuardando(true);
    const resultado = await actualizarPerfil({
      nombre_completo: nombreCompleto.trim(),
      telefono: telefono.trim() || null,
    });
    setGuardando(false);

    if (resultado.success) {
      setModoEdicion(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } else {
      Alert.alert('Error', resultado.error || 'No se pudo actualizar el perfil');
    }
  };

  const handleCancelar = () => {
    setNombreCompleto(perfil?.nombre_completo || '');
    setTelefono(perfil?.telefono || '');
    setModoEdicion(false);
  };

  const handleRecuperarContrasena = async () => {
    if (!perfil?.email) return;

    Alert.alert(
      'Restablecer Contraseña',
      `Se enviará un correo a ${perfil.email} con instrucciones para restablecer tu contraseña`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            const resultado = await recuperarContrasena(perfil.email);
            if (resultado.success) {
              Alert.alert(
                'Correo Enviado',
                'Revisa tu bandeja de entrada para restablecer tu contraseña'
              );
            } else {
              Alert.alert('Error', resultado.error || 'No se pudo enviar el correo');
            }
          },
        },
      ]
    );
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await cerrarSesion();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  if (!perfil) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {perfil.nombre_completo?.charAt(0).toUpperCase() || perfil.email.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.rolBadge}>
            <Text style={styles.rolTexto}>👤 USUARIO</Text>
          </View>
        </View>

        {/* Información del perfil */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitulo}>Información Personal</Text>
            {!modoEdicion && (
              <TouchableOpacity
                style={styles.botonEditar}
                onPress={() => setModoEdicion(true)}
              >
                <Text style={styles.botonEditarTexto}>✏️ Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Nombre Completo</Text>
            {modoEdicion ? (
              <TextInput
                style={styles.input}
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
                placeholder="Tu nombre completo"
                editable={!guardando}
              />
            ) : (
              <Text style={styles.campoValor}>{perfil.nombre_completo || 'No especificado'}</Text>
            )}
          </View>

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Email</Text>
            <Text style={styles.campoValor}>{perfil.email}</Text>
          </View>

          <View style={styles.campo}>
            <Text style={styles.campoLabel}>Teléfono</Text>
            {modoEdicion ? (
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="0999999999"
                keyboardType="phone-pad"
                editable={!guardando}
              />
            ) : (
              <Text style={styles.campoValor}>{perfil.telefono || 'No especificado'}</Text>
            )}
          </View>

          {modoEdicion && (
            <View style={styles.botonesEdicion}>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonOutline, styles.boton]}
                onPress={handleCancelar}
                disabled={guardando}
              >
                <Text style={globalStyles.buttonTextOutline}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  globalStyles.button,
                  globalStyles.buttonPrimary,
                  styles.boton,
                  guardando && globalStyles.buttonDisabled,
                ]}
                onPress={handleGuardar}
                disabled={guardando}
              >
                <Text style={globalStyles.buttonText}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Estadísticas */}
        <View style={styles.estadisticas}>
          <Text style={styles.seccionTitulo}>Estadísticas</Text>
          <View style={styles.estadisticasGrid}>
            <View style={styles.estadistica}>
              <Text style={styles.estadisticaValor}>
                {new Date(perfil.created_at).toLocaleDateString('es-EC', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.estadisticaLabel}>Miembro desde</Text>
            </View>
            <View style={styles.estadistica}>
              <Text style={styles.estadisticaValor}>🎯</Text>
              <Text style={styles.estadisticaLabel}>Usuario Activo</Text>
            </View>
          </View>
        </View>

        {/* Opciones de seguridad */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Seguridad</Text>
          
          <TouchableOpacity
            style={styles.opcion}
            onPress={handleRecuperarContrasena}
          >
            <View style={styles.opcionIcono}>
              <Text style={styles.opcionIconoTexto}>🔒</Text>
            </View>
            <View style={styles.opcionTextos}>
              <Text style={styles.opcionTitulo}>Cambiar Contraseña</Text>
              <Text style={styles.opcionDescripcion}>
                Actualiza tu contraseña de acceso
              </Text>
            </View>
            <Text style={styles.opcionFlecha}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Soporte */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Soporte</Text>
          
          <View style={styles.opcion}>
            <View style={styles.opcionIcono}>
              <Text style={styles.opcionIconoTexto}>📧</Text>
            </View>
            <View style={styles.opcionTextos}>
              <Text style={styles.opcionTitulo}>Contacto</Text>
              <Text style={styles.opcionDescripcion}>soporte@tigo.com.ec</Text>
            </View>
          </View>

          <View style={styles.opcion}>
            <View style={styles.opcionIcono}>
              <Text style={styles.opcionIconoTexto}>📞</Text>
            </View>
            <View style={styles.opcionTextos}>
              <Text style={styles.opcionTitulo}>Teléfono</Text>
              <Text style={styles.opcionDescripcion}>1-800-TIGO-123</Text>
            </View>
          </View>
        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonDanger, styles.botonCerrarSesion]}
          onPress={handleCerrarSesion}
        >
          <Text style={globalStyles.buttonText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Versión */}
        <Text style={styles.version}>Tigo Conecta v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
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
  avatarTexto: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  rolBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  rolTexto: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitulo: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  botonEditar: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  botonEditarTexto: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  campo: {
    marginBottom: spacing.md,
  },
  campoLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  campoValor: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  botonesEdicion: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  boton: {
    flex: 1,
  },
  seccionTitulo: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  estadisticas: {
    marginBottom: spacing.md,
  },
  estadisticasGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  estadistica: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  estadisticaValor: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  estadisticaLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  opcionIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  opcionIconoTexto: {
    fontSize: 20,
  },
  opcionTextos: {
    flex: 1,
  },
  opcionTitulo: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  opcionDescripcion: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  opcionFlecha: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  botonCerrarSesion: {
    marginTop: spacing.md,
  },
  version: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
});