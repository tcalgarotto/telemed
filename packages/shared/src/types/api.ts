import type { User, Professional, ProfessionalAvailability } from "./database";

// Request types for API endpoints

export interface RegisterProfessionalRequest {
  specialty: string;
  license_number: string;
  bio?: string;
  years_experience?: number;
  consultation_price: number;
}

export interface UpdateProfessionalRequest {
  specialty?: string;
  bio?: string;
  consultation_price?: number;
}

export interface CreateAvailabilityRequest {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
}

export interface BookConsultationRequest {
  professional_id: string;
  scheduled_at: string;
  duration_minutes?: number;
}

export interface CreatePrescriptionRequest {
  consultation_id: string;
  medication_name: string;
  dosage: string;
  instructions?: string;
  valid_until: string;
}

export interface CreateSubscriptionRequest {
  plan_type: "monthly" | "annual";
  price_id: string;
}

export interface CreateCheckoutRequest {
  consultation_id?: string;
  amount: number;
  currency?: string;
}

// Response types with joined data

export interface ProfessionalWithUser extends Professional {
  user: Pick<User, "full_name" | "avatar_url">;
}

export interface ProfessionalWithAvailability extends ProfessionalWithUser {
  availability: ProfessionalAvailability[];
}
