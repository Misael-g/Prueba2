import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useChat } from '@/src/presentation/hooks/useChat';
import { useContrataciones } from '@/src/presentation/hooks/useContrataciones';
import { useAuth } from '@/src/presentation/hooks/useAuth';
import { MensajeChat } from '@/src/domain/models/MensajeChat';
import { Contratacion } from '@/src/domain/models/Contratacion';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

export default function ChatUsuarioScreen() {
  const { id } = useLocalSearchParams();
  const { perfil } = useAuth();
  const { obtenerPorId } = useContrataciones();
  const {
    mensajes,
    cargando,
    enviando,
    enviarMensaje,
    marcarTodosComoLeidos,
  } = useChat(id as string);

  const [contratacion, setContratacion] = useState<Contratacion | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    cargarContratacion();
    marcarTodosComoLeidos();
  }, [id]);

  useEffect(() => {
    if (mensajes.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [mensajes]);

  const cargarContratacion = async () => {
    if (!id || typeof id !== 'string') return;
    const contratacionObtenida = await obtenerPorId(id);
    setContratacion(contratacionObtenida);
  };

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim() || enviando) return;

    const mensaje = nuevoMensaje.trim();
    setNuevoMensaje('');

    const resultado = await enviarMensaje(mensaje);
    
    if (!resultado.success) {
      setNuevoMensaje(mensaje);
    }
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMensaje = ({ item }: { item: MensajeChat }) => {
    const esMio = item.emisor_id === perfil?.id;
    const nombreEmisor = item.emisor?.nombre_completo || item.emisor?.email || 'Usuario';

    return (
      <View style={[styles.mensajeContainer, esMio ? styles.mensajeMio : styles.mensajeAsesor]}>
        {!esMio && (
          <Text style={styles.nombreEmisor}>{nombreEmisor}</Text>
        )}
        <View style={[styles.burbuja, esMio ? styles.burbujaMia : styles.burbujaAsesor]}>
          <Text style={[styles.textoMensaje, esMio ? styles.textoMio : styles.textoAsesor]}>
            {item.contenido}
          </Text>
        </View>
        <Text style={[styles.hora, esMio ? styles.horaMia : styles.horaAsesor]}>
          {formatearHora(item.created_at)}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerInfo}>
      <Text style={styles.headerTitulo}>
        Conversación sobre: {contratacion?.plan?.nombre || 'Plan'}
      </Text>
      <Text style={styles.headerSubtitulo}>
        Asesor: {contratacion?.asesor?.nombre_completo || 'Tigo Conecta'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Inicia la conversación</Text>
      <Text style={styles.emptyText}>
        Envía un mensaje a tu asesor para cualquier consulta sobre tu plan
      </Text>
    </View>
  );

  if (cargando && mensajes.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <Text style={styles.loadingIcon}>⏳</Text>
        <Text style={styles.loadingText}>Cargando chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={mensajes}
        renderItem={renderMensaje}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
          multiline
          maxLength={500}
          editable={!enviando}
        />
        <TouchableOpacity
          style={[styles.botonEnviar, enviando && styles.botonEnviarDisabled]}
          onPress={handleEnviar}
          disabled={!nuevoMensaje.trim() || enviando}
        >
          <Text style={styles.iconoEnviar}>{enviando ? '⏳' : '📤'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerInfo: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  headerTitulo: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitulo: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  mensajeContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  mensajeMio: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  mensajeAsesor: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  nombreEmisor: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    marginLeft: spacing.sm,
  },
  burbuja: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  burbujaMia: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  burbujaAsesor: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  textoMensaje: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  textoMio: {
    color: colors.white,
  },
  textoAsesor: {
    color: colors.textPrimary,
  },
  hora: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs / 2,
  },
  horaMia: {
    color: colors.textTertiary,
    textAlign: 'right',
  },
  horaAsesor: {
    color: colors.textTertiary,
    textAlign: 'left',
    marginLeft: spacing.sm,
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
    paddingHorizontal: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  botonEnviar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEnviarDisabled: {
    opacity: 0.5,
  },
  iconoEnviar: {
    fontSize: 20,
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