import Stripe from "stripe";

const API_VERSION = "2025-02-24.acacia" as const;

function resolveStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (key) return key;
  if (process.env.GITHUB_ACTIONS === "true") {
    return "sk_test_ci000000000000000000000000000000000000000000000000000000";
  }
  throw new Error("STRIPE_SECRET_KEY must be set at runtime.");
}

let stripeSingleton: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(resolveStripeSecretKey(), {
      apiVersion: API_VERSION,
      typescript: true,
    });
  }
  return stripeSingleton;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
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
