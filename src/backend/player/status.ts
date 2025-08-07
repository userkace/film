import { AccountWithToken } from "@/stores/auth";

interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  hasPlayedOnce: boolean;
  time: number;
  duration: number;
  volume?: number;
  playbackRate: number;
  buffered: number;
}

interface ContentInfo {
  title: string;
  type: string;
  tmdbId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  seasonId?: number;
  episodeId?: number;
}

interface PlayerStatusRequest {
  userId: string;
  roomCode: string;
  isHost: boolean;
  content: ContentInfo;
  player: PlayerState;
}

interface PlayerStatusResponse {
  success: boolean;
  timestamp: number;
}

interface UserStatusResponse {
  userId: string;
  roomCode: string;
  statuses: Array<{
    userId: string;
    roomCode: string;
    isHost: boolean;
    content: ContentInfo;
    player: PlayerState;
    timestamp: number;
  }>;
}

interface RoomStatusesResponse {
  roomCode: string;
  users: Record<
    string,
    Array<{
      userId: string;
      roomCode: string;
      isHost: boolean;
      content: ContentInfo;
      player: PlayerState;
      timestamp: number;
    }>
  >;
}

/**
 * Send player status update to the backend
 */
export async function sendPlayerStatus(
  backendUrl: string | null,
  account: AccountWithToken | null,
  data: PlayerStatusRequest,
): Promise<PlayerStatusResponse> {
  if (!backendUrl) {
    throw new Error("Backend URL not set");
  }

  const response = await fetch(`${backendUrl}/api/player/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(account ? { Authorization: `Bearer ${account.token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to send player status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get player status for a specific user in a room
 */
export async function getUserPlayerStatus(
  backendUrl: string | null,
  account: AccountWithToken | null,
  userId: string,
  roomCode: string,
): Promise<UserStatusResponse> {
  if (!backendUrl) {
    throw new Error("Backend URL not set");
  }

  const response = await fetch(
    `${backendUrl}/api/player/status?userId=${encodeURIComponent(
      userId,
    )}&roomCode=${encodeURIComponent(roomCode)}`,
    {
      headers: account ? { Authorization: `Bearer ${account.token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to get user player status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get status for all users in a room
 */
export async function getRoomStatuses(
  backendUrl: string | null,
  account: AccountWithToken | null,
  roomCode: string,
): Promise<RoomStatusesResponse> {
  if (!backendUrl) {
    throw new Error("Backend URL not set");
  }

  const response = await fetch(
    `${backendUrl}/api/player/status?roomCode=${encodeURIComponent(roomCode)}`,
    {
      headers: account ? { Authorization: `Bearer ${account.token}` } : {},
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to get room statuses: ${response.statusText}`);
  }

  return response.json();
}
