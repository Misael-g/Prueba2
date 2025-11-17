import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContrataciones } from '@/src/presentation/hooks/useContrataciones';
import { Contratacion } from '@/src/domain/models/Contratacion';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

type FiltroEstado = 'todos' | 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';

export default function ContratacionesAsesorScreen() {
  const router = useRouter();
  const { contrataciones, cargando, cargarTodasLasContrataciones, actualizarEstado } = useContrataciones();
  const [refrescando, setRefrescando] = useState(false);
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState<Contratacion | null>(null);
  const [numeroLinea, setNumeroLinea] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarTodasLasContrataciones();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarTodasLasContrataciones();
    setRefrescando(false);
  };

  const contratacionesFiltradas = filtro === 'todos'
    ? contrataciones
    : contrataciones.filter(c => c.estado === filtro);

  const handleAprobar = (contratacion: Contratacion) => {
    setContratacionSeleccionada(contratacion);
    setNumeroLinea('');
    setObservaciones('');
    setModalVisible(true);
  };

  const confirmarAprobacion = async () => {
    if (!contratacionSeleccionada) return;

    if (!numeroLinea.trim()) {
      Alert.alert('Error', 'El número de línea es obligatorio');
      return;
    }

    setProcesando(true);
    const resultado = await actualizarEstado(
      contratacionSeleccionada.id,
      'aprobada',
      numeroLinea.trim(),
      observaciones.trim() || undefined
    );
    setProcesando(false);

    if (resultado.success) {
      setModalVisible(false);
      Alert.alert('Éxito', 'Contratación aprobada correctamente');
      cargarTodasLasContrataciones();
    } else {
      Alert.alert('Error', resultado.error || 'No se pudo aprobar');
    }
  };

  const handleRechazar = (contratacion: Contratacion) => {
    Alert.alert(
      'Rechazar Contratación',
      `¿Estás seguro de rechazar la contratación del plan ${contratacion.plan?.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            const resultado = await actualizarEstado(
              contratacion.id,
              'rechazada',
              undefined,
              'Rechazado por el asesor'
            );

            if (resultado.success) {
              Alert.alert('Éxito', 'Contratación rechazada');
              cargarTodasLasContrataciones();
            } else {
              Alert.alert('Error', resultado.error || 'No se pudo rechazar');
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

  const renderFiltros = () => (
    <View style={styles.filtrosContainer}>
      <TouchableOpacity
        style={[styles.filtro, filtro === 'todos' && styles.filtroActivo]}
        onPress={() => setFiltro('todos')}
      >
        <Text style={[styles.filtroTexto, filtro === 'todos' && styles.filtroTextoActivo]}>
          Todos
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filtro, filtro === 'pendiente' && styles.filtroActivo]}
        onPress={() => setFiltro('pendiente')}
      >
        <Text style={[styles.filtroTexto, filtro === 'pendiente' && styles.filtroTextoActivo]}>
          Pendientes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filtro, filtro === 'aprobada' && styles.filtroActivo]}
        onPress={() => setFiltro('aprobada')}
      >
        <Text style={[styles.filtroTexto, filtro === 'aprobada' && styles.filtroTextoActivo]}>
          Aprobadas
        </Text>
      </TouchableOpacity>
    </View>
  );

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

      {/* Cliente */}
      <View style={styles.infoCliente}>
        <Text style={styles.infoLabel}>Cliente:</Text>
        <Text style={styles.infoValue}>
          {item.usuario?.nombre_completo || item.usuario?.email || 'Usuario'}
        </Text>
      </View>

      {/* Precio */}
      <View style={styles.precioContainer}>
        <Text style={styles.precio}>${item.plan?.precio.toFixed(2)}</Text>
        <Text style={styles.precioTexto}>/mes</Text>
      </View>

      {/* Información */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Fecha de solicitud</Text>
          <Text style={styles.infoValue}>{formatearFecha(item.fecha_contratacion)}</Text>
        </View>

        {item.numero_linea && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Número de línea</Text>
            <Text style={styles.infoValue}>{item.numero_linea}</Text>
          </View>
        )}

        {item.observaciones && (
          <View style={styles.observaciones}>
            <Text style={styles.infoLabel}>Observaciones:</Text>
            <Text style={styles.observacionesTexto}>{item.observaciones}</Text>
          </View>
        )}
      </View>

      {/* Acciones */}
      <View style={styles.acciones}>
        {item.estado === 'pendiente' && (
          <>
            <TouchableOpacity
              style={[styles.boton, styles.botonAprobar]}
              onPress={() => handleAprobar(item)}
            >
              <Text style={styles.botonAprobarTexto}>✓ Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, styles.botonRechazar]}
              onPress={() => handleRechazar(item)}
            >
              <Text style={styles.botonRechazarTexto}>✗ Rechazar</Text>
            </TouchableOpacity>
          </>
        )}

        {item.estado === 'aprobada' && (
          <TouchableOpacity
            style={[styles.boton, styles.botonChat]}
            onPress={() => router.push(`/(asesor)/chat/${item.id}`)}
          >
            <Text style={styles.botonChatTexto}>💬 Ir al Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No hay contrataciones</Text>
      <Text style={styles.emptyText}>
        {filtro === 'todos'
          ? 'Aún no hay solicitudes de contratación'
          : `No hay contrataciones ${filtro === 'pendiente' ? 'pendientes' : filtro + 's'}`}
      </Text>
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
        data={contratacionesFiltradas}
        renderItem={renderContratacion}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderFiltros}
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

      {/* Modal de aprobación */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Aprobar Contratación</Text>
            
            <Text style={styles.modalSubtitulo}>
              {contratacionSeleccionada?.plan?.nombre}
            </Text>

            <Text style={styles.label}>Número de Línea *</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="0999999999"
              value={numeroLinea}
              onChangeText={setNumeroLinea}
              keyboardType="phone-pad"
              editable={!procesando}
            />

            <Text style={styles.label}>Observaciones (opcional)</Text>
            <TextInput
              style={[globalStyles.input, globalStyles.inputMultiline]}
              placeholder="Notas adicionales..."
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
              numberOfLines={3}
              editable={!procesando}
            />

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonOutline, styles.modalBoton]}
                onPress={() => setModalVisible(false)}
                disabled={procesando}
              >
                <Text style={globalStyles.buttonTextOutline}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  globalStyles.button,
                  globalStyles.buttonSuccess,
                  styles.modalBoton,
                  procesando && globalStyles.buttonDisabled,
                ]}
                onPress={confirmarAprobacion}
                disabled={procesando}
              >
                <Text style={globalStyles.buttonText}>
                  {procesando ? 'Procesando...' : 'Aprobar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
  },
  filtrosContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filtro: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filtroActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filtroTexto: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filtroTextoActivo: {
    color: colors.white,
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
  infoCliente: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
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
  observaciones: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  observacionesTexto: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginTop: spacing.xs / 2,
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
  botonAprobar: {
    backgroundColor: colors.success,
  },
  botonAprobarTexto: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  botonRechazar: {
    backgroundColor: colors.danger + '20',
  },
  botonRechazarTexto: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  botonChat: {
    backgroundColor: colors.primary,
  },
  botonChatTexto: {
    color: colors.white,
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
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitulo: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalSubtitulo: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modalBotones: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBoton: {
    flex: 1,
  },
});