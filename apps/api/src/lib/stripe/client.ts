import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
  typescript: true,
});

export async function createCheckoutSession(params: {
  customerEmail: string;
  userId: string;
  priceId: string;
  mode: "subscription" | "payment";
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    customer_email: params.customerEmail,
    client_reference_id: params.userId,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: params.mode,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      user_id: params.userId,
      ...params.metadata,
    },
  });
}

export async function createPaymentIntent(params: {
  amount: number;
  currency?: string;
  userId: string;
  metadata?: Record<string, string>;
}) {
  return stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency ?? "brl",
    metadata: {
      user_id: params.userId,
      ...params.metadata,
    },
  });
}
