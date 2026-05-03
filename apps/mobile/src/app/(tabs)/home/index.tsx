import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";

const quickActions = [
  {
    label: "Agendar Consulta",
    icon: "add-circle-outline" as const,
    href: "/(tabs)/search",
    color: theme.colors.primary[600],
  },
  {
    label: "Minhas Consultas",
    icon: "calendar-outline" as const,
    href: "/(tabs)/appointments",
    color: theme.colors.secondary[600],
  },
  {
    label: "Minhas Receitas",
    icon: "document-text-outline" as const,
    href: "/(tabs)/prescriptions",
    color: theme.colors.info,
  },
];

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Olá, {user?.firstName ?? "Paciente"}
          </Text>
          <Text style={styles.subtitle}>Como podemos ajudar hoje?</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href as any} asChild>
              <TouchableOpacity style={styles.actionCard}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Por que TeleMed?</Text>
        <View style={styles.infoCard}>
          <Ionicons name="flash-outline" size={24} color={theme.colors.primary[600]} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Atendimento Rápido</Text>
            <Text style={styles.infoDesc}>
              Consulte um médico em minutos, sem filas de espera.
            </Text>
          </View>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="wallet-outline" size={24} color={theme.colors.secondary[600]} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Preço Acessível</Text>
            <Text style={styles.infoDesc}>
              Planos de assinatura com consultas a preços reduzidos.
            </Text>
          </View>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="document-outline" size={24} color={theme.colors.info} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Receita Digital</Text>
            <Text style={styles.infoDesc}>
              Receba suas receitas diretamente no aplicativo.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.fontSizes["2xl"],
    fontWeight: "700",
    color: theme.colors.neutral[800],
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "600",
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md,
  },
  quickActions: {
    padding: theme.spacing.lg,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  actionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    alignItems: "center",
    width: "30%",
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  actionLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[700],
    textAlign: "center",
    fontWeight: "500",
  },
  infoSection: {
    padding: theme.spacing.lg,
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.neutral[800],
  },
  infoDesc: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
});
