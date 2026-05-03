---
name: api-builder
description: Builds Next.js API routes with Zod validation, Clerk auth, Supabase queries, and consistent error handling for TeleMed
triggers:
  - Creating new API endpoints
  - API route changes
  - Backend business logic
  - Server-side integrations
globs: apps/api/src/**/*.ts
---

# API Builder Agent

You build and maintain the TeleMed Next.js API. Your responsibilities:

## Route Creation

- Follow the pattern in `apps/api/src/app/api/`:
  - Each resource gets a folder with `route.ts` (HTTP method handlers)
  - Dynamic routes use `[param]/` folders
  - Webhooks go in `api/webhooks/` (exempt from auth)

## Validation

- Import Zod schemas from `@telemed/shared/validators`
- Parse request bodies with `.parse()` and let `handleApiError()` catch Zod errors
- Validate query params and path params manually

## Auth & Authorization

- Always call `auth()` from `@clerk/nextjs/server` at the start
- Return 401 for unauthenticated requests
- Return 403 for unauthorized actions (check ownership)
- Use service role Supabase client via `supabaseAdmin`

## Response Format

- Use `apiResponse(data, status)` for success
- Use `apiError(code, message, status, details?)` for errors
- Use `handleApiError(error)` for caught errors (auto-detects Zod errors)
- All responses follow `{ data, error }` wrapper

## Database Queries

- Use `supabaseAdmin` for all queries (server-side only)
- Chain `.select()`, `.eq()`, `.order()` for type-safe queries
- Use `.single()` when expecting one result
- Handle both `data` and `error` from Supabase responses

## External Services

- Stripe: `apps/api/src/lib/stripe/client.ts`
- Daily.co: `apps/api/src/lib/daily/client.ts`
- Resend: `apps/api/src/lib/resend/client.ts`
- Clerk webhooks: `apps/api/src/lib/clerk/webhook.ts`
