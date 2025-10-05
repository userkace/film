import { t } from "i18next";

import { Icon, Icons } from "@/components/Icon";
import { Flare } from "@/components/utils/Flare";
import { Transition } from "@/components/utils/Transition";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { usePlayerStore } from "@/stores/player/store";

export function SpeedChangedPopout() {
  const isSpeedBoosted = usePlayerStore((s) => s.interface.isSpeedBoosted);
  const showSpeedIndicator = usePlayerStore(
    (s) => s.interface.showSpeedIndicator,
  );
  const currentOverlay = useOverlayStack((s) => s.currentOverlay);
  const playbackRate = usePlayerStore((s) => s.mediaPlaying.playbackRate);

  return (
    <Transition
      animation="slide-down"
      show={showSpeedIndicator && currentOverlay === "speed"}
      className="absolute inset-x-0 top-4 flex justify-center pointer-events-none"
    >
      <Flare.Base className="hover:flare-enabled pointer-events-auto bg-video-context-background pl-4 pr-6 py-3 group w-20 h-full rounded-lg transition-colors text-video-context-type-main">
        <Flare.Light
          enabled
          flareSize={200}
          cssColorVar="--colors-video-context-light"
          backgroundClass="bg-video-context-background duration-100"
          className="rounded-lg"
        />
        <Flare.Child className="grid grid-cols-[auto,1fr] gap-3 pointer-events-auto relative transition-transform">
          <Icon className="text-2xl" icon={Icons.TACHOMETER} />
          <div className="w-full flex items-center justify-between">
            <span className="text-sm">
              {isSpeedBoosted
                ? t("player.menus.playback.speedBoosted")
                : t("player.menus.playback.speedUnboosted", {
                    speed: playbackRate,
                  })}
            </span>
          </div>
        </Flare.Child>
      </Flare.Base>
    </Transition>
  );
}
