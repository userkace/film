import { useTranslation } from "react-i18next";

import { Icon, Icons } from "@/components/Icon";
import { Flare } from "@/components/utils/Flare";
import { Transition } from "@/components/utils/Transition";
import { usePlayerStore } from "@/stores/player/store";

import { hasAired } from "../utils/aired";

export function UnreleasedEpisodeOverlay() {
  const { t } = useTranslation();
  const meta = usePlayerStore((s) => s.meta);
  const status = usePlayerStore((s) => s.status);

  if (
    status !== "scraping" ||
    !meta?.episode?.air_date ||
    hasAired(meta.episode.air_date)
  ) {
    return null;
  }

  return (
    <Transition
      animation="slide-down"
      show
      className="absolute inset-x-0 top-4 flex justify-center pointer-events-none"
    >
      <Flare.Base className="hover:flare-enabled pointer-events-auto bg-video-context-background pl-4 pr-6 py-3 group w-72 h-full rounded-lg transition-colors text-video-context-type-main">
        <Flare.Light
          enabled
          flareSize={200}
          cssColorVar="--colors-video-context-light"
          backgroundClass="bg-video-context-background duration-100"
          className="rounded-lg"
        />
        <Flare.Child className="grid grid-cols-[auto,1fr] gap-3 pointer-events-auto relative transition-transform">
          <Icon className="text-2xl" icon={Icons.FILM} />
          <div className="w-full flex items-center justify-between">
            <span className="text-sm">
              {t("media.unreleased")} -{" "}
              {new Date(meta.episode.air_date).toLocaleDateString()}
            </span>
          </div>
        </Flare.Child>
      </Flare.Base>
    </Transition>
  );
}
