import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase/client";
import { createPrescriptionSchema } from "@telemed/shared";
import { apiResponse, apiError, handleApiError } from "@/lib/api-utils";
import { sendPrescriptionReady } from "@/lib/resend/client";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const { data: prescriptions, error } = await supabaseAdmin
      .from("prescriptions")
      .select(
        "*, consultation:consultations!inner(scheduled_at), professional:professionals!inner(user:users!inner(full_name))",
      )
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return apiError("FETCH_FAILED", error.message, 500);
    }

    return apiResponse(prescriptions);
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

    const body = createPrescriptionSchema.parse(await request.json());

    // Verify the user is the professional for this consultation
    const { data: consultation } = await supabaseAdmin
      .from("consultations")
      .select("id, patient_id, professional_id")
      .eq("id", body.consultation_id)
      .single();

    if (!consultation) {
      return apiError("NOT_FOUND", "Consultation not found", 404);
    }

    const { data: professional } = await supabaseAdmin
      .from("professionals")
      .select("user_id")
      .eq("id", consultation.professional_id)
      .single();

    if (professional?.user_id !== userId) {
      return apiError("FORBIDDEN", "Only the professional can create prescriptions", 403);
    }

    // Generate PDF URL (placeholder - actual PDF generation would be added later)
    const pdfUrl = `prescriptions/${consultation.patient_id}/${body.consultation_id}-${Date.now()}.pdf`;

    const { data: prescription, error } = await supabaseAdmin
      .from("prescriptions")
      .insert({
        consultation_id: body.consultation_id,
        professional_id: consultation.professional_id,
        patient_id: consultation.patient_id,
        medication_name: body.medication_name,
        dosage: body.dosage,
        instructions: body.instructions,
        valid_until: body.valid_until,
        pdf_url: pdfUrl,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return apiError("CREATE_FAILED", error.message, 500);
    }

    // Send email notification
    const { data: patient } = await supabaseAdmin
      .from("users")
      .select("email, full_name")
      .eq("id", consultation.patient_id)
      .single();

    if (patient?.email) {
      sendPrescriptionReady({
        to: patient.email,
        patientName: patient.full_name ?? "Paciente",
        prescriptionId: prescription.id,
      }).catch(console.error);
    }

    return apiResponse(prescription, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
