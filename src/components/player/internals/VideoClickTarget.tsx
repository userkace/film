import classNames from "classnames";
import { PointerEvent, useCallback, useRef, useState } from "react";
import { useEffectOnce, useTimeoutFn } from "react-use";

import { useShouldShowVideoElement } from "@/components/player/internals/VideoContainer";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { PlayerHoverState } from "@/stores/player/slices/interface";
import { usePlayerStore } from "@/stores/player/store";
import { usePreferencesStore } from "@/stores/preferences";
import { useWatchPartyStore } from "@/stores/watchParty";

export function VideoClickTarget(props: { showingControls: boolean }) {
  const show = useShouldShowVideoElement();
  const display = usePlayerStore((s) => s.display);
  const isPaused = usePlayerStore((s) => s.mediaPlaying.isPaused);
  const playbackRate = usePlayerStore((s) => s.mediaPlaying.playbackRate);
  const updateInterfaceHovering = usePlayerStore(
    (s) => s.updateInterfaceHovering,
  );
  const setSpeedBoosted = usePlayerStore((s) => s.setSpeedBoosted);
  const setShowSpeedIndicator = usePlayerStore((s) => s.setShowSpeedIndicator);
  const hovering = usePlayerStore((s) => s.interface.hovering);
  const setCurrentOverlay = useOverlayStack((s) => s.setCurrentOverlay);
  const isInWatchParty = useWatchPartyStore((s) => s.enabled);
  const enableHoldToBoost = usePreferencesStore((s) => s.enableHoldToBoost);

  const [_, cancel, reset] = useTimeoutFn(() => {
    updateInterfaceHovering(PlayerHoverState.NOT_HOVERING);
  }, 3000);
  useEffectOnce(() => {
    cancel();
  });

  const previousRateRef = useRef(playbackRate);
  const isHoldingRef = useRef(false);
  const speedIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const boostTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPendingBoost, setIsPendingBoost] = useState(false);

  const toggleFullscreen = useCallback(() => {
    display?.toggleFullscreen();
  }, [display]);

  const togglePause = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // Don't toggle pause if holding for speed change
      if (isHoldingRef.current) {
        isHoldingRef.current = false;
        return;
      }

      // Cancel any pending boost if we're clicking to pause
      if (isPendingBoost) {
        clearTimeout(boostTimeoutRef.current!);
        setIsPendingBoost(false);
        isHoldingRef.current = false;
      }

      // pause on mouse click
      if (e.pointerType === "mouse") {
        if (e.button !== 0) return;
        if (isPaused) display?.play();
        else display?.pause();
        return;
      }

      // toggle on other types of clicks
      if (hovering !== PlayerHoverState.MOBILE_TAPPED) {
        updateInterfaceHovering(PlayerHoverState.MOBILE_TAPPED);
        reset();
      } else {
        updateInterfaceHovering(PlayerHoverState.NOT_HOVERING);
        cancel();
      }
    },
    [
      display,
      isPaused,
      hovering,
      updateInterfaceHovering,
      reset,
      cancel,
      isPendingBoost,
    ],
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (
        ((e.pointerType === "mouse" && e.button === 0) ||
          e.pointerType === "touch") &&
        !isInWatchParty &&
        enableHoldToBoost
      ) {
        if (isPaused) return; // Don't boost if video is paused

        // Store current rate before changing
        previousRateRef.current = playbackRate;

        // Set a timeout before actually boosting speed
        if (boostTimeoutRef.current) {
          clearTimeout(boostTimeoutRef.current);
        }

        setIsPendingBoost(true);

        boostTimeoutRef.current = setTimeout(() => {
          // Only apply boost if we're still holding down
          isHoldingRef.current = true;
          setIsPendingBoost(false);

          // Show speed indicator
          setSpeedBoosted(true);
          setShowSpeedIndicator(true);
          setCurrentOverlay("speed");

          if (speedIndicatorTimeoutRef.current) {
            clearTimeout(speedIndicatorTimeoutRef.current);
          }

          // Set to 2x speed
          display?.setPlaybackRate(2);
        }, 300); // 300ms delay before boost takes effect
      }
    },
    [
      display,
      playbackRate,
      isPaused,
      setSpeedBoosted,
      setShowSpeedIndicator,
      setCurrentOverlay,
      isInWatchParty,
      enableHoldToBoost,
    ],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // If we have a pending boost that hasn't activated yet, clear it
      if (isPendingBoost) {
        clearTimeout(boostTimeoutRef.current!);
        setIsPendingBoost(false);
        togglePause(e);
        return;
      }

      if (
        isHoldingRef.current &&
        enableHoldToBoost &&
        ((e.pointerType === "mouse" && e.button === 0) ||
          e.pointerType === "touch")
      ) {
        // Restore previous rate
        display?.setPlaybackRate(previousRateRef.current);
        isHoldingRef.current = false;

        // Update state for speed indicator
        setSpeedBoosted(false);

        // Set a timeout to hide the speed indicator
        if (speedIndicatorTimeoutRef.current) {
          clearTimeout(speedIndicatorTimeoutRef.current);
        }

        speedIndicatorTimeoutRef.current = setTimeout(() => {
          setShowSpeedIndicator(false);
          setCurrentOverlay(null);
          speedIndicatorTimeoutRef.current = null;
        }, 1500);
      } else {
        // Regular click handler
        togglePause(e);
      }
    },
    [
      display,
      togglePause,
      setSpeedBoosted,
      setShowSpeedIndicator,
      setCurrentOverlay,
      isPendingBoost,
      enableHoldToBoost,
    ],
  );

  // Handle case where mouse leaves the player while still pressed
  const handlePointerLeave = useCallback(() => {
    // Clear pending boost if mouse leaves
    if (isPendingBoost) {
      clearTimeout(boostTimeoutRef.current!);
      setIsPendingBoost(false);
    }

    if (isHoldingRef.current) {
      display?.setPlaybackRate(previousRateRef.current);
      isHoldingRef.current = false;

      // Update state for speed indicator
      setSpeedBoosted(false);

      // Set a timeout to hide the speed indicator
      if (speedIndicatorTimeoutRef.current) {
        clearTimeout(speedIndicatorTimeoutRef.current);
      }

      speedIndicatorTimeoutRef.current = setTimeout(() => {
        setShowSpeedIndicator(false);
        setCurrentOverlay(null);
        speedIndicatorTimeoutRef.current = null;
      }, 1500);
    }
  }, [
    display,
    setSpeedBoosted,
    setShowSpeedIndicator,
    setCurrentOverlay,
    isPendingBoost,
  ]);

  if (!show) return null;

  return (
    <div
      className={classNames("absolute inset-0", {
        "absolute inset-0": true,
        "cursor-none": !props.showingControls,
      })}
      onDoubleClick={toggleFullscreen}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    />
  );
}
