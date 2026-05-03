import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { professionalsApi } from "@/services/api";
import type { ProfessionalWithAvailability } from "@telemed/shared";

export default function SearchScreen() {
  const [professionals, setProfessionals] = useState<ProfessionalWithAvailability[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const data = await professionalsApi.list();
      setProfessionals(data);
    } catch {
      // Error silently handled
    } finally {
      setLoading(false);
    }
  };

  const filtered = professionals.filter(
    (p) =>
      p.specialty.toLowerCase().includes(search.toLowerCase()) ||
      (p as any)?.user?.full_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = useCallback(
    ({ item }: { item: ProfessionalWithAvailability }) => (
      <Link href={`/(tabs)/search/${item.id}`} asChild>
        <TouchableOpacity style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={theme.colors.primary[600]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.professionalName}>
              {(item as any)?.user?.full_name ?? "Profissional"}
            </Text>
            <Text style={styles.specialty}>{item.specialty}</Text>
            <Text style={styles.price}>
              {item.consultation_price > 0
                ? `R$ ${item.consultation_price.toFixed(2)}`
                : "Preço sob consulta"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
        </TouchableOpacity>
      </Link>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por especialidade ou nome..."
          placeholderTextColor={theme.colors.neutral[400]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary[600]}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum profissional encontrado
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    margin: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[800],
  },
  loader: {
    marginTop: theme.spacing["2xl"],
  },
  list: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.full,
    backgroundColor: `${theme.colors.primary[600]}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  professionalName: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.neutral[800],
  },
  specialty: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  price: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary[600],
    fontWeight: "600",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.neutral[400],
    fontSize: theme.fontSizes.md,
    marginTop: theme.spacing["2xl"],
  },
});
