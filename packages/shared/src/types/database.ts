// Database row types - mirror Supabase tables

export type UserRole = "patient" | "professional" | "admin";

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type ProfessionalStatus = "pending" | "active" | "suspended";

export interface Professional {
  id: string;
  user_id: string;
  specialty: string;
  license_number: string;
  license_document_url: string | null;
  bio: string | null;
  years_experience: number | null;
  status: ProfessionalStatus;
  consultation_price: number;
  created_at: string;
}

export interface ProfessionalAvailability {
  id: string;
  professional_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  is_recurring: boolean;
}

export type ConsultationStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Consultation {
  id: string;
  patient_id: string;
  professional_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: ConsultationStatus;
  daily_room_url: string | null;
  notes: string | null;
  created_at: string;
}

export type PrescriptionStatus = "active" | "expired" | "cancelled";

export interface Prescription {
  id: string;
  consultation_id: string;
  professional_id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  instructions: string | null;
  valid_until: string;
  status: PrescriptionStatus;
  pdf_url: string | null;
  created_at: string;
}

export type SubscriptionPlan = "monthly" | "annual";
export type SubscriptionStatus = "active" | "canceled" | "past_due";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan_type: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
}

export type PaymentType = "subscription" | "consultation" | "medication";
export type PaymentStatus = "pending" | "succeeded" | "failed";

export interface Payment {
  id: string;
  user_id: string;
  consultation_id: string | null;
  amount: number;
  currency: string;
  stripe_payment_intent_id: string;
  type: PaymentType;
  status: PaymentStatus;
  created_at: string;
}
