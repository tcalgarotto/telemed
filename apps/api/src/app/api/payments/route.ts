import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/client";
import {
  createCheckoutSchema,
  createSubscriptionSchema,
} from "@telemed/shared";
import { apiResponse, apiError, handleApiError } from "@/lib/api-utils";
import { createCheckoutSession } from "@/lib/stripe/client";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const body = createSubscriptionSchema.parse(await request.json());

    // Get user email
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (!user?.email) {
      return apiError("NO_EMAIL", "User email required for subscription", 400);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

    const session = await createCheckoutSession({
      customerEmail: user.email,
      userId,
      priceId: body.price_id,
      mode: "subscription",
      successUrl: `${appUrl}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/api/payments/cancel`,
      metadata: {
        plan_type: body.plan_type,
      },
    });

    if (!session.url) {
      return apiError("STRIPE_ERROR", "Failed to create checkout session", 500);
    }

    return apiResponse({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST_checkout(request: Request) {
  // Alternative endpoint for one-time payment
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const body = createCheckoutSchema.parse(await request.json());

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

    const session = await createCheckoutSession({
      customerEmail: "", // Will be collected by Stripe
      userId,
      priceId: "", // Direct amount instead
      mode: "payment",
      successUrl: `${appUrl}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/api/payments/cancel`,
      metadata: {
        type: "consultation",
        consultation_id: body.consultation_id ?? "",
      },
    });

    if (!session.url) {
      return apiError("STRIPE_ERROR", "Failed to create checkout session", 500);
    }

    return apiResponse({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}
