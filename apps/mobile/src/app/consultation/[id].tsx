import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { consultationsApi } from "@/services/api";

export default function ConsultationRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [roomData, setRoomData] = useState<{
    token: string;
    room_url: string;
    is_owner: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) joinRoom();
  }, [id]);

  const joinRoom = async () => {
    try {
      const data = await consultationsApi.joinRoom(id!);
      setRoomData(data);
    } catch (err: any) {
      setError(err.message ?? "Erro ao entrar na consulta");
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    try {
      await consultationsApi.update(id!, { status: "completed" });
    } catch {
      // Error handled silently
    }
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text style={styles.loadingText}>Conectando à consulta...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={joinRoom}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Note: In production, Daily.co's React Native SDK would be used here.
  // This component shows the video call UI placeholder with essential controls.
  return (
    <View style={styles.container}>
      <View style={styles.videoArea}>
        <View style={styles.mainVideo}>
          <Ionicons name="videocam" size={48} color={theme.colors.primary[300]} />
          <Text style={styles.videoPlaceholder}>Teleconsulta em andamento</Text>
          <Text style={styles.roomInfo}>Sala: {roomData?.room_url?.split("/").pop() ?? id}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="mic" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="videocam" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="chatbubble-outline" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Ionicons name="call" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.neutral[900],
  },
  loadingText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.md,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.neutral[900],
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.md,
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary[600],
    borderRadius: theme.radii.lg,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
  },
  videoArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainVideo: {
    alignItems: "center",
    gap: theme.spacing.md,
  },
  videoPlaceholder: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.lg,
    fontWeight: "600",
  },
  roomInfo: {
    color: theme.colors.neutral[400],
    fontSize: theme.fontSizes.sm,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.neutral[700],
    alignItems: "center",
    justifyContent: "center",
  },
  endCallButton: {
    backgroundColor: theme.colors.error,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
