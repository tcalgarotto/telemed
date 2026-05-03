import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { useAppDataStore } from "@/stores/app-data";
import type { Consultation } from "@telemed/shared";

const statusLabels: Record<string, string> = {
  scheduled: "Agendada",
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const statusColors: Record<string, string> = {
  scheduled: theme.colors.info,
  in_progress: theme.colors.warning,
  completed: theme.colors.success,
  cancelled: theme.colors.error,
};

export default function AppointmentsScreen() {
  const { consultations, isLoadingConsultations, fetchConsultations } =
    useAppDataStore();

  useFocusEffect(
    useCallback(() => {
      fetchConsultations();
    }, []),
  );

  const renderItem = ({ item }: { item: Consultation }) => (
    <Link href={`/(tabs)/appointments/${item.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={20} color={theme.colors.primary[600]} />
          <Text style={styles.date}>
            {new Date(item.scheduled_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Text style={styles.time}>
            {new Date(item.scheduled_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.duration}>{item.duration_minutes} min</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColors[item.status] ?? theme.colors.neutral[400]}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColors[item.status] ?? theme.colors.neutral[400] },
              ]}
            >
              {statusLabels[item.status] ?? item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      {isLoadingConsultations ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary[600]}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={consultations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma consulta encontrada</Text>
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
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  date: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.neutral[800],
    flex: 1,
  },
  time: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[600],
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  duration: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[500],
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
  emptyText: {
    textAlign: "center",
    color: theme.colors.neutral[400],
    fontSize: theme.fontSizes.md,
    marginTop: theme.spacing["2xl"],
  },
});
