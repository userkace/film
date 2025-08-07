import { useEffect, useState } from "react";

import { Icons } from "@/components/Icon";
import { DetailsModal } from "@/components/overlays/detailsModal";
import { useModal } from "@/components/overlays/Modal";
import { usePlayerStore } from "@/stores/player/store";
import { usePreferencesStore } from "@/stores/preferences";

import { VideoPlayerButton } from "./Button";

export function InfoButton() {
  const meta = usePlayerStore((s) => s.meta);
  const modal = useModal("player-details");
  const setHasOpenOverlay = usePlayerStore((s) => s.setHasOpenOverlay);
  const [detailsData, setDetailsData] = useState<{
    id: number;
    type: "movie" | "show";
  } | null>(null);

  useEffect(() => {
    setHasOpenOverlay(modal.isShown);
  }, [setHasOpenOverlay, modal.isShown]);

  const handleClick = async () => {
    if (!meta?.tmdbId) return;

    setDetailsData({
      id: Number(meta.tmdbId),
      type: meta.type === "movie" ? "movie" : "show",
    });
    modal.show();
  };

  const enableLowPerformanceMode = usePreferencesStore(
    (state) => state.enableLowPerformanceMode,
  );

  if (enableLowPerformanceMode) {
    return null;
  }

  return (
    <>
      <VideoPlayerButton
        icon={Icons.CIRCLE_QUESTION}
        iconSizeClass="text-base"
        className="p-2 !-mr-2"
        onClick={handleClick}
      />
      {detailsData && (
        <DetailsModal id="player-details" data={detailsData} minimal />
      )}
    </>
  );
}
