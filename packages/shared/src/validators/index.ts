import { z } from "zod";
import {
  USER_ROLES,
  PROFESSIONAL_STATUSES,
  CONSULTATION_STATUSES,
  PRESCRIPTION_STATUSES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  PAYMENT_TYPES,
  PAYMENT_STATUSES,
  DEFAULT_CONSULTATION_DURATION,
  MAX_CONSULTATION_DURATION,
  MIN_CONSULTATION_DURATION,
} from "../constants";

// --- Users ---
export const updateUserSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  avatar_url: z.string().url().optional(),
});

// --- Professionals ---
export const registerProfessionalSchema = z.object({
  specialty: z.string().min(2).max(100),
  license_number: z.string().min(3).max(50),
  bio: z.string().max(500).optional(),
  years_experience: z.number().int().min(0).max(60).optional(),
  consultation_price: z.number().positive().max(10000),
});

export const updateProfessionalSchema = z.object({
  specialty: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  consultation_price: z.number().positive().max(10000).optional(),
});

export const createAvailabilitySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
  is_recurring: z.boolean(),
});

// --- Consultations ---
export const bookConsultationSchema = z.object({
  professional_id: z.string().uuid(),
  scheduled_at: z.string().datetime(),
  duration_minutes: z
    .number()
    .int()
    .min(MIN_CONSULTATION_DURATION)
    .max(MAX_CONSULTATION_DURATION)
    .default(DEFAULT_CONSULTATION_DURATION),
});

export const updateConsultationSchema = z.object({
  status: z.enum(CONSULTATION_STATUSES).optional(),
  notes: z.string().max(5000).optional(),
});

// --- Prescriptions ---
export const createPrescriptionSchema = z.object({
  consultation_id: z.string().uuid(),
  medication_name: z.string().min(2).max(200),
  dosage: z.string().min(1).max(100),
  instructions: z.string().max(1000).optional(),
  valid_until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

// --- Payments ---
export const createCheckoutSchema = z.object({
  consultation_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("BRL"),
});

export const createSubscriptionSchema = z.object({
  plan_type: z.enum(SUBSCRIPTION_PLANS),
  price_id: z.string().min(1),
});

// --- Video ---
export const createRoomSchema = z.object({
  consultation_id: z.string().uuid(),
});

export const roomTokenSchema = z.object({
  room_url: z.string().url(),
  user_name: z.string().min(1).max(100),
});
