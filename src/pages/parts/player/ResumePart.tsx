import { useTranslation } from "react-i18next";

import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { NextEpisodeButton } from "@/components/player/atoms/NextEpisodeButton";
import { Paragraph } from "@/components/text/Paragraph";
import { Title } from "@/components/text/Title";
import { ErrorContainer, ErrorLayout } from "@/pages/layouts/ErrorLayout";
import { PlayerMeta } from "@/stores/player/slices/source";
import { usePlayerStore } from "@/stores/player/store";
import { useProgressStore } from "@/stores/progress";

export interface ResumePartProps {
  onResume: () => void;
  onRestart: () => void;
  onMetaChange?: (meta: PlayerMeta) => void;
}

export function ResumePart(props: ResumePartProps) {
  const { t } = useTranslation();
  const meta = usePlayerStore((s) => s.meta);
  const progressItems = useProgressStore((s) => s.items);

  // Calculate watch percentage
  const watchPercentage = (() => {
    if (!meta?.tmdbId) return 0;

    const item = progressItems[meta.tmdbId];
    if (!item) return 0;

    if (meta.type === "movie") {
      if (!item.progress) return 0;
      return (item.progress.watched / item.progress.duration) * 100;
    }

    if (meta.type === "show" && meta.episode?.tmdbId) {
      const episode = item.episodes?.[meta.episode.tmdbId];
      if (!episode) return 0;
      return (episode.progress.watched / episode.progress.duration) * 100;
    }

    return 0;
  })();

  const roundedPercentage = Math.round(watchPercentage);

  return (
    <ErrorLayout>
      <ErrorContainer>
        <Title>{t("player.resume.title")}</Title>
        <Paragraph>
          {t("player.resume.description", { percentage: roundedPercentage })}
        </Paragraph>

        <div className="flex flex-col space-y-3 mt-6 w-full max-w-sm">
          <Button
            onClick={props.onResume}
            theme="purple"
            padding="md:px-12 p-2.5"
            className="w-full"
          >
            <Icon icon={Icons.PLAY} className="mr-2" />
            {t("player.resume.resume")}
          </Button>

          <Button
            onClick={props.onRestart}
            theme="secondary"
            padding="md:px-12 p-2.5"
            className="w-full"
          >
            <Icon icon={Icons.REPEAT} className="mr-2" />
            {t("player.resume.restart")}
          </Button>

          {meta?.type === "show" && (
            <div className="flex justify-center">
              <NextEpisodeButton
                controlsShowing={false}
                onChange={props.onMetaChange}
                inControl
                showAsButton
              />
            </div>
          )}
        </div>
      </ErrorContainer>
    </ErrorLayout>
  );
}
