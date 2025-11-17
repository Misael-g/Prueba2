import { StyleSheet } from "react-native";
import { borderRadius, colors, fontSize, shadows, spacing } from "./theme";

// Estilos globales que se usan en toda la app
export const globalStyles = StyleSheet.create({
  // ==================== CONTENEDORES ====================
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  contentPadding: {
    padding: spacing.lg,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },

  // ==================== INPUTS ====================
  input: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },

  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  inputError: {
    borderColor: colors.danger,
  },

  // ==================== BOTONES ====================
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
  },

  buttonSecondary: {
    backgroundColor: colors.secondary,
  },

  buttonDanger: {
    backgroundColor: colors.danger,
  },

  buttonSuccess: {
    backgroundColor: colors.success,
  },

  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: "bold",
  },

  buttonTextOutline: {
    color: colors.primary,
  },

  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },

  buttonLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },

  // ==================== TARJETAS ====================
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },

  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.textPrimary,
  },

  cardBody: {
    marginVertical: spacing.sm,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  // ==================== TEXTOS ====================
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },

  textPrimary: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },

  textSecondary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  textTertiary: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },

  textBold: {
    fontWeight: "bold",
  },

  textCenter: {
    textAlign: "center",
  },

  textPrice: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.primary,
  },

  // ==================== HEADERS ====================
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.small,
  },

  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.textPrimary,
  },

  // ==================== BADGES/CHIPS ====================
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
  },

  badgeText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: "600",
  },

  badgeSuccess: {
    backgroundColor: colors.success,
  },

  badgeDanger: {
    backgroundColor: colors.danger,
  },

  badgeWarning: {
    backgroundColor: colors.warning,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.xl,
    gap: spacing.xs + 3,
  },

  chipText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: "500",
  },

  // ==================== ESTADOS ====================
  emptyState: {
    textAlign: "center",
    marginTop: spacing.xxl,
    fontSize: fontSize.md,
    color: colors.textTertiary,
    padding: spacing.xl,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  errorContainer: {
    padding: spacing.lg,
    backgroundColor: colors.danger + "20",
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },

  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },

  // ==================== LISTAS ====================
  listContainer: {
    padding: spacing.md,
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },

  listItemText: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  // ==================== MODALES ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: "90%",
    maxWidth: 400,
    ...shadows.large,
  },

  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },

  // ==================== TABS ====================
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },

  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: borderRadius.md,
  },

  tabActive: {
    backgroundColor: colors.primary,
  },

  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  tabTextActive: {
    color: colors.white,
    fontWeight: "bold",
  },

  // ==================== UTILIDADES ====================
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  spaceBetween: {
    justifyContent: "space-between",
  },

  mt: {
    marginTop: spacing.md,
  },

  mb: {
    marginBottom: spacing.md,
  },

  mx: {
    marginHorizontal: spacing.md,
  },

  my: {
    marginVertical: spacing.md,
  },

  p: {
    padding: spacing.md,
  },
});