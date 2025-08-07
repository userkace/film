import { useEffect, useRef } from "react";

import { useSkipTracking } from "@/components/player/hooks/useSkipTracking";
import { usePlayerStore } from "@/stores/player/store";

/**
 * Component that tracks when users skip or scrub more than 15 seconds
 * Useful for gathering information about show intros and user behavior patterns
 * Currently logs to console - can be extended to send to backend analytics endpoint
 */
export function SkipTracker() {
  const { skipHistory, latestSkip } = useSkipTracking(15); // Track skips > 15 seconds
  const lastLoggedSkipRef = useRef<number>(0);

  // Player metadata for context
  const meta = usePlayerStore((s) => s.meta);

  useEffect(() => {
    if (!latestSkip || !meta) return;

    // Avoid logging the same skip multiple times
    if (latestSkip.timestamp === lastLoggedSkipRef.current) return;

    // Format skip duration for readability
    const formatDuration = (seconds: number): string => {
      const absSeconds = Math.abs(seconds);
      const minutes = Math.floor(absSeconds / 60);
      const remainingSeconds = Math.floor(absSeconds % 60);

      if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${remainingSeconds}s`;
    };

    // Format time position for readability
    const formatTime = (seconds: number): string => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const skipDirection = latestSkip.skipDuration > 0 ? "forward" : "backward";
    const skipType = Math.abs(latestSkip.skipDuration) >= 30 ? "scrub" : "skip";

    // Log the skip event with detailed information
    // eslint-disable-next-line no-console
    console.log(`User ${skipType.toUpperCase()} detected`, {
      // Basic skip info
      direction: skipDirection,
      duration: formatDuration(latestSkip.skipDuration),
      from: formatTime(latestSkip.startTime),
      to: formatTime(latestSkip.endTime),

      // Content context
      content: {
        title: latestSkip.meta?.title || "Unknown",
        type: latestSkip.meta?.type || "Unknown",
        tmdbId: latestSkip.meta?.tmdbId,
      },

      // Episode context (for TV shows)
      ...(meta.type === "show" && {
        episode: {
          season: latestSkip.meta?.seasonNumber,
          episode: latestSkip.meta?.episodeNumber,
        },
      }),

      // Analytics data that could be sent to backend
      analytics: {
        timestamp: new Date(latestSkip.timestamp).toISOString(),
        startTime: latestSkip.startTime,
        endTime: latestSkip.endTime,
        skipDuration: latestSkip.skipDuration,
        contentId: latestSkip.meta?.tmdbId,
        contentType: latestSkip.meta?.type,
        seasonId: meta.season?.tmdbId,
        episodeId: meta.episode?.tmdbId,
      },
    });

    // Log special cases that might indicate intro skipping
    if (
      meta.type === "show" &&
      latestSkip.startTime <= 30 && // Skip happened in first 30 seconds
      latestSkip.skipDuration > 15 && // Forward skip of at least 15 seconds
      latestSkip.skipDuration <= 120 // But not more than 2 minutes (reasonable intro length)
    ) {
      // eslint-disable-next-line no-console
      console.log(`Potential intro skip dete`, {
        show: latestSkip.meta?.title,
        season: latestSkip.meta?.seasonNumber,
        episode: latestSkip.meta?.episodeNumber,
        introSkipDuration: formatDuration(latestSkip.skipDuration),
        message: "User likely skipped intro sequence",
      });
    }

    // Log potential outro/credits skipping
    const progress = usePlayerStore.getState().progress;
    const timeRemaining = progress.duration - latestSkip.endTime;
    if (
      latestSkip.skipDuration > 0 && // Forward skip
      timeRemaining <= 300 && // Within last 5 minutes
      latestSkip.skipDuration >= 15
    ) {
      // eslint-disable-next-line no-console
      console.log(`Potential outro skip detected`, {
        content: latestSkip.meta?.title,
        timeRemaining: formatDuration(timeRemaining),
        skipDuration: formatDuration(latestSkip.skipDuration),
        message: "User likely skipped credits/outro",
      });
    }

    lastLoggedSkipRef.current = latestSkip.timestamp;
  }, [latestSkip, meta]);

  // Log summary statistics occasionally... just for testing, we likely wont use it unless useful.
  useEffect(() => {
    if (skipHistory.length > 0 && skipHistory.length % 5 === 0) {
      const forwardSkips = skipHistory.filter((s) => s.skipDuration > 0);
      const backwardSkips = skipHistory.filter((s) => s.skipDuration < 0);
      const avgSkipDuration =
        skipHistory.reduce((sum, s) => sum + Math.abs(s.skipDuration), 0) /
        skipHistory.length;

      // eslint-disable-next-line no-console
      console.log(`skip analytics`, {
        totalSkips: skipHistory.length,
        forwardSkips: forwardSkips.length,
        backwardSkips: backwardSkips.length,
        averageSkipDuration: `${Math.round(avgSkipDuration)}s`,
        content: meta?.title || "Unknown",
      });
    }
  }, [skipHistory.length, skipHistory, meta?.title]);

  // TODO: When backend endpoint is ready, replace console.log with API calls
  // Example implementation:
  /*
  useEffect(() => {
    if (!latestSkip || !account?.userId) return;
    
    // Send skip data to analytics endpoint
    const sendSkipAnalytics = async () => {
      try {
        await fetch(`${backendUrl}/api/analytics/skips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: account.userId,
            skipData: latestSkip,
            contentContext: {
              tmdbId: meta?.tmdbId,
              type: meta?.type,
              seasonId: meta?.season?.tmdbId,
              episodeId: meta?.episode?.tmdbId,
            }
          })
        });
      } catch (error) {
        console.error('Failed to send skip analytics:', error);
      }
    };
    
    sendSkipAnalytics();
  }, [latestSkip, account?.userId, meta]);
  */

  return null;
}
