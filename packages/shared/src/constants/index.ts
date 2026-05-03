export const USER_ROLES = ["patient", "professional", "admin"] as const;

export const PROFESSIONAL_STATUSES = [
  "pending",
  "active",
  "suspended",
] as const;

export const CONSULTATION_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const PRESCRIPTION_STATUSES = [
  "active",
  "expired",
  "cancelled",
] as const;

export const SUBSCRIPTION_PLANS = ["monthly", "annual"] as const;

export const SUBSCRIPTION_STATUSES = [
  "active",
  "canceled",
  "past_due",
] as const;

export const PAYMENT_TYPES = [
  "subscription",
  "consultation",
  "medication",
] as const;

export const PAYMENT_STATUSES = ["pending", "succeeded", "failed"] as const;

export const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DEFAULT_CONSULTATION_DURATION = 30; // minutes
export const MAX_CONSULTATION_DURATION = 120;
export const MIN_CONSULTATION_DURATION = 15;
