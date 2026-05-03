import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/client";
import { updateConsultationSchema } from "@telemed/shared";
import { apiResponse, apiError, handleApiError } from "@/lib/api-utils";

export async function GET(
  _request: Request,
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
      .select(
        "*, professional:professionals!inner(*, user:users!inner(full_name, avatar_url))",
      )
      .eq("id", id)
      .single();

    if (error || !consultation) {
      return apiError("NOT_FOUND", "Consultation not found", 404);
    }

    return apiResponse(consultation);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const { id } = await params;
    const body = updateConsultationSchema.parse(await request.json());

    // Verify ownership (patient or professional)
    const { data: consultation } = await supabaseAdmin
      .from("consultations")
      .select("patient_id, professional_id")
      .eq("id", id)
      .single();

    if (!consultation) {
      return apiError("NOT_FOUND", "Consultation not found", 404);
    }

    const { data: professional } = await supabaseAdmin
      .from("professionals")
      .select("user_id")
      .eq("id", consultation.professional_id)
      .single();

    const isPatient = consultation.patient_id === userId;
    const isProfessional = professional?.user_id === userId;

    if (!isPatient && !isProfessional) {
      return apiError("FORBIDDEN", "Not authorized", 403);
    }

    const { data: updated, error } = await supabaseAdmin
      .from("consultations")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return apiError("UPDATE_FAILED", error.message, 500);
    }

    return apiResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
