import { t } from "i18next";
import { useEffect, useRef } from "react";

import { getRoomStatuses, sendPlayerStatus } from "@/backend/player/status";
import { usePlayerStatusPolling } from "@/components/player/hooks/usePlayerStatusPolling";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { useAuthStore } from "@/stores/auth";
import { usePlayerStore } from "@/stores/player/store";
import { useWatchPartyStore } from "@/stores/watchParty";

// Event for content validation status
const VALIDATION_EVENT = "watchparty:validation";
export const emitValidationStatus = (success: boolean) => {
  window.dispatchEvent(
    new CustomEvent(VALIDATION_EVENT, { detail: { success } }),
  );
};

/**
 * Component that sends player status to the backend when watch party is enabled
 */
export function WatchPartyReporter() {
  const { statusHistory, latestStatus } = usePlayerStatusPolling(5); // Keep last 5 status points
  const lastReportTime = useRef<number>(0);
  const lastReportedStateRef = useRef<string>("");
  const contentValidatedRef = useRef<boolean>(false);

  // Auth data
  const account = useAuthStore((s) => s.account);
  const userId = account?.userId || "guest";
  const backendUrl = useBackendUrl();

  // Player metadata
  const meta = usePlayerStore((s) => s.meta);

  // Watch party state
  const {
    enabled: watchPartyEnabled,
    roomCode,
    isHost,
    disable,
  } = useWatchPartyStore();

  // Reset validation state when watch party is disabled
  useEffect(() => {
    if (!watchPartyEnabled) {
      contentValidatedRef.current = false;
    }
  }, [watchPartyEnabled]);

  // Validate content matches when joining a room
  useEffect(() => {
    const validateContent = async () => {
      if (
        !watchPartyEnabled ||
        !roomCode ||
        !meta?.tmdbId ||
        isHost ||
        contentValidatedRef.current
      )
        return;

      try {
        const roomData = await getRoomStatuses(backendUrl, account, roomCode);
        const users = Object.values(roomData.users).flat();
        const hostUser = users.find((user) => user.isHost);

        if (hostUser && hostUser.content.tmdbId) {
          const hostTmdbId = hostUser.content.tmdbId;
          const currentTmdbId = parseInt(meta.tmdbId, 10);

          // Check base content ID (movie or show)
          if (hostTmdbId !== currentTmdbId) {
            console.error("Content mismatch - disconnecting from watch party", {
              hostContent: hostTmdbId,
              currentContent: currentTmdbId,
            });
            disable();
            emitValidationStatus(false);
            // eslint-disable-next-line no-alert
            alert(t("watchParty.contentMismatch"));
            return;
          }

          // Check season and episode IDs for TV shows
          if (meta.type === "show" && hostUser.content.type === "TV Show") {
            const hostSeasonId = hostUser.content.seasonId;
            const hostEpisodeId = hostUser.content.episodeId;
            const currentSeasonId = meta.season?.tmdbId
              ? parseInt(meta.season.tmdbId, 10)
              : undefined;
            const currentEpisodeId = meta.episode?.tmdbId
              ? parseInt(meta.episode.tmdbId, 10)
              : undefined;

            // Validate episode match (if host has this info)
            if (
              (hostSeasonId &&
                currentSeasonId &&
                hostSeasonId !== currentSeasonId) ||
              (hostEpisodeId &&
                currentEpisodeId &&
                hostEpisodeId !== currentEpisodeId)
            ) {
              console.error(
                "Episode mismatch - disconnecting from watch party",
                {
                  host: { seasonId: hostSeasonId, episodeId: hostEpisodeId },
                  current: {
                    seasonId: currentSeasonId,
                    episodeId: currentEpisodeId,
                  },
                },
              );
              disable();
              emitValidationStatus(false);
              // eslint-disable-next-line no-alert
              alert(t("watchParty.episodeMismatch"));
              return;
            }
          }
        }

        contentValidatedRef.current = true;
        emitValidationStatus(true);
      } catch (error) {
        console.error("Failed to validate watch party content:", error);
        disable();
        emitValidationStatus(false);
      }
    };

    validateContent();
  }, [
    watchPartyEnabled,
    roomCode,
    meta?.tmdbId,
    meta?.season?.tmdbId,
    meta?.episode?.tmdbId,
    meta?.type,
    isHost,
    backendUrl,
    account,
    disable,
  ]);

  useEffect(() => {
    // Skip if watch party is not enabled
    if (
      !watchPartyEnabled ||
      !latestStatus ||
      !latestStatus.hasPlayedOnce ||
      !roomCode ||
      (!isHost && !contentValidatedRef.current) // Don't send updates until content is validated for non-hosts
    )
      return;

    const now = Date.now();

    // Create a state fingerprint to detect meaningful changes
    // Use more precise time tracking (round to nearest second) to detect smaller changes
    const stateFingerprint = JSON.stringify({
      isPlaying: latestStatus.isPlaying,
      isPaused: latestStatus.isPaused,
      isLoading: latestStatus.isLoading,
      time: Math.floor(latestStatus.time), // Track seconds directly
      // volume: Math.round(latestStatus.volume * 100),
      playbackRate: latestStatus.playbackRate,
    });

    // Check if state has changed meaningfully OR
    // it's been at least 2 seconds since last report
    const hasStateChanged = stateFingerprint !== lastReportedStateRef.current;
    const timeThresholdMet = now - lastReportTime.current >= 10000; // Less frequent updates (10s)

    // Always update more frequently if we're the host to ensure guests stay in sync
    const shouldUpdateForHost = isHost && now - lastReportTime.current >= 1000;

    if (!hasStateChanged && !timeThresholdMet && !shouldUpdateForHost) return;

    // Prepare content information
    let contentTitle = "Unknown content";
    let contentType = "Unknown";

    if (meta) {
      if (meta.type === "movie") {
        contentTitle = meta.title;
        contentType = "Movie";
      } else if (meta.type === "show" && meta.episode) {
        contentTitle = `${meta.title} - S${meta.season?.number || 0}E${meta.episode.number || 0}`;
        contentType = "TV Show";
      }
    }

    // Send player status to backend API
    const sendStatusToBackend = async () => {
      try {
        await sendPlayerStatus(backendUrl, account, {
          userId,
          roomCode,
          isHost,
          content: {
            title: contentTitle,
            type: contentType,
            tmdbId: meta?.tmdbId ? Number(meta.tmdbId) : 0,
            seasonId: meta?.season?.tmdbId
              ? Number(meta.season.tmdbId)
              : undefined,
            episodeId: meta?.episode?.tmdbId
              ? Number(meta.episode.tmdbId)
              : undefined,
            seasonNumber: meta?.season?.number,
            episodeNumber: meta?.episode?.number,
          },
          player: {
            isPlaying: latestStatus.isPlaying,
            isPaused: latestStatus.isPaused,
            isLoading: latestStatus.isLoading,
            hasPlayedOnce: latestStatus.hasPlayedOnce,
            time: latestStatus.time,
            duration: latestStatus.duration,
            // volume: latestStatus.volume,
            playbackRate: latestStatus.playbackRate,
            buffered: latestStatus.buffered,
          },
        });

        // Update last report time and fingerprint
        lastReportTime.current = now;
        lastReportedStateRef.current = stateFingerprint;

        // eslint-disable-next-line no-console
        console.log("Sent player status update to backend", {
          time: new Date().toISOString(),
          isPlaying: latestStatus.isPlaying,
          currentTime: Math.floor(latestStatus.time),
          userId,
          content: contentTitle,
          roomCode,
        });
      } catch (error) {
        console.error("Failed to send player status to backend", error);
      }
    };

    sendStatusToBackend();
  }, [
    latestStatus,
    statusHistory.length,
    userId,
    account,
    meta,
    watchPartyEnabled,
    roomCode,
    isHost,
    backendUrl,
  ]);

  return null;
}
