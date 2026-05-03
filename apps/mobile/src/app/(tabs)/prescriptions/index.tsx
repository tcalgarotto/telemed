import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { useAppDataStore } from "@/stores/app-data";
import type { Prescription } from "@telemed/shared";

export default function PrescriptionsScreen() {
  const { prescriptions, isLoadingPrescriptions, fetchPrescriptions } =
    useAppDataStore();

  useFocusEffect(
    useCallback(() => {
      fetchPrescriptions();
    }, []),
  );

  const renderItem = ({ item }: { item: Prescription }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons
          name="document-text"
          size={24}
          color={theme.colors.primary[600]}
        />
        <View style={styles.cardHeaderText}>
          <Text style={styles.medication}>{item.medication_name}</Text>
          <Text style={styles.dosage}>{item.dosage}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "active"
                  ? `${theme.colors.success}20`
                  : `${theme.colors.neutral[400]}20`,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === "active"
                    ? theme.colors.success
                    : theme.colors.neutral[500],
              },
            ]}
          >
            {item.status === "active" ? "Ativa" : item.status === "expired" ? "Expirada" : "Cancelada"}
          </Text>
        </View>
      </View>
      {item.instructions ? (
        <Text style={styles.instructions}>{item.instructions}</Text>
      ) : null}
      <Text style={styles.validUntil}>
        Válida até: {new Date(item.valid_until).toLocaleDateString("pt-BR")}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoadingPrescriptions ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary[600]}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma receita encontrada</Text>
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
  loader: {
    marginTop: theme.spacing["2xl"],
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  cardHeaderText: {
    flex: 1,
  },
  medication: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.neutral[800],
  },
  dosage: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[500],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  statusText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "600",
  },
  instructions: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[600],
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  validUntil: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.neutral[400],
    marginTop: theme.spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    color: theme.colors.neutral[400],
    fontSize: theme.fontSizes.md,
    marginTop: theme.spacing["2xl"],
  },
});
