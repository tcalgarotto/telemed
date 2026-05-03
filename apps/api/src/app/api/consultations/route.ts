import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/client";
import { bookConsultationSchema } from "@telemed/shared";
import { apiResponse, apiError, handleApiError } from "@/lib/api-utils";
import { createDailyRoom } from "@/lib/daily/client";
import { sendConsultationConfirmation } from "@/lib/resend/client";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const { data: consultations, error } = await supabaseAdmin
      .from("consultations")
      .select(
        "*, professional:professionals!inner(*, user:users!inner(full_name, avatar_url))",
      )
      .eq("patient_id", userId)
      .order("scheduled_at", { ascending: false });

    if (error) {
      return apiError("FETCH_FAILED", error.message, 500);
    }

    return apiResponse(consultations);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const body = bookConsultationSchema.parse(await request.json());

    // Create Daily.co room
    const roomName = `telemed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const room = await createDailyRoom(roomName);

    const { data: consultation, error } = await supabaseAdmin
      .from("consultations")
      .insert({
        patient_id: userId,
        professional_id: body.professional_id,
        scheduled_at: body.scheduled_at,
        duration_minutes: body.duration_minutes,
        daily_room_url: room.url,
        status: "scheduled",
      })
      .select(
        "*, professional:professionals!inner(*, user:users!inner(full_name, avatar_url))",
      )
      .single();

    if (error) {
      return apiError("CREATE_FAILED", error.message, 500);
    }

    // Send confirmation email (non-blocking)
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (user?.email) {
      sendConsultationConfirmation({
        to: user.email,
        patientName: user.full_name ?? "Paciente",
        professionalName:
          (consultation as any)?.professional?.user?.full_name ?? "Profissional",
        scheduledAt: body.scheduled_at,
        consultationId: consultation.id,
      }).catch(console.error);
    }

    return apiResponse(consultation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
