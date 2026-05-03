import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const authOptions = {
  autoRefreshToken: false,
  persistSession: false,
} as const;

/** Local Supabase default; only used when env is missing during GitHub Actions build. */
const CI_BUILD_PLACEHOLDER_URL = "http://127.0.0.1:54321";
const CI_BUILD_PLACEHOLDER_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.ci-build-placeholder";

function resolveSupabaseConfig(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (url && key) {
    return { url, key };
  }

  // `next build` loads API route modules; GitHub Actions often has no secrets on forks.
  if (process.env.GITHUB_ACTIONS === "true") {
    return { url: CI_BUILD_PLACEHOLDER_URL, key: CI_BUILD_PLACEHOLDER_KEY };
  }

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set at runtime.",
  );
}

let adminClient: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const { url, key } = resolveSupabaseConfig();
    adminClient = createClient(url, key, { auth: authOptions });
  }
  return adminClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export function createServerSupabase(authToken: string): SupabaseClient {
  const { url, key } = resolveSupabaseConfig();
  return createClient(url, key, {
    auth: authOptions,
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  });
}
