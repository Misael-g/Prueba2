import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useContrataciones } from '@/src/presentation/hooks/useContrataciones';
import { Contratacion } from '@/src/domain/models/Contratacion';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

export default function ChatsAsesorScreen() {
  const router = useRouter();
  const { contrataciones, cargando, cargarTodasLasContrataciones } = useContrataciones();
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarTodasLasContrataciones();
  }, []);

  const onRefresh = async () => {
    setRefrescando(true);
    await cargarTodasLasContrataciones();
    setRefrescando(false);
  };

  // Filtrar solo contrataciones aprobadas (donde hay chat activo)
  const contratacionesConChat = contrataciones.filter(c => c.estado === 'aprobada');

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
    }
  };

  const renderChat = ({ item }: { item: Contratacion }) => {
    const nombreCliente = item.usuario?.nombre_completo || item.usuario?.email || 'Cliente';
    const planNombre = item.plan?.nombre || 'Plan';

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/(asesor)/chat/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {nombreCliente.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Información */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.nombreCliente} numberOfLines={1}>
              {nombreCliente}
            </Text>
            <Text style={styles.fecha}>{formatearFecha(item.created_at)}</Text>
          </View>

          <View style={styles.chatPreview}>
            <Text style={styles.planNombre} numberOfLines={1}>
              📱 {planNombre}
            </Text>
          </View>

          {item.numero_linea && (
            <Text style={styles.numeroLinea} numberOfLines={1}>
              📞 {item.numero_linea}
            </Text>
          )}
        </View>

        {/* Indicador */}
        <View style={styles.indicador}>
          <Text style={styles.indicadorIcono}>💬</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Chats con Clientes</Text>
      <Text style={styles.headerSubtitle}>
        {contratacionesConChat.length} {contratacionesConChat.length === 1 ? 'conversación activa' : 'conversaciones activas'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>No hay chats activos</Text>
      <Text style={styles.emptyText}>
        Los chats aparecerán cuando apruebes contrataciones
      </Text>
      <TouchableOpacity
        style={[globalStyles.button, globalStyles.buttonPrimary]}
        onPress={() => router.push('/(asesor)/contrataciones')}
      >
        <Text style={globalStyles.buttonText}>Ver Contrataciones</Text>
      </TouchableOpacity>
    </View>
  );

  if (cargando && contrataciones.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={styles.loadingIcon}>⏳</Text>
        <Text style={styles.loadingText}>Cargando chats...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={contratacionesConChat}
        renderItem={renderChat}
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
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarTexto: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.white,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  nombreCliente: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  fecha: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  chatPreview: {
    marginBottom: spacing.xs / 2,
  },
  planNombre: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  numeroLinea: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  indicador: {
    marginLeft: spacing.sm,
  },
  indicadorIcono: {
    fontSize: 24,
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