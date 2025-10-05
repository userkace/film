import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { Icons } from "@/components/Icon";
import { usePlayerMeta } from "@/components/player/hooks/usePlayerMeta";
import { VideoPlayerButton } from "@/components/player/internals/Button";
import { PlayerMeta } from "@/stores/player/slices/source";
import { usePlayerStore } from "@/stores/player/store";
import { useProgressStore } from "@/stores/progress";

interface SkipEpisodeButtonProps {
  inControl: boolean;
  onChange?: (meta: PlayerMeta) => void;
}

export function SkipEpisodeButton(props: SkipEpisodeButtonProps) {
  const { t } = useTranslation();
  const meta = usePlayerStore((s) => s.meta);
  const { setDirectMeta } = usePlayerMeta();
  const setShouldStartFromBeginning = usePlayerStore(
    (s) => s.setShouldStartFromBeginning,
  );
  const updateItem = useProgressStore((s) => s.updateItem);

  const nextEp = meta?.episodes?.find(
    (v) => v.number === (meta?.episode?.number ?? 0) + 1,
  );

  const loadNextEpisode = useCallback(() => {
    if (!meta || !nextEp) return;
    const metaCopy = { ...meta };
    metaCopy.episode = nextEp;
    setShouldStartFromBeginning(true);
    setDirectMeta(metaCopy);
    props.onChange?.(metaCopy);
    const defaultProgress = { duration: 0, watched: 0 };
    updateItem({
      meta: metaCopy,
      progress: defaultProgress,
    });
  }, [
    setDirectMeta,
    nextEp,
    meta,
    props,
    setShouldStartFromBeginning,
    updateItem,
  ]);

  // Don't show button if not in control, not a show, or no next episode
  if (!props.inControl) return null;
  if (!meta?.episode || !nextEp) return null;
  if (meta.type !== "show") return null;

  return (
    <VideoPlayerButton
      onClick={() => loadNextEpisode()}
      icon={Icons.SKIP_EPISODE}
      iconSizeClass="text-xl"
      className="hover:bg-video-buttonBackground hover:bg-opacity-50"
    />
  );
}
