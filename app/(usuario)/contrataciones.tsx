import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContrataciones } from '@/src/presentation/hooks/useContrataciones';
import { Contratacion } from '@/src/domain/models/Contratacion';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

export default function ContratacionesScreen() {
  const router = useRouter();
  const { contrataciones, cargando, cargarMisContrataciones, cancelar } = useContrataciones();
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarMisContrataciones();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarMisContrataciones();
    setRefrescando(false);
  };

  const handleCancelar = (contratacion: Contratacion) => {
    Alert.alert(
      'Cancelar Contratación',
      `¿Estás seguro de cancelar el plan ${contratacion.plan?.nombre}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            const resultado = await cancelar(contratacion.id);
            if (resultado.success) {
              Alert.alert('Éxito', 'Contratación cancelada');
              cargarMisContrataciones();
            } else {
              Alert.alert('Error', resultado.error || 'No se pudo cancelar');
            }
          },
        },
      ]
    );
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return colors.success;
      case 'pendiente':
        return colors.warning;
      case 'rechazada':
        return colors.danger;
      case 'cancelada':
        return colors.textTertiary;
      default:
        return colors.textSecondary;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'aprobada':
        return 'APROBADA';
      case 'pendiente':
        return 'PENDIENTE';
      case 'rechazada':
        return 'RECHAZADA';
      case 'cancelada':
        return 'CANCELADA';
      default:
        return estado.toUpperCase();
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderContratacion = ({ item }: { item: Contratacion }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planNombre}>{item.plan?.nombre || 'Plan Desconocido'}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
            <Text style={styles.estadoTexto}>{getEstadoTexto(item.estado)}</Text>
          </View>
        </View>
      </View>

      {/* Precio */}
      <View style={styles.precioContainer}>
        <Text style={styles.precio}>${item.plan?.precio.toFixed(2)}</Text>
        <Text style={styles.precioTexto}>/mes</Text>
      </View>

      {/* Información */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Fecha de contratación</Text>
          <Text style={styles.infoValue}>{formatearFecha(item.fecha_contratacion)}</Text>
        </View>

        {item.numero_linea && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Número de línea</Text>
            <Text style={styles.infoValue}>{item.numero_linea}</Text>
          </View>
        )}

        {item.fecha_inicio && item.fecha_fin && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vigencia</Text>
            <Text style={styles.infoValue}>
              {formatearFecha(item.fecha_inicio)} - {formatearFecha(item.fecha_fin)}
            </Text>
          </View>
        )}

        {item.observaciones && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Observaciones</Text>
            <Text style={styles.infoValue}>{item.observaciones}</Text>
          </View>
        )}
      </View>

      {/* Acciones */}
      <View style={styles.acciones}>
        {item.estado === 'aprobada' && (
          <TouchableOpacity
            style={[styles.boton, styles.botonChat]}
            onPress={() => router.push(`/(usuario)/chat/${item.id}`)}
          >
            <Text style={styles.botonChatTexto}>💬 Chat con Asesor</Text>
          </TouchableOpacity>
        )}

        {item.estado === 'pendiente' && (
          <TouchableOpacity
            style={[styles.boton, styles.botonCancelar]}
            onPress={() => handleCancelar(item)}
          >
            <Text style={styles.botonCancelarTexto}>Cancelar Solicitud</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No tienes contrataciones</Text>
      <Text style={styles.emptyText}>
        Explora nuestros planes y contrata el que más te convenga
      </Text>
      <TouchableOpacity
        style={[globalStyles.button, globalStyles.buttonPrimary]}
        onPress={() => router.push('/(usuario)/catalogo')}
      >
        <Text style={globalStyles.buttonText}>Ver Planes</Text>
      </TouchableOpacity>
    </View>
  );

  if (cargando && contrataciones.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={styles.loadingIcon}>⏳</Text>
        <Text style={styles.loadingText}>Cargando contrataciones...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={contrataciones}
        renderItem={renderContratacion}
        keyExtractor={(item) => item.id}
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
    marginBottom: spacing.md,
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planNombre: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  estadoTexto: {
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
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  precioTexto: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  infoContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
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
  botonChat: {
    backgroundColor: colors.primary,
  },
  botonChatTexto: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  botonCancelar: {
    backgroundColor: colors.danger + '20',
  },
  botonCancelarTexto: {
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