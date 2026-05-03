import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiResponse, ApiError, PaginatedResponse } from "@telemed/shared";

export function apiResponse<T>(data: T, status: number = 200) {
  const body: ApiResponse<T> = { data, error: null };
  return NextResponse.json(body, { status });
}

export function apiPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  const body: PaginatedResponse<T> = {
    data,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  };
  return NextResponse.json(body);
}

export function apiError(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown,
) {
  const body: ApiError = {
    data: null,
    error: { code, message, details },
  };
  return NextResponse.json(body, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError(
      "VALIDATION_ERROR",
      "Invalid request data",
      400,
      error.flatten(),
    );
  }

  if (error instanceof Error) {
    console.error("API Error:", error.message);
    return apiError("INTERNAL_ERROR", error.message, 500);
  }

  console.error("Unknown API Error:", error);
  return apiError("INTERNAL_ERROR", "An unexpected error occurred", 500);
}
