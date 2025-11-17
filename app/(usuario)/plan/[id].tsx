import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePlanes } from '@/src/presentation/hooks/usePlanes';
import { useContrataciones } from '@/src/presentation/hooks/useContrataciones';
import { PlanMovil } from '@/src/domain/models/PlanMovil';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

export default function PlanDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { obtenerPlanPorId } = usePlanes();
  const { crear } = useContrataciones();
  const [plan, setPlan] = useState<PlanMovil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [contratando, setContratando] = useState(false);

  useEffect(() => {
    cargarPlan();
  }, [id]);

  const cargarPlan = async () => {
    if (!id || typeof id !== 'string') return;
    
    setCargando(true);
    const planObtenido = await obtenerPlanPorId(id);
    setPlan(planObtenido);
    setCargando(false);
  };

  const handleContratar = async () => {
    if (!plan) return;

    Alert.alert(
      'Confirmar Contratación',
      `¿Deseas contratar el plan ${plan.nombre} por $${plan.precio.toFixed(2)}/mes?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Contratar',
          onPress: async () => {
            setContratando(true);
            const resultado = await crear(plan.id);
            setContratando(false);

            if (resultado.success) {
              Alert.alert(
                '¡Contratación exitosa!',
                'Un asesor se pondrá en contacto contigo pronto',
                [
                  {
                    text: 'Ver Mis Contratos',
                    onPress: () => router.push('/(usuario)/contrataciones'),
                  },
                ]
              );
            } else {
              Alert.alert('Error', resultado.error || 'No se pudo realizar la contratación');
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={styles.loadingIcon}>⏳</Text>
        <Text style={styles.loadingText}>Cargando plan...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.errorTitle}>Plan no encontrado</Text>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen */}
        {plan.imagen_url ? (
          <Image source={{ uri: plan.imagen_url }} style={styles.imagen} />
        ) : (
          <View style={[styles.imagen, styles.imagenPlaceholder]}>
            <Text style={styles.placeholderIcon}>📱</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.nombre}>{plan.nombre}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>DISPONIBLE</Text>
            </View>
          </View>

          {/* Precio */}
          <View style={styles.precioCard}>
            <Text style={styles.precio}>${plan.precio.toFixed(2)}</Text>
            <Text style={styles.precioTexto}>/mes</Text>
          </View>

          {/* Características detalladas */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>📊 Características</Text>
            
            <View style={styles.caracteristica}>
              <Text style={styles.caracteristicaTitulo}>Datos Móviles</Text>
              <Text style={styles.caracteristicaValor}>{plan.datos_gb}</Text>
            </View>

            <View style={styles.caracteristica}>
              <Text style={styles.caracteristicaTitulo}>Minutos de Voz</Text>
              <Text style={styles.caracteristicaValor}>{plan.minutos}</Text>
            </View>

            <View style={styles.caracteristica}>
              <Text style={styles.caracteristicaTitulo}>SMS</Text>
              <Text style={styles.caracteristicaValor}>{plan.sms}</Text>
            </View>

            {plan.velocidad_4g && (
              <View style={styles.caracteristica}>
                <Text style={styles.caracteristicaTitulo}>Velocidad 4G</Text>
                <Text style={styles.caracteristicaValor}>{plan.velocidad_4g}</Text>
              </View>
            )}

            {plan.velocidad_5g && (
              <View style={styles.caracteristica}>
                <Text style={styles.caracteristicaTitulo}>Velocidad 5G</Text>
                <Text style={styles.caracteristicaValor}>{plan.velocidad_5g}</Text>
              </View>
            )}
          </View>

          {/* Beneficios adicionales */}
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>✨ Beneficios</Text>

            {plan.redes_sociales && (
              <View style={styles.beneficio}>
                <Text style={styles.beneficioIcono}>📱</Text>
                <View style={styles.beneficioTextos}>
                  <Text style={styles.beneficioTitulo}>Redes Sociales</Text>
                  <Text style={styles.beneficioDescripcion}>{plan.redes_sociales}</Text>
                </View>
              </View>
            )}

            {plan.whatsapp_incluido && (
              <View style={styles.beneficio}>
                <Text style={styles.beneficioIcono}>💬</Text>
                <View style={styles.beneficioTextos}>
                  <Text style={styles.beneficioTitulo}>WhatsApp Incluido</Text>
                  <Text style={styles.beneficioDescripcion}>Mensajería ilimitada</Text>
                </View>
              </View>
            )}

            {plan.llamadas_internacionales && (
              <View style={styles.beneficio}>
                <Text style={styles.beneficioIcono}>🌎</Text>
                <View style={styles.beneficioTextos}>
                  <Text style={styles.beneficioTitulo}>Llamadas Internacionales</Text>
                  <Text style={styles.beneficioDescripcion}>{plan.llamadas_internacionales}</Text>
                </View>
              </View>
            )}

            {plan.roaming && (
              <View style={styles.beneficio}>
                <Text style={styles.beneficioIcono}>✈️</Text>
                <View style={styles.beneficioTextos}>
                  <Text style={styles.beneficioTitulo}>Roaming</Text>
                  <Text style={styles.beneficioDescripcion}>{plan.roaming}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botón flotante de contratación */}
      <View style={styles.botonContainer}>
        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            styles.botonContratar,
            contratando && globalStyles.buttonDisabled,
          ]}
          onPress={handleContratar}
          disabled={contratando}
        >
          <Text style={globalStyles.buttonText}>
            {contratando ? 'Contratando...' : `Contratar por $${plan.precio.toFixed(2)}/mes`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imagen: {
    width: '100%',
    height: 250,
    backgroundColor: colors.borderLight,
  },
  imagenPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  nombre: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
  precioCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  precio: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  precioTexto: {
    fontSize: fontSize.lg,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  seccion: {
    marginBottom: spacing.lg,
  },
  seccionTitulo: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  caracteristica: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  caracteristicaTitulo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  caracteristicaValor: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  beneficio: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  beneficioIcono: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  beneficioTextos: {
    flex: 1,
  },
  beneficioTitulo: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  beneficioDescripcion: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  botonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  botonContratar: {
    marginBottom: 0,
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
});