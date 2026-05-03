import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/client";
import { registerProfessionalSchema } from "@telemed/shared";
import { apiResponse, apiError, handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const { data: professionals, error } = await supabaseAdmin
      .from("professionals")
      .select("*, user:users!inner(full_name, avatar_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return apiError("FETCH_FAILED", error.message, 500);
    }

    return apiResponse(professionals);
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

    const body = registerProfessionalSchema.parse(await request.json());

    // Update user role to professional
    await supabaseAdmin
      .from("users")
      .update({ role: "professional" })
      .eq("id", userId);

    const { data: professional, error } = await supabaseAdmin
      .from("professionals")
      .insert({
        user_id: userId,
        ...body,
      })
      .select()
      .single();

    if (error) {
      return apiError("CREATE_FAILED", error.message, 500);
    }

    return apiResponse(professional, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
