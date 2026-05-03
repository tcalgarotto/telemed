import { describe, it, expect } from "vitest";
import { bookConsultationSchema } from "./index";

describe("bookConsultationSchema", () => {
  it("accepts a valid payload", () => {
    const result = bookConsultationSchema.safeParse({
      professional_id: "550e8400-e29b-41d4-a716-446655440000",
      scheduled_at: "2025-06-01T15:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid uuid", () => {
    const result = bookConsultationSchema.safeParse({
      professional_id: "not-a-uuid",
      scheduled_at: "2025-06-01T15:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});
