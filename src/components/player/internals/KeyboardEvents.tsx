import { useEffect, useRef, useState } from "react";

import { useCaptions } from "@/components/player/hooks/useCaptions";
import { useVolume } from "@/components/player/hooks/useVolume";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { usePlayerStore } from "@/stores/player/store";
import { usePreferencesStore } from "@/stores/preferences";
import { useSubtitleStore } from "@/stores/subtitles";
import { useEmpheralVolumeStore } from "@/stores/volume";
import { useWatchPartyStore } from "@/stores/watchParty";

export function KeyboardEvents() {
  const router = useOverlayRouter("");
  const display = usePlayerStore((s) => s.display);
  const mediaProgress = usePlayerStore((s) => s.progress);
  const { isSeeking } = usePlayerStore((s) => s.interface);
  const mediaPlaying = usePlayerStore((s) => s.mediaPlaying);
  const time = usePlayerStore((s) => s.progress.time);
  const { setVolume, toggleMute } = useVolume();
  const isInWatchParty = useWatchPartyStore((s) => s.enabled);

  const { toggleLastUsed } = useCaptions();
  const setShowVolume = useEmpheralVolumeStore((s) => s.setShowVolume);
  const setDelay = useSubtitleStore((s) => s.setDelay);
  const delay = useSubtitleStore((s) => s.delay);
  const setShowDelayIndicator = useSubtitleStore(
    (s) => s.setShowDelayIndicator,
  );
  const enableHoldToBoost = usePreferencesStore((s) => s.enableHoldToBoost);

  const [isRolling, setIsRolling] = useState(false);
  const volumeDebounce = useRef<ReturnType<typeof setTimeout> | undefined>();
  const subtitleDebounce = useRef<ReturnType<typeof setTimeout> | undefined>();

  // Speed boost
  const setSpeedBoosted = usePlayerStore((s) => s.setSpeedBoosted);
  const setShowSpeedIndicator = usePlayerStore((s) => s.setShowSpeedIndicator);
  const speedIndicatorTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | undefined
  >();
  const boostTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();
  const isPendingBoostRef = useRef<boolean>(false);
  const previousRateRef = useRef<number>(1);
  const isSpaceHeldRef = useRef<boolean>(false);

  const setCurrentOverlay = useOverlayStack((s) => s.setCurrentOverlay);

  const dataRef = useRef({
    setShowVolume,
    setVolume,
    toggleMute,
    setIsRolling,
    toggleLastUsed,
    display,
    mediaPlaying,
    mediaProgress,
    isSeeking,
    isRolling,
    time,
    router,
    setDelay,
    delay,
    setShowDelayIndicator,
    setCurrentOverlay,
    isInWatchParty,
    previousRateRef,
    isSpaceHeldRef,
    setSpeedBoosted,
    setShowSpeedIndicator,
    speedIndicatorTimeoutRef,
    boostTimeoutRef,
    isPendingBoostRef,
    enableHoldToBoost,
  });

  useEffect(() => {
    dataRef.current = {
      setShowVolume,
      setVolume,
      toggleMute,
      setIsRolling,
      toggleLastUsed,
      display,
      mediaPlaying,
      mediaProgress,
      isSeeking,
      isRolling,
      time,
      router,
      setDelay,
      delay,
      setShowDelayIndicator,
      setCurrentOverlay,
      isInWatchParty,
      previousRateRef,
      isSpaceHeldRef,
      setSpeedBoosted,
      setShowSpeedIndicator,
      speedIndicatorTimeoutRef,
      boostTimeoutRef,
      isPendingBoostRef,
      enableHoldToBoost,
    };
  }, [
    setShowVolume,
    setVolume,
    toggleMute,
    setIsRolling,
    toggleLastUsed,
    display,
    mediaPlaying,
    mediaProgress,
    isSeeking,
    isRolling,
    time,
    router,
    setDelay,
    delay,
    setShowDelayIndicator,
    setCurrentOverlay,
    isInWatchParty,
    setSpeedBoosted,
    setShowSpeedIndicator,
    enableHoldToBoost,
  ]);

  useEffect(() => {
    const keydownEventHandler = (evt: KeyboardEvent) => {
      if (evt.target && (evt.target as HTMLInputElement).nodeName === "INPUT")
        return;

      const k = evt.key;
      const keyL = evt.key.toLowerCase();

      // Volume
      if (["ArrowUp", "ArrowDown", "m", "M"].includes(k)) {
        dataRef.current.setShowVolume(true);
        dataRef.current.setCurrentOverlay("volume");

        if (volumeDebounce.current) clearTimeout(volumeDebounce.current);
        volumeDebounce.current = setTimeout(() => {
          dataRef.current.setShowVolume(false);
          dataRef.current.setCurrentOverlay(null);
        }, 3e3);
      }
      if (k === "ArrowUp")
        dataRef.current.setVolume(
          (dataRef.current.mediaPlaying?.volume || 0) + 0.15,
        );
      if (k === "ArrowDown")
        dataRef.current.setVolume(
          (dataRef.current.mediaPlaying?.volume || 0) - 0.15,
        );
      if (keyL === "m") dataRef.current.toggleMute();

      // Video playback speed - disabled in watch party
      if ((k === ">" || k === "<") && !dataRef.current.isInWatchParty) {
        const options = [0.25, 0.5, 1, 1.5, 2];
        let idx = options.indexOf(dataRef.current.mediaPlaying?.playbackRate);
        if (idx === -1) idx = options.indexOf(1);
        const nextIdx = idx + (k === ">" ? 1 : -1);
        const next = options[nextIdx];
        if (next) dataRef.current.display?.setPlaybackRate(next);
      }

      // Handle spacebar press for play/pause and hold for 2x speed - disabled in watch party or when hold to boost is disabled
      if (
        k === " " &&
        !dataRef.current.isInWatchParty &&
        dataRef.current.enableHoldToBoost
      ) {
        // Skip if a button is targeted
        if (
          evt.target &&
          (evt.target as HTMLInputElement).nodeName === "BUTTON"
        ) {
          return;
        }

        // Prevent the default spacebar behavior
        evt.preventDefault();

        // If already paused, play the video and return
        if (dataRef.current.mediaPlaying.isPaused) {
          dataRef.current.display?.play();
          return;
        }

        // If we're already holding space, don't trigger boost again
        if (dataRef.current.isSpaceHeldRef.current) {
          return;
        }

        // Save current rate
        dataRef.current.previousRateRef.current =
          dataRef.current.mediaPlaying.playbackRate;

        // Set pending boost flag
        dataRef.current.isPendingBoostRef.current = true;

        // Add delay before boosting speed
        if (dataRef.current.boostTimeoutRef.current) {
          clearTimeout(dataRef.current.boostTimeoutRef.current);
        }

        dataRef.current.boostTimeoutRef.current = setTimeout(() => {
          // Only apply boost if the key is still held down
          if (dataRef.current.isPendingBoostRef.current) {
            dataRef.current.isSpaceHeldRef.current = true;
            dataRef.current.isPendingBoostRef.current = false;

            // Show speed indicator
            dataRef.current.setSpeedBoosted(true);
            dataRef.current.setShowSpeedIndicator(true);
            dataRef.current.setCurrentOverlay("speed");

            // Clear any existing timeout
            if (dataRef.current.speedIndicatorTimeoutRef.current) {
              clearTimeout(dataRef.current.speedIndicatorTimeoutRef.current);
            }

            dataRef.current.display?.setPlaybackRate(2);
          }
        }, 300); // 300ms delay before boost takes effect
      }

      // Handle spacebar press for simple play/pause when hold to boost is disabled or in watch party mode
      if (
        k === " " &&
        (!dataRef.current.enableHoldToBoost || dataRef.current.isInWatchParty)
      ) {
        // Skip if a button is targeted
        if (
          evt.target &&
          (evt.target as HTMLInputElement).nodeName === "BUTTON"
        ) {
          return;
        }

        // Prevent the default spacebar behavior
        evt.preventDefault();

        // Simple play/pause toggle
        const action = dataRef.current.mediaPlaying.isPaused ? "play" : "pause";
        dataRef.current.display?.[action]();
      }

      // Video progress
      if (k === "ArrowRight")
        dataRef.current.display?.setTime(dataRef.current.time + 5);
      if (k === "ArrowLeft")
        dataRef.current.display?.setTime(dataRef.current.time - 5);
      if (keyL === "j")
        dataRef.current.display?.setTime(dataRef.current.time - 10);
      if (keyL === "l")
        dataRef.current.display?.setTime(dataRef.current.time + 10);
      if (k === "." && dataRef.current.mediaPlaying?.isPaused)
        dataRef.current.display?.setTime(dataRef.current.time + 1);
      if (k === "," && dataRef.current.mediaPlaying?.isPaused)
        dataRef.current.display?.setTime(dataRef.current.time - 1);

      // Utils
      if (keyL === "f") dataRef.current.display?.toggleFullscreen();

      // Remove duplicate spacebar handler that was conflicting
      // with our improved implementation
      if (keyL === "k" && !dataRef.current.isSpaceHeldRef.current) {
        if (
          evt.target &&
          (evt.target as HTMLInputElement).nodeName === "BUTTON"
        ) {
          return;
        }

        const action = dataRef.current.mediaPlaying.isPaused ? "play" : "pause";
        dataRef.current.display?.[action]();
      }
      if (k === "Escape") dataRef.current.router.close();

      // captions
      if (keyL === "c") dataRef.current.toggleLastUsed().catch(() => {}); // ignore errors

      // Do a barrell roll!
      if (keyL === "r") {
        if (dataRef.current.isRolling || evt.ctrlKey || evt.metaKey) return;

        dataRef.current.setIsRolling(true);
        document.querySelector(".popout-location")?.classList.add("roll");
        document.body.setAttribute("data-no-scroll", "true");

        setTimeout(() => {
          document.querySelector(".popout-location")?.classList.remove("roll");
          document.body.removeAttribute("data-no-scroll");
          dataRef.current.setIsRolling(false);
        }, 1e3);
      }

      // Subtitle sync
      if (k === "[" || k === "]") {
        const change = k === "[" ? -0.5 : 0.5;
        dataRef.current.setDelay(dataRef.current.delay + change);
        dataRef.current.setShowDelayIndicator(true);
        dataRef.current.setCurrentOverlay("subtitle");

        if (subtitleDebounce.current) clearTimeout(subtitleDebounce.current);
        subtitleDebounce.current = setTimeout(() => {
          dataRef.current.setShowDelayIndicator(false);
          dataRef.current.setCurrentOverlay(null);
        }, 3000);
      }
    };

    const keyupEventHandler = (evt: KeyboardEvent) => {
      const k = evt.key;

      // Handle spacebar release - only handle speed boost logic when not in watch party and hold to boost is enabled
      if (
        k === " " &&
        !dataRef.current.isInWatchParty &&
        dataRef.current.enableHoldToBoost
      ) {
        // If we haven't applied the boost yet but were about to, cancel it
        if (dataRef.current.isPendingBoostRef.current) {
          dataRef.current.isPendingBoostRef.current = false;
          if (dataRef.current.boostTimeoutRef.current) {
            clearTimeout(dataRef.current.boostTimeoutRef.current);
          }

          // The space key was released quickly, so trigger play/pause
          const action = dataRef.current.mediaPlaying.isPaused
            ? "play"
            : "pause";
          dataRef.current.display?.[action]();
        } else if (dataRef.current.isSpaceHeldRef.current) {
          // We were in boost mode, restore previous rate
          dataRef.current.display?.setPlaybackRate(
            dataRef.current.previousRateRef.current,
          );
          dataRef.current.isSpaceHeldRef.current = false;

          // Update UI state
          dataRef.current.setSpeedBoosted(false);

          // Set a timeout to hide the speed indicator
          if (dataRef.current.speedIndicatorTimeoutRef.current) {
            clearTimeout(dataRef.current.speedIndicatorTimeoutRef.current);
          }

          dataRef.current.speedIndicatorTimeoutRef.current = setTimeout(() => {
            dataRef.current.setShowSpeedIndicator(false);
            dataRef.current.setCurrentOverlay(null);
          }, 1500);
        }
      }
    };

    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("keyup", keyupEventHandler);

    return () => {
      window.removeEventListener("keydown", keydownEventHandler);
      window.removeEventListener("keyup", keyupEventHandler);
    };
  }, []);

  return null;
}
