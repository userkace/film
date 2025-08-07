/* eslint-disable no-console */
import { useCallback, useEffect, useRef, useState } from "react";

// import { getRoomStatuses, getUserPlayerStatus } from "@/backend/player/status";
import { getRoomStatuses } from "@/backend/player/status";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { useAuthStore } from "@/stores/auth";
import { usePlayerStore } from "@/stores/player/store";
import { useWatchPartyStore } from "@/stores/watchParty";

interface RoomUser {
  userId: string;
  isHost: boolean;
  lastUpdate: number;
  player: {
    isPlaying: boolean;
    isPaused: boolean;
    time: number;
    duration: number;
  };
  content: {
    title: string;
    type: string;
    tmdbId?: number;
    seasonId?: number;
    episodeId?: number;
    seasonNumber?: number;
    episodeNumber?: number;
  };
}

interface WatchPartySyncResult {
  // All users in the room
  roomUsers: RoomUser[];
  // The host user (if any)
  hostUser: RoomUser | null;
  // Whether our player is behind the host
  isBehindHost: boolean;
  // Whether our player is ahead of the host
  isAheadOfHost: boolean;
  // Seconds difference from host (positive means ahead, negative means behind)
  timeDifferenceFromHost: number;
  // Function to sync with host
  syncWithHost: () => void;
  // Whether we are currently syncing
  isSyncing: boolean;
  // Manually refresh room data
  refreshRoomData: () => Promise<void>;
  // Current user count in room
  userCount: number;
}

/**
 * Hook for syncing with other users in a watch party room
 */
