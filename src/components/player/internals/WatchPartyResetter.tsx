import { useEffect, useMemo, useRef } from "react";

import { usePlayerStore } from "@/stores/player/store";
import { useWatchPartyStore } from "@/stores/watchParty";

/**
 * Component that detects when the player exits or media changes
 * and resets the watch party state
 */
export function WatchPartyResetter() {
  const meta = usePlayerStore((s) => s.meta);
  const { disable } = useWatchPartyStore();

  // Store the current meta to track changes
  const previousMetaRef = useRef<string | null>(null);

  // Memoize the metaId calculation
  const metaId = useMemo(() => {
    if (!meta) return null;

    return meta.type === "show"
      ? `${meta.type}-${meta.tmdbId}-s${meta.season?.tmdbId || "0"}-e${meta.episode?.tmdbId || "0"}`
      : `${meta.type}-${meta.tmdbId}`;
  }, [meta]);

  useEffect(() => {
    // If meta exists but has changed, reset watch party
    if (
      metaId &&
      previousMetaRef.current &&
      metaId !== previousMetaRef.current
    ) {
      // eslint-disable-next-line no-console
      console.log("Media changed, disabling watch party:", {
        previous: previousMetaRef.current,
        current: metaId,
      });
      disable();
    }

    // Update the ref with current meta
    previousMetaRef.current = metaId;

    // Also reset when component unmounts (player exited)
    return () => {
      disable();
    };
  }, [metaId, disable]);

  return null; // This component doesn't render anything
}
