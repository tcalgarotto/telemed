const DAILY_API_URL = "https://api.daily.co/v1";

function resolveDailyApiKey(): string {
  const key = process.env.DAILY_API_KEY?.trim();
  if (key) return key;
  if (process.env.GITHUB_ACTIONS === "true") {
    return "ci_daily_placeholder";
  }
  throw new Error("DAILY_API_KEY must be set at runtime.");
}

interface DailyRoomResponse {
  id: string;
  name: string;
  url: string;
  created_at: string;
  privacy: string;
}

interface DailyTokenResponse {
  token: string;
}

async function dailyFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${DAILY_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${resolveDailyApiKey()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Daily.co API error: ${response.status} - ${error}`);
  }

  return response.json() as Promise<T>;
}

export async function createDailyRoom(roomName: string): Promise<DailyRoomResponse> {
  return dailyFetch<DailyRoomResponse>("/rooms", {
    method: "POST",
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        start_video_off: false,
        start_audio_off: false,
        exp: Math.round(Date.now() / 1000) + 86400, // 24 hours
      },
    }),
  });
}

export async function getDailyRoomToken(
  roomName: string,
  userName: string,
  isOwner: boolean = false,
): Promise<string> {
  const response = await dailyFetch<DailyTokenResponse>("/meeting-tokens", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: userName,
        is_owner: isOwner,
        exp: Math.round(Date.now() / 1000) + 86400,
      },
    }),
  });

  return response.token;
}

export async function deleteDailyRoom(roomName: string): Promise<void> {
  await dailyFetch(`/rooms/${roomName}`, { method: "DELETE" });
}
