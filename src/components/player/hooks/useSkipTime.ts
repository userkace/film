import { useEffect, useState } from "react";

import { usePlayerMeta } from "@/components/player/hooks/usePlayerMeta";
import { conf } from "@/setup/config";
import { usePreferencesStore } from "@/stores/preferences";

// Thanks Nemo for this API
const BASE_URL = "https://fed-skips.pstream.mov";
const MAX_RETRIES = 3;

export function useSkipTime() {
  const { playerMeta: meta } = usePlayerMeta();
  const [skiptime, setSkiptime] = useState<number | null>(null);
  const febboxKey = usePreferencesStore((s) => s.febboxKey);

  useEffect(() => {
    const fetchSkipTime = async (retries = 0): Promise<void> => {
      if (!meta?.imdbId || meta.type === "movie") return;
      if (!conf().ALLOW_FEBBOX_KEY) return;
      if (!febboxKey) return;

      try {
        const apiUrl = `${BASE_URL}/${meta.imdbId}/${meta.season?.number}/${meta.episode?.number}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          if (response.status === 500 && retries < MAX_RETRIES) {
            return fetchSkipTime(retries + 1);
          }
          throw new Error("API request failed");
        }

        const data = await response.json();

        const parseSkipTime = (timeStr: string | undefined): number | null => {
          if (!timeStr || typeof timeStr !== "string") return null;
          const match = timeStr.match(/^(\d+)s$/);
          if (!match) return null;
          return parseInt(match[1], 10);
        };

        const skipTime = parseSkipTime(data.introSkipTime);

        // eslint-disable-next-line no-console
        console.log("Skip time:", skipTime);
        setSkiptime(skipTime);
      } catch (error) {
        console.error("Error fetching skip time:", error);
        setSkiptime(null);
      }
    };

    fetchSkipTime();
  }, [
    meta?.tmdbId,
    meta?.imdbId,
    meta?.type,
    meta?.season?.number,
    meta?.episode?.number,
    febboxKey,
  ]);

  return skiptime;
}
