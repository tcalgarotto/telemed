import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { professionalsApi } from "@/services/api";
import type { ProfessionalWithAvailability } from "@telemed/shared";

export default function ProfessionalProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [professional, setProfessional] = useState<ProfessionalWithAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProfessional(id);
    }
  }, [id]);

  const loadProfessional = async (professionalId: string) => {
    try {
      const data = await professionalsApi.getById(professionalId);
      setProfessional(data);
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

  if (!professional) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profissional não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={48} color={theme.colors.primary[600]} />
        </View>
        <Text style={styles.name}>
          {(professional as any)?.user?.full_name ?? "Profissional"}
        </Text>
        <Text style={styles.specialty}>{professional.specialty}</Text>
        <Text style={styles.price}>
          Consulta: R$ {professional.consultation_price.toFixed(2)}
        </Text>
      </View>

      {professional.bio ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.bio}>{professional.bio}</Text>
        </View>
      ) : null}

      {professional.years_experience ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiência</Text>
          <Text style={styles.info}>
            {professional.years_experience} anos de experiência
          </Text>
        </View>
      ) : null}

      {professional.license_number ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registro</Text>
          <Text style={styles.info}>{professional.license_number}</Text>
        </View>
      ) : null}

      {(professional as any)?.availability?.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidade</Text>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(
            (day, index) => {
              const slots = (professional as any).availability.filter(
                (a: any) => a.day_of_week === index,
              );
              if (slots.length === 0) return null;
              return (
                <View key={day} style={styles.availabilityRow}>
                  <Text style={styles.dayLabel}>{day}</Text>
                  <Text style={styles.timeLabel}>
                    {slots
                      .map((s: any) => `${s.start_time}-${s.end_time}`)
                      .join(", ")}
                  </Text>
                </View>
              );
            },
          )}
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => router.push(`/booking/${professional.id}`)}
      >
        <Ionicons name="calendar" size={20} color={theme.colors.white} />
        <Text style={styles.bookButtonText}>Agendar Consulta</Text>
      </TouchableOpacity>
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
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${theme.colors.primary[600]}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSizes["2xl"],
    fontWeight: "700",
    color: theme.colors.neutral[800],
  },
  specialty: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[500],
    marginTop: theme.spacing.xs,
  },
  price: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.primary[600],
    fontWeight: "600",
    marginTop: theme.spacing.sm,
  },
  section: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "600",
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.sm,
  },
  bio: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[600],
    lineHeight: 24,
  },
  info: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[600],
  },
  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  dayLabel: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.neutral[700],
  },
  timeLabel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[500],
  },
  bookButton: {
    backgroundColor: theme.colors.primary[600],
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  bookButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
  },
});
