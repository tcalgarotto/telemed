import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { supabaseAdmin } from "@/lib/supabase/client";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) return;

  const paymentType =
    session.metadata?.type ??
    (session.mode === "subscription" ? "subscription" : "consultation");

  await supabaseAdmin.from("payments").insert({
    user_id: userId,
    consultation_id: session.metadata?.consultation_id ?? null,
    amount: (session.amount_total ?? 0) / 100,
    currency: session.currency ?? "brl",
    stripe_payment_intent_id: (session.payment_intent as string) ?? session.id,
    type: paymentType,
    status: "succeeded",
  });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  await supabaseAdmin
    .from("payments")
    .update({ status: "succeeded" })
    .eq("stripe_payment_intent_id", paymentIntent.id);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  await supabaseAdmin.from("subscriptions").upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    plan_type: subscription.items.data[0]?.price.recurring?.interval === "year" ? "annual" : "monthly",
    status: subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "canceled",
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });
}
