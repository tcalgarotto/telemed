import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { professionalsApi, consultationsApi } from "@/services/api";
import { useAppDataStore } from "@/stores/app-data";
import type { ProfessionalWithAvailability } from "@telemed/shared";

export default function BookingScreen() {
  const { professionalId } = useLocalSearchParams<{ professionalId: string }>();
  const [professional, setProfessional] = useState<ProfessionalWithAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const addConsultation = useAppDataStore((s) => s.addConsultation);

  useEffect(() => {
    if (professionalId) loadProfessional();
  }, [professionalId]);

  const loadProfessional = async () => {
    try {
      const data = await professionalsApi.getById(professionalId!);
      setProfessional(data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = generateTimeSlots();

  function generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 8; h < 18; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
  }

  const handleBook = async () => {
    if (!selectedTime || !professionalId) return;

    setBooking(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours!, minutes!, 0, 0);

      const consultation = await consultationsApi.book({
        professional_id: professionalId,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 30,
      });

      addConsultation(consultation);
      router.replace("/(tabs)/appointments");
    } catch (err: any) {
      // Error handled
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Agendar Consulta</Text>
        <Text style={styles.professionalName}>
          {(professional as any)?.user?.full_name ?? "Profissional"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horário</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedTime === time && styles.timeSlotSelected,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTime === time && styles.timeSlotTextSelected,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observações (opcional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Descreva brevemente o motivo da consulta..."
          placeholderTextColor={theme.colors.neutral[400]}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Resumo</Text>
        <Text style={styles.summaryText}>
          Profissional: {(professional as any)?.user?.full_name}
        </Text>
        <Text style={styles.summaryText}>
          Data: {selectedDate.toLocaleDateString("pt-BR")}
        </Text>
        <Text style={styles.summaryText}>
          Horário: {selectedTime || "Não selecionado"}
        </Text>
        <Text style={styles.summaryPrice}>
          R$ {professional?.consultation_price.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!selectedTime || booking) && styles.confirmButtonDisabled,
        ]}
        onPress={handleBook}
        disabled={!selectedTime || booking}
      >
        {booking ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
            <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
          </>
        )}
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
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "700",
    color: theme.colors.neutral[800],
  },
  professionalName: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[500],
    marginTop: 4,
  },
  section: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.white,
  },
  timeSlotSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  timeSlotText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.neutral[700],
  },
  timeSlotTextSelected: {
    color: theme.colors.white,
    fontWeight: "600",
  },
  notesInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[800],
    minHeight: 80,
    textAlignVertical: "top",
  },
  summary: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "600",
    color: theme.colors.neutral[800],
    marginBottom: theme.spacing.md,
  },
  summaryText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.neutral[600],
    marginBottom: 4,
  },
  summaryPrice: {
    fontSize: theme.fontSizes.xl,
    fontWeight: "700",
    color: theme.colors.primary[600],
    marginTop: theme.spacing.sm,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary[600],
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
  },
});
