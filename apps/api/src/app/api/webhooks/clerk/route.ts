import { NextResponse } from "next/server";
import { verifyClerkWebhook } from "@/lib/clerk/webhook";
import { supabaseAdmin } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const event = await verifyClerkWebhook(request);

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, phone_numbers, first_name, last_name, image_url } = event.data;

        const primaryEmail = email_addresses?.[0]?.email_address ?? null;
        const primaryPhone = phone_numbers?.[0]?.phone_number ?? null;
        const fullName =
          first_name || last_name
            ? `${first_name ?? ""} ${last_name ?? ""}`.trim()
            : null;

        await supabaseAdmin
          .from("users")
          .upsert({
            id,
            email: primaryEmail,
            phone: primaryPhone,
            full_name: fullName,
            avatar_url: image_url,
            role: "patient", // Default role
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        break;
      }

      case "user.deleted": {
        const { id } = event.data;

        if (id) {
          await supabaseAdmin.from("users").delete().eq("id", id);
        }

        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }
}
