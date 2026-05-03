import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { consultationsApi } from "@/services/api";
import type { Consultation } from "@telemed/shared";

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadConsultation(id);
  }, [id]);

  const loadConsultation = async (consultationId: string) => {
    try {
      const data = await consultationsApi.getById(consultationId);
      setConsultation(data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  if (!consultation) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Consulta não encontrada</Text>
      </View>
    );
  }

  const canJoin = consultation.status === "scheduled" || consultation.status === "in_progress";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Detalhes da Consulta</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.neutral[500]} />
          <Text style={styles.infoText}>
            {new Date(consultation.scheduled_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={theme.colors.neutral[500]} />
          <Text style={styles.infoText}>
            {new Date(consultation.scheduled_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" - "}
            {consultation.duration_minutes} minutos
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="flag-outline" size={20} color={theme.colors.neutral[500]} />
          <Text style={styles.infoText}>
            Status: {consultation.status === "scheduled"
              ? "Agendada"
              : consultation.status === "in_progress"
              ? "Em andamento"
              : consultation.status === "completed"
              ? "Concluída"
              : "Cancelada"}
          </Text>
        </View>
      </View>

      {consultation.notes ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.notes}>{consultation.notes}</Text>
        </View>
      ) : null}

      {canJoin ? (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => router.push(`/consultation/${consultation.id}`)}
        >
          <Ionicons name="videocam" size={20} color={theme.colors.white} />
          <Text style={styles.joinButtonText}>Entrar na Consulta</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[500],
  },
  header: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "700",
    color: theme.colors.neutral[800],
  },
  card: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[700],
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.sm,
  },
  notes: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[600],
    lineHeight: 22,
  },
  joinButton: {
    backgroundColor: theme.colors.primary[600],
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  joinButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
  },
});
