import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/client";
import { getDailyRoomToken } from "@/lib/daily/client";
import { apiResponse, apiError, handleApiError } from "@/lib/api-utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const { id } = await params;

    const { data: consultation, error } = await supabaseAdmin
      .from("consultations")
      .select("id, patient_id, professional_id, daily_room_url, status")
      .eq("id", id)
      .single();

    if (error || !consultation) {
      return apiError("NOT_FOUND", "Consultation not found", 404);
    }

    if (!consultation.daily_room_url) {
      return apiError("NO_ROOM", "No video room available", 400);
    }

    // Get user info
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("full_name")
      .eq("id", userId)
      .single();

    // Check if user is the professional (is_owner)
    const { data: professional } = await supabaseAdmin
      .from("professionals")
      .select("user_id")
      .eq("id", consultation.professional_id)
      .single();

    const isOwner = professional?.user_id === userId;

    // Extract room name from URL
    const roomName = consultation.daily_room_url.split("/").pop() ?? "";

    const token = await getDailyRoomToken(
      roomName,
      user?.full_name ?? "Participant",
      isOwner,
    );

    // Update consultation status to in_progress
    if (consultation.status === "scheduled") {
      await supabaseAdmin
        .from("consultations")
        .update({ status: "in_progress" })
        .eq("id", id);
    }

    return apiResponse({
      token,
      room_url: consultation.daily_room_url,
      is_owner: isOwner,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
