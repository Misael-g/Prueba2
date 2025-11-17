import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  StyleSheet,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePlanes } from '@/src/presentation/hooks/usePlanes';
import { colors, spacing, fontSize, borderRadius } from '@/src/styles/theme';
import { globalStyles } from '@/src/styles/globalStyles';

export default function CrearPlanScreen() {
  const router = useRouter();
  const { crear, seleccionarImagen, tomarFoto } = usePlanes();

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [datosGb, setDatosGb] = useState('');
  const [minutos, setMinutos] = useState('');
  const [sms, setSms] = useState('Ilimitados');
  const [velocidad4g, setVelocidad4g] = useState('');
  const [velocidad5g, setVelocidad5g] = useState('');
  const [redesSociales, setRedesSociales] = useState('');
  const [whatsappIncluido, setWhatsappIncluido] = useState(true);
  const [llamadasInternacionales, setLlamadasInternacionales] = useState('');
  const [roaming, setRoaming] = useState('');
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const handleSeleccionarImagen = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tomar Foto', 'Elegir de Galería'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            const uri = await tomarFoto();
            if (uri) setImagenUri(uri);
          } else if (buttonIndex === 2) {
            const uri = await seleccionarImagen();
            if (uri) setImagenUri(uri);
          }
        }
      );
    } else {
      Alert.alert(
        'Seleccionar Imagen',
        'Elige una opción',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Tomar Foto',
            onPress: async () => {
              const uri = await tomarFoto();
              if (uri) setImagenUri(uri);
            },
          },
          {
            text: 'Elegir de Galería',
            onPress: async () => {
              const uri = await seleccionarImagen();
              if (uri) setImagenUri(uri);
            },
          },
        ]
      );
    }
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del plan es obligatorio');
      return false;
    }
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      Alert.alert('Error', 'El precio debe ser un número mayor a 0');
      return false;
    }
    if (!datosGb.trim()) {
      Alert.alert('Error', 'Los datos GB son obligatorios');
      return false;
    }
    if (!minutos.trim()) {
      Alert.alert('Error', 'Los minutos son obligatorios');
      return false;
    }
    if (!velocidad4g.trim()) {
      Alert.alert('Error', 'La velocidad 4G es obligatoria');
      return false;
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);
    const resultado = await crear(
      nombre.trim(),
      parseFloat(precio),
      datosGb.trim(),
      minutos.trim(),
      sms.trim(),
      velocidad4g.trim(),
      velocidad5g.trim() || null,
      redesSociales.trim(),
      whatsappIncluido,
      llamadasInternacionales.trim(),
      roaming.trim(),
      imagenUri || undefined
    );
    setGuardando(false);

    if (resultado.success) {
      Alert.alert('Éxito', 'Plan creado correctamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert('Error', resultado.error || 'No se pudo crear el plan');
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagen del plan */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Imagen del Plan</Text>
          <TouchableOpacity
            style={styles.imagenContainer}
            onPress={handleSeleccionarImagen}
          >
            {imagenUri ? (
              <Image source={{ uri: imagenUri }} style={styles.imagen} />
            ) : (
              <View style={styles.imagenPlaceholder}>
                <Text style={styles.imagenIcono}>📷</Text>
                <Text style={styles.imagenTexto}>Toca para seleccionar imagen</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Información básica */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Información Básica</Text>
          
          <Text style={styles.label}>Nombre del Plan *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: SMART 5GB"
            value={nombre}
            onChangeText={setNombre}
            editable={!guardando}
          />

          <Text style={styles.label}>Precio Mensual (USD) *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: 15.99"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
            editable={!guardando}
          />
        </View>

        {/* Características técnicas */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Características Técnicas</Text>
          
          <Text style={styles.label}>Datos Móviles *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: 5 GB / ILIMITADO"
            value={datosGb}
            onChangeText={setDatosGb}
            editable={!guardando}
          />

          <Text style={styles.label}>Minutos de Voz *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: 100 minutos nacionales"
            value={minutos}
            onChangeText={setMinutos}
            editable={!guardando}
          />

          <Text style={styles.label}>SMS</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: Ilimitados"
            value={sms}
            onChangeText={setSms}
            editable={!guardando}
          />

          <Text style={styles.label}>Velocidad 4G *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: Hasta 50 Mbps"
            value={velocidad4g}
            onChangeText={setVelocidad4g}
            editable={!guardando}
          />

          <Text style={styles.label}>Velocidad 5G (opcional)</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: Hasta 300 Mbps"
            value={velocidad5g}
            onChangeText={setVelocidad5g}
            editable={!guardando}
          />
        </View>

        {/* Beneficios adicionales */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Beneficios Adicionales</Text>
          
          <Text style={styles.label}>Redes Sociales</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: Facebook, Instagram, TikTok GRATIS"
            value={redesSociales}
            onChangeText={setRedesSociales}
            multiline
            editable={!guardando}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.label}>WhatsApp Incluido</Text>
            <Switch
              value={whatsappIncluido}
              onValueChange={setWhatsappIncluido}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.white}
              disabled={guardando}
            />
          </View>

          <Text style={styles.label}>Llamadas Internacionales</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: $0.15/min o 100 minutos incluidos"
            value={llamadasInternacionales}
            onChangeText={setLlamadasInternacionales}
            editable={!guardando}
          />

          <Text style={styles.label}>Roaming</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="Ej: 500 MB incluidos (Sudamérica)"
            value={roaming}
            onChangeText={setRoaming}
            editable={!guardando}
          />
        </View>

        {/* Botones */}
        <View style={styles.botones}>
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonOutline, styles.boton]}
            onPress={() => router.back()}
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
              {guardando ? 'Guardando...' : 'Crear Plan'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  imagenContainer: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.borderLight,
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  imagenPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
  },
  imagenIcono: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  imagenTexto: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  botones: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  boton: {
    flex: 1,
  },
});