import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/client";
import { updateUserSchema } from "@telemed/shared";
import { apiResponse, apiError, handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return apiError("NOT_FOUND", "User not found", 404);
    }

    return apiResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const body = updateUserSchema.parse(await request.json());

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return apiError("UPDATE_FAILED", error.message, 500);
    }

    return apiResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}
