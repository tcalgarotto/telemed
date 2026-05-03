import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/client";
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

    const { data: professional, error } = await supabaseAdmin
      .from("professionals")
      .select("*, user:users!inner(full_name, avatar_url)")
      .eq("id", id)
      .single();

    if (error || !professional) {
      return apiError("NOT_FOUND", "Professional not found", 404);
    }

    // Get availability
    const { data: availability } = await supabaseAdmin
      .from("professional_availability")
      .select("*")
      .eq("professional_id", id)
      .order("day_of_week");

    return apiResponse({
      ...professional,
      availability: availability ?? [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}