export function useWatchPartySync(
  syncThresholdSeconds = 5,
): WatchPartySyncResult {
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userCount, setUserCount] = useState(1);

  // Refs for tracking state
  const syncStateRef = useRef({
    lastUserCount: 1,
    previousHostPlaying: null as boolean | null,
    previousHostTime: null as number | null,
    lastSyncTime: 0,
    syncInProgress: false,
    checkedUrlParams: false,
    prevRoomUsers: [] as RoomUser[],
  });

  // Get our auth and backend info
  const account = useAuthStore((s) => s.account);
  const backendUrl = useBackendUrl();

  // Get player store functions
  const display = usePlayerStore((s) => s.display);
  const currentTime = usePlayerStore((s) => s.progress.time);
  const isPlaying = usePlayerStore((s) => s.mediaPlaying.isPlaying);
  // Get watch party state
  const { roomCode, isHost, enabled, enableAsGuest } = useWatchPartyStore();

  // Check URL parameters for watch party code
  useEffect(() => {
    if (syncStateRef.current.checkedUrlParams) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const watchPartyCode = params.get("watchparty");

      if (watchPartyCode && !enabled && watchPartyCode.length > 0) {
        enableAsGuest(watchPartyCode);
      }

      syncStateRef.current.checkedUrlParams = true;
    } catch (error) {
      console.error("Failed to check URL parameters for watch party:", error);
    }
  }, [enabled, enableAsGuest]);

  // Find the host user in the room
  const hostUser = roomUsers.find((user) => user.isHost) || null;

  // Calculate predicted host time by accounting for elapsed time since update
  const getPredictedHostTime = useCallback(() => {
    if (!hostUser) return 0;

    const millisecondsSinceUpdate = Date.now() - hostUser.lastUpdate;
    const secondsSinceUpdate = millisecondsSinceUpdate / 1000;

    return hostUser.player.isPlaying && !hostUser.player.isPaused
      ? hostUser.player.time + secondsSinceUpdate
      : hostUser.player.time;
  }, [hostUser]);

  // Calculate time difference from host
  const timeDifferenceFromHost = hostUser
    ? currentTime - getPredictedHostTime()
    : 0;

  // Determine if we're ahead or behind the host
  const isBehindHost =
    hostUser && !isHost && timeDifferenceFromHost < -syncThresholdSeconds;
  const isAheadOfHost =
    hostUser && !isHost && timeDifferenceFromHost > syncThresholdSeconds;

  // Function to sync with host
  const syncWithHost = useCallback(() => {
    if (!hostUser || isHost || !display || syncStateRef.current.syncInProgress)
      return;

    syncStateRef.current.syncInProgress = true;
    setIsSyncing(true);

    const predictedHostTime = getPredictedHostTime();
    display.setTime(predictedHostTime);

    setTimeout(() => {
      if (hostUser.player.isPlaying && !hostUser.player.isPaused) {
        display.play();
      } else {
        display.pause();
      }

      setTimeout(() => {
        setIsSyncing(false);
        syncStateRef.current.syncInProgress = false;
      }, 500);

      syncStateRef.current.lastSyncTime = Date.now();
    }, 200);
  }, [hostUser, isHost, display, getPredictedHostTime]);

  // Combined effect for syncing time and play/pause state
  useEffect(() => {
    if (!hostUser || isHost || !display || syncStateRef.current.syncInProgress)
      return;

    const state = syncStateRef.current;
    const hostIsPlaying =
      hostUser.player.isPlaying && !hostUser.player.isPaused;
    const predictedHostTime = getPredictedHostTime();
    const difference = currentTime - predictedHostTime;

    // Handle time sync
    const activeThreshold = isPlaying ? 2 : 5;
    const needsTimeSync = Math.abs(difference) > activeThreshold;

    // Handle play state sync
    const needsPlayStateSync =
      state.previousHostPlaying !== null &&
      state.previousHostPlaying !== hostIsPlaying;

    // Handle time jumps
    const needsJumpSync =
      state.previousHostTime !== null &&
      Math.abs(hostUser.player.time - state.previousHostTime) > 5;

    // Sync if needed
    if ((needsTimeSync || needsPlayStateSync || needsJumpSync) && !isSyncing) {
      state.syncInProgress = true;
      setIsSyncing(true);

      // Sync time
      display.setTime(predictedHostTime);

      // Then sync play state after a short delay
      setTimeout(() => {
        if (hostIsPlaying) {
          display.play();
        } else {
          display.pause();
        }

        // Clear syncing flags
        setTimeout(() => {
          setIsSyncing(false);
          state.syncInProgress = false;
        }, 500);
      }, 200);
    }

    // Update state refs
    state.previousHostPlaying = hostIsPlaying;
    state.previousHostTime = hostUser.player.time;
  }, [
    hostUser,
    isHost,
    currentTime,
    display,
    isSyncing,
    getPredictedHostTime,
    isPlaying,
  ]);

  // Function to refresh room data
  const refreshRoomData = useCallback(async () => {
    if (!enabled || !roomCode || !backendUrl) return;

    try {
      const response = await getRoomStatuses(backendUrl, account, roomCode);
      const users: RoomUser[] = [];

      // Process each user's latest status
      Object.entries(response.users).forEach(
        ([userIdFromResponse, statuses]) => {
          if (statuses.length > 0) {
            // Get the latest status (sort by timestamp DESC)
            const latestStatus = [...statuses].sort(
              (a, b) => b.timestamp - a.timestamp,
            )[0];

            users.push({
              userId: userIdFromResponse,
              isHost: latestStatus.isHost,
              lastUpdate: latestStatus.timestamp,
              player: {
                isPlaying: latestStatus.player.isPlaying,
                isPaused: latestStatus.player.isPaused,
                time: latestStatus.player.time,
                duration: latestStatus.player.duration,
              },
              content: {
                title: latestStatus.content.title,
                type: latestStatus.content.type,
                tmdbId: latestStatus.content.tmdbId,
                seasonId: latestStatus.content.seasonId,
                episodeId: latestStatus.content.episodeId,
                seasonNumber: latestStatus.content.seasonNumber,
                episodeNumber: latestStatus.content.episodeNumber,
              },
            });
          }
        },
      );

      // Sort users with host first, then by lastUpdate
      users.sort((a, b) => {
        if (a.isHost && !b.isHost) return -1;
        if (!a.isHost && b.isHost) return 1;
        return b.lastUpdate - a.lastUpdate;
      });

      // Update user count if changed
      const newUserCount = users.length;
      if (newUserCount !== syncStateRef.current.lastUserCount) {
        setUserCount(newUserCount);
        syncStateRef.current.lastUserCount = newUserCount;
      }

      // Update room users
      syncStateRef.current.prevRoomUsers = users;
      setRoomUsers(users);
    } catch (error) {
      console.error("Failed to refresh room data:", error);
    }
  }, [backendUrl, account, roomCode, enabled]);

  // Periodically refresh room data
  useEffect(() => {
    // Store reference to current syncState for cleanup
    const syncState = syncStateRef.current;

    if (!enabled || !roomCode) {
      setRoomUsers([]);
      setUserCount(1);

      // Reset all state
      syncState.lastUserCount = 1;
      syncState.prevRoomUsers = [];
      syncState.previousHostPlaying = null;
      syncState.previousHostTime = null;
      return;
    }

    // Initial fetch
    refreshRoomData();

    // Set up interval - refresh every 2 seconds
    const interval = setInterval(refreshRoomData, 2000);

    return () => {
      clearInterval(interval);
      setRoomUsers([]);
      setUserCount(1);

      // Use captured reference from outer scope
      syncState.previousHostPlaying = null;
      syncState.previousHostTime = null;
    };
  }, [enabled, roomCode, refreshRoomData]);

  return {
    roomUsers,
    hostUser,
    isBehindHost: !!isBehindHost,
    isAheadOfHost: !!isAheadOfHost,
    timeDifferenceFromHost,
    syncWithHost,
    isSyncing,
    refreshRoomData,
    userCount,
  };
}
