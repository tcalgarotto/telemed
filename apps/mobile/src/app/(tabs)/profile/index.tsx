import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={theme.colors.primary[600]} />
        </View>
        <Text style={styles.name}>{user?.fullName ?? "Usuário"}</Text>
        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={22} color={theme.colors.neutral[600]} />
          <Text style={styles.menuText}>Editar Perfil</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={22} color={theme.colors.neutral[600]} />
          <Text style={styles.menuText}>Planos e Assinatura</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="medkit-outline" size={22} color={theme.colors.neutral[600]} />
          <Text style={styles.menuText}>Tornar-se Profissional</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={22} color={theme.colors.neutral[600]} />
          <Text style={styles.menuText}>Configurações</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.neutral[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={22} color={theme.colors.neutral[600]} />
          <Text style={styles.menuText}>Ajuda</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        <Text style={styles.signOutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary[600]}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "700",
    color: theme.colors.neutral[800],
  },
  email: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[500],
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
    gap: theme.spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[700],
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
  },
  signOutText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.error,
    fontWeight: "600",
  },
});
