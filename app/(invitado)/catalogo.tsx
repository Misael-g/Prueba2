import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePlanes } from '@/src/presentation/hooks/usePlanes';
import { PlanMovil } from '@/src/domain/models/PlanMovil';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

export default function CatalogoInvitadoScreen() {
  const router = useRouter();
  const { planes, cargando, cargarPlanes } = usePlanes();
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarPlanes();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarPlanes();
    setRefrescando(false);
  };

  const handleVerDetalle = (planId: string) => {
    router.push(`/(invitado)/plan/${planId}`);
  };

  const handleIntentarContratar = () => {
    Alert.alert(
      '🔒 Inicia sesión para continuar',
      'Para contratar un plan necesitas crear una cuenta o iniciar sesión',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Registrarme',
          onPress: () => router.push('/auth/register'),
        },
        {
          text: 'Iniciar Sesión',
          onPress: () => router.push('/auth/login'),
        },
      ]
    );
  };

  const renderPlan = ({ item }: { item: PlanMovil }) => (
    <View style={styles.card}>
      {/* Imagen del plan */}
      {item.imagen_url ? (
        <Image source={{ uri: item.imagen_url }} style={styles.imagen} />
      ) : (
        <View style={[styles.imagen, styles.imagenPlaceholder]}>
          <Text style={styles.placeholderIcon}>📱</Text>
        </View>
      )}

      {/* Contenido */}
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DISPONIBLE</Text>
          </View>
        </View>

        {/* Precio destacado */}
        <View style={styles.precioContainer}>
          <Text style={styles.precio}>${item.precio.toFixed(2)}</Text>
          <Text style={styles.precioTexto}>/mes</Text>
        </View>

        {/* Características principales */}
        <View style={styles.caracteristicas}>
          <View style={styles.caracteristica}>
            <Text style={styles.caracteristicaIcono}>📊</Text>
            <Text style={styles.caracteristicaTexto}>{item.datos_gb}</Text>
          </View>
          <View style={styles.caracteristica}>
            <Text style={styles.caracteristicaIcono}>📞</Text>
            <Text style={styles.caracteristicaTexto}>{item.minutos}</Text>
          </View>
          {item.whatsapp_incluido && (
            <View style={styles.caracteristica}>
              <Text style={styles.caracteristicaIcono}>💬</Text>
              <Text style={styles.caracteristicaTexto}>WhatsApp ilimitado</Text>
            </View>
          )}
        </View>

        {/* Botones */}
        <View style={styles.botones}>
          <TouchableOpacity
            style={[styles.boton, styles.botonDetalle]}
            onPress={() => handleVerDetalle(item.id)}
          >
            <Text style={styles.botonDetalleTexto}>Ver Detalles</Text>
          </TouchableOpacity>
        </View>

        {/* Banner informativo */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcono}>ℹ️</Text>
          <Text style={styles.infoBannerTexto}>
            Inicia sesión para contratar este plan
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Explora nuestros planes</Text>
          <Text style={styles.headerSubtitle}>
            {planes.length} {planes.length === 1 ? 'plan disponible' : 'planes disponibles'}
          </Text>
        </View>
      </View>

      {/* Banner promocional */}
      <View style={styles.promoBanner}>
        <Text style={styles.promoIcono}>🎁</Text>
        <View style={styles.promoTextos}>
          <Text style={styles.promoTitulo}>¡Regístrate y obtén beneficios!</Text>
          <Text style={styles.promoDescripcion}>
            Crea tu cuenta para contratar planes y chatear con asesores
          </Text>
        </View>
        <TouchableOpacity
          style={styles.promoBoton}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.promoBotonTexto}>Registrarme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>No hay planes disponibles</Text>
      <Text style={styles.emptyText}>
        Estamos trabajando en traerte las mejores ofertas
      </Text>
      <TouchableOpacity
        style={[globalStyles.button, globalStyles.buttonPrimary]}
        onPress={onRefresh}
      >
        <Text style={globalStyles.buttonText}>Recargar</Text>
      </TouchableOpacity>
    </View>
  );

  if (cargando && planes.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={styles.loadingIcon}>⏳</Text>
        <Text style={styles.loadingText}>Cargando planes...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={planes}
        renderItem={renderPlan}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  promoBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  promoIcono: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  promoTextos: {
    flex: 1,
  },
  promoTitulo: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  promoDescripcion: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  promoBoton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  promoBotonTexto: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imagen: {
    width: '100%',
    height: 180,
    backgroundColor: colors.borderLight,
  },
  imagenPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nombre: {
    fontSize: fontSize.xl,
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
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  precio: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  precioTexto: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  caracteristicas: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  caracteristica: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caracteristicaIcono: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  caracteristicaTexto: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  botones: {
    marginBottom: spacing.sm,
  },
  boton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  botonDetalle: {
    backgroundColor: colors.primary,
  },
  botonDetalleTexto: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  infoBannerIcono: {
    fontSize: 16,
  },
  infoBannerTexto: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
});