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

export default function DashboardScreen() {
  const router = useRouter();
  const { planes, cargando, cargarTodosLosPlanes, eliminar } = usePlanes();
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarTodosLosPlanes();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarTodosLosPlanes();
    setRefrescando(false);
  };

  const handleEliminar = (plan: PlanMovil) => {
    Alert.alert(
      'Desactivar Plan',
      `¿Estás seguro de desactivar el plan ${plan.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            const resultado = await eliminar(plan.id);
            if (resultado.success) {
              Alert.alert('Éxito', 'Plan desactivado correctamente');
              cargarTodosLosPlanes();
            } else {
              Alert.alert('Error', resultado.error || 'No se pudo desactivar');
            }
          },
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
          <View style={[styles.badge, !item.activo && styles.badgeInactivo]}>
            <Text style={styles.badgeText}>
              {item.activo ? 'ACTIVO' : 'INACTIVO'}
            </Text>
          </View>
        </View>

        {/* Precio */}
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
        </View>

        {/* Acciones */}
        <View style={styles.acciones}>
          <TouchableOpacity
            style={[styles.boton, styles.botonEditar]}
            onPress={() => router.push(`/(asesor)/plan/editar/${item.id}`)}
          >
            <Text style={styles.botonEditarTexto}>✏️ Editar</Text>
          </TouchableOpacity>
          
          {item.activo && (
            <TouchableOpacity
              style={[styles.boton, styles.botonEliminar]}
              onPress={() => handleEliminar(item)}
            >
              <Text style={styles.botonEliminarTexto}>🗑️ Desactivar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Gestión de Planes</Text>
        <Text style={styles.headerSubtitle}>
          {planes.length} {planes.length === 1 ? 'plan registrado' : 'planes registrados'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.botonCrear}
        onPress={() => router.push('/(asesor)/plan/crear')}
      >
        <Text style={styles.botonCrearTexto}>+ Nuevo Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>No hay planes registrados</Text>
      <Text style={styles.emptyText}>
        Crea tu primer plan móvil para que los usuarios puedan contratarlo
      </Text>
      <TouchableOpacity
        style={[globalStyles.button, globalStyles.buttonPrimary]}
        onPress={() => router.push('/(asesor)/plan/crear')}
      >
        <Text style={globalStyles.buttonText}>Crear Plan</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  botonCrear: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  botonCrearTexto: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
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
  badgeInactivo: {
    backgroundColor: colors.textTertiary,
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
  acciones: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  boton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  botonEditar: {
    backgroundColor: colors.primary,
  },
  botonEditarTexto: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  botonEliminar: {
    backgroundColor: colors.danger + '20',
  },
  botonEliminarTexto: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: '600',
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
    paddingHorizontal: spacing.xl,
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