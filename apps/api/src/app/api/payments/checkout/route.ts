import { auth } from "@clerk/nextjs/server";
import { createCheckoutSchema } from "@telemed/shared";
import { apiResponse, apiError, handleApiError } from "@/lib/api-utils";
import { createCheckoutSession } from "@/lib/stripe/client";

/** One-time payment checkout (e.g. consultation). */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const body = createCheckoutSchema.parse(await request.json());

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

    const session = await createCheckoutSession({
      customerEmail: "",
      userId,
      priceId: "",
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
