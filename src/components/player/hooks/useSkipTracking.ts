import { useCallback, useEffect, useRef, useState } from "react";

import { usePlayerStore } from "@/stores/player/store";

interface SkipEvent {
  startTime: number;
  endTime: number;
  skipDuration: number;
  timestamp: number;
  meta?: {
    title: string;
    type: string;
    tmdbId?: string;
    seasonNumber?: number;
    episodeNumber?: number;
  };
}

interface SkipTrackingResult {
  /** Array of skip events detected */
  skipHistory: SkipEvent[];
  /** The most recent skip event */
  latestSkip: SkipEvent | null;
  /** Clear the skip history */
  clearHistory: () => void;
}

/**
 * Hook that tracks when users skip or scrub more than 15 seconds
 * Useful for gathering information about show intros and user behavior
 *
 * @param minSkipThreshold Minimum skip duration in seconds to track (default: 15)
 * @param maxHistory Maximum number of skip events to keep in history (default: 50)
 */
export function useSkipTracking(
  minSkipThreshold: number = 15,
  maxHistory: number = 50,
): SkipTrackingResult {
  const [skipHistory, setSkipHistory] = useState<SkipEvent[]>([]);
  const previousTimeRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  // Get current player state
  const progress = usePlayerStore((s) => s.progress);
  const mediaPlaying = usePlayerStore((s) => s.mediaPlaying);
  const meta = usePlayerStore((s) => s.meta);
  const isSeeking = usePlayerStore((s) => s.interface.isSeeking);

  // Track seeking state to avoid false positives during drag seeking
  useEffect(() => {
    isSeekingRef.current = isSeeking;
  }, [isSeeking]);

  const clearHistory = useCallback(() => {
    setSkipHistory([]);
    previousTimeRef.current = 0;
    lastUpdateTimeRef.current = 0;
  }, []);

  const detectSkip = useCallback(() => {
    const now = Date.now();
    const currentTime = progress.time;

    // Don't track if video hasn't started playing or if we're actively seeking
    if (!mediaPlaying.hasPlayedOnce || isSeekingRef.current) {
      previousTimeRef.current = currentTime;
      lastUpdateTimeRef.current = now;
      return;
    }

    // Initialize on first run
    if (previousTimeRef.current === 0) {
      previousTimeRef.current = currentTime;
      lastUpdateTimeRef.current = now;
      return;
    }

    const timeDelta = currentTime - previousTimeRef.current;
    const realTimeDelta = now - lastUpdateTimeRef.current;

    // Calculate expected time change based on playback rate and real time passed
    const expectedTimeDelta = mediaPlaying.isPlaying
      ? (realTimeDelta / 1000) * mediaPlaying.playbackRate
      : 0;

    // Detect if the time jump is significantly different from expected
    // This accounts for normal playback, pausing, and small buffering hiccups
    const unexpectedJump = Math.abs(timeDelta - expectedTimeDelta);

    // Only consider it a skip if:
    // 1. The time jump is greater than our threshold
    // 2. The unexpected jump is significant (more than 3 seconds difference from expected)
    // 3. We're not in a seeking state
    if (Math.abs(timeDelta) >= minSkipThreshold && unexpectedJump >= 3) {
      const skipEvent: SkipEvent = {
        startTime: previousTimeRef.current,
        endTime: currentTime,
        skipDuration: timeDelta,
        timestamp: now,
        meta: meta
          ? {
              title:
                meta.type === "show" && meta.episode
                  ? `${meta.title} - S${meta.season?.number || 0}E${meta.episode.number || 0}`
                  : meta.title,
              type: meta.type === "movie" ? "Movie" : "TV Show",
              tmdbId: meta.tmdbId,
              seasonNumber: meta.season?.number,
              episodeNumber: meta.episode?.number,
            }
          : undefined,
      };

      setSkipHistory((prev) => {
        const newHistory = [...prev, skipEvent];
        return newHistory.length > maxHistory
          ? newHistory.slice(newHistory.length - maxHistory)
          : newHistory;
      });
    }

    previousTimeRef.current = currentTime;
    lastUpdateTimeRef.current = now;
  }, [progress.time, mediaPlaying, meta, minSkipThreshold, maxHistory]);

  useEffect(() => {
    // Run detection every second when video is playing
    const interval = setInterval(() => {
      if (mediaPlaying.hasPlayedOnce) {
        detectSkip();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [detectSkip, mediaPlaying.hasPlayedOnce]);

  // Reset tracking when content changes
  useEffect(() => {
    clearHistory();
  }, [meta?.tmdbId, clearHistory]);

  return {
    skipHistory,
    latestSkip:
      skipHistory.length > 0 ? skipHistory[skipHistory.length - 1] : null,
    clearHistory,
  };
}
