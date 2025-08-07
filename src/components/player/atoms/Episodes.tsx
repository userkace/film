import classNames from "classnames";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAsync } from "react-use";

import { getMetaFromId } from "@/backend/metadata/getmeta";
import { MWMediaType, MWSeasonMeta } from "@/backend/metadata/types/mw";
import { Icon, Icons } from "@/components/Icon";
import { ProgressRing } from "@/components/layout/ProgressRing";
import { OverlayAnchor } from "@/components/overlays/OverlayAnchor";
import { Overlay } from "@/components/overlays/OverlayDisplay";
import { OverlayPage } from "@/components/overlays/OverlayPage";
import { OverlayRouter } from "@/components/overlays/OverlayRouter";
import { usePlayerMeta } from "@/components/player/hooks/usePlayerMeta";
import { VideoPlayerButton } from "@/components/player/internals/Button";
import { Menu } from "@/components/player/internals/ContextMenu";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { PlayerMeta } from "@/stores/player/slices/source";
import { usePlayerStore } from "@/stores/player/store";
import { usePreferencesStore } from "@/stores/preferences";
import { useProgressStore } from "@/stores/progress";

import { hasAired } from "../utils/aired";

function CenteredText(props: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex justify-center items-center p-8 text-center">
      {props.children}
    </div>
  );
}

function useSeasonData(mediaId: string, seasonId: string) {
  const [seasons, setSeason] = useState<MWSeasonMeta[] | null>(null);

  const state = useAsync(async () => {
    const data = await getMetaFromId(MWMediaType.SERIES, mediaId, seasonId);
    if (data?.meta.type !== MWMediaType.SERIES) return null;
    setSeason(data.meta.seasons);
    return {
      season: data.meta.seasonData,
      fullData: data,
    };
  }, [mediaId, seasonId]);

  return [state, seasons] as const;
}

function SeasonsView({
  selectedSeason,
  setSeason,
}: {
  selectedSeason: string;
  setSeason: (id: string) => void;
}) {
  const { t } = useTranslation();
  const meta = usePlayerStore((s) => s.meta);
  const [loadingState, seasons] = useSeasonData(
    meta?.tmdbId ?? "",
    selectedSeason,
  );

  let content: ReactNode = null;
  if (seasons) {
    content = (
      <Menu.Section className="pb-6">
        {seasons?.map((season) => {
          return (
            <Menu.ChevronLink
              key={season.id}
              onClick={() => setSeason(season.id)}
            >
              {season.title}
            </Menu.ChevronLink>
          );
        })}
      </Menu.Section>
    );
  } else if (loadingState.error)
    content = (
      <CenteredText>{t("player.menus.episodes.loadingError")}</CenteredText>
    );
  else if (loadingState.loading)
    content = (
      <CenteredText>{t("player.menus.episodes.loadingList")}</CenteredText>
    );

  return (
    <Menu.CardWithScrollable>
      <Menu.Title>
        {meta?.title ?? t("player.menus.episodes.loadingTitle")}
      </Menu.Title>
      {content}
    </Menu.CardWithScrollable>
  );
}

export function EpisodesView({
  id,
  selectedSeason,
  goBack,
  onChange,
}: {
  id: string;
  selectedSeason: string;
  goBack?: () => void;
  onChange?: (meta: PlayerMeta) => void;
}) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const { setPlayerMeta } = usePlayerMeta();
  const meta = usePlayerStore((s) => s.meta);
  const [loadingState] = useSeasonData(meta?.tmdbId ?? "", selectedSeason);
  const progress = useProgressStore();
  const updateItem = useProgressStore((s) => s.updateItem);
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeEpisodeRef = useRef<HTMLDivElement>(null);
  const [expandedEpisodes, setExpandedEpisodes] = useState<{
    [key: string]: boolean;
  }>({});
  const [truncatedEpisodes, setTruncatedEpisodes] = useState<{
    [key: string]: boolean;
  }>({});
  const descriptionRefs = useRef<{
    [key: string]: HTMLParagraphElement | null;
  }>({});
  const forceCompactEpisodeView = usePreferencesStore(
    (s) => s.forceCompactEpisodeView,
  );

  const isTextTruncated = (element: HTMLElement | null) => {
    if (!element) return false;
    return element.scrollHeight > element.clientHeight;
  };

  // Check truncation after render and when expanded state changes
  useEffect(() => {
    const checkTruncation = () => {
      const newTruncatedState: { [key: string]: boolean } = {};
      if (!loadingState.value) return;

      loadingState.value.season.episodes.forEach((ep) => {
        // Check medium view
        if (!expandedEpisodes[`medium-${ep.id}`]) {
          const mediumElement = descriptionRefs.current[`medium-${ep.id}`];
          newTruncatedState[`medium-${ep.id}`] = isTextTruncated(mediumElement);
        }
        // Check large view
        if (!expandedEpisodes[`large-${ep.id}`]) {
          const largeElement = descriptionRefs.current[`large-${ep.id}`];
          newTruncatedState[`large-${ep.id}`] = isTextTruncated(largeElement);
        }
      });
      setTruncatedEpisodes(newTruncatedState);
    };

    // Initial check
    checkTruncation();

    // Check after a short delay to ensure content is rendered
    const timeoutId = setTimeout(checkTruncation, 250);

    // Also check when window is resized
    const handleResize = () => {
      checkTruncation();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [loadingState.value, expandedEpisodes]);

  const toggleEpisodeExpansion = (
    episodeId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    setExpandedEpisodes((prev) => ({
      ...prev,
      [episodeId]: !prev[episodeId],
    }));
  };

  const playEpisode = useCallback(
    (episodeId: string) => {
      if (loadingState.value) {
        const newData = setPlayerMeta(loadingState.value.fullData, episodeId);
        if (newData) onChange?.(newData);
      }
      // prevent router clear here, otherwise its done double
      // player already switches route after meta change
      router.close(true);
    },
    [setPlayerMeta, loadingState, router, onChange],
  );

  const toggleWatchStatus = useCallback(
    (episodeId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      if (loadingState.value && meta?.tmdbId) {
        const episode = loadingState.value.season.episodes.find(
          (ep) => ep.id === episodeId,
        );
        if (episode) {
          // Check if the episode is already watched
          const episodeProgress =
            progress.items[meta.tmdbId]?.episodes?.[episodeId];
          const percentage = episodeProgress
            ? (episodeProgress.progress.watched /
                episodeProgress.progress.duration) *
              100
            : 0;

          // If watched (>90%), reset to 0%, otherwise set to 100%
          const isWatched = percentage > 90;

          updateItem({
            meta: {
              tmdbId: meta.tmdbId,
              title: meta.title || "",
              type: "show",
              releaseYear: meta.releaseYear,
              poster: meta.poster,
              episode: {
                tmdbId: episodeId,
                number: episode.number,
                title: episode.title || "",
              },
              season: {
                tmdbId: selectedSeason,
                number: loadingState.value.season.number,
                title: loadingState.value.season.title || "",
              },
            },
            progress: {
              watched: isWatched ? 0 : 60,
              duration: 60,
            },
          });
        }
      }
    },
    [loadingState, meta, selectedSeason, updateItem, progress.items],
  );

  const handleScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;

    const cardWidth = 256; // w-64 in pixels
    const cardSpacing = 16; // space-x-4 in pixels
    const scrollAmount = (cardWidth + cardSpacing) * 2;

    const newScrollPosition =
      carouselRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);

    carouselRef.current.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (activeEpisodeRef.current) {
      // horizontal scroll
      if (window.innerWidth >= 1024 && carouselRef.current) {
        const containerLeft = carouselRef.current.getBoundingClientRect().left;
        const containerWidth = carouselRef.current.clientWidth;
        const elementLeft =
          activeEpisodeRef.current.getBoundingClientRect().left;
        const elementWidth = activeEpisodeRef.current.clientWidth;

        // Calculate center
        const scrollPosition =
          elementLeft - containerLeft - containerWidth / 2 + elementWidth / 2;

        carouselRef.current.scrollLeft += scrollPosition;
      } else {
        // vertical scroll
        activeEpisodeRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [loadingState.value]);

  if (!meta?.tmdbId) return null;

  let content: ReactNode = null;
  if (loadingState.error)
    content = (
      <CenteredText>{t("player.menus.episodes.loadingError")}</CenteredText>
    );
  else if (loadingState.loading)
    content = (
      <CenteredText>{t("player.menus.episodes.loadingList")}</CenteredText>
    );
  else if (loadingState.value) {
    content = (
      <div className="relative">
        {/* Horizontal scroll buttons */}
        <div
          className={classNames(
            "absolute left-0 top-1/2 transform -translate-y-1/2 z-10 px-4",
            forceCompactEpisodeView ? "hidden" : "hidden lg:block",
          )}
        >
          <button
            type="button"
            className="p-2 bg-black/80 hover:bg-video-context-hoverColor transition-colors rounded-full border border-video-context-border backdrop-blur-sm"
            onClick={() => handleScroll("left")}
          >
            <Icon icon={Icons.CHEVRON_LEFT} className="text-white/80" />
          </button>
        </div>

        <div
          ref={carouselRef}
          className={classNames(
            "flex pb-4 pt-2 scrollbar-hide",
            {
              "carousel-container":
                window.innerWidth >= 1024 && !forceCompactEpisodeView,
            },
            forceCompactEpisodeView
              ? "flex-col  space-y-3"
              : "flex-col lg:flex-row lg:overflow-x-auto space-y-3 sm:space-y-4 lg:space-y-0 lg:space-x-4 lg:px-12 ",
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {loadingState.value.season.episodes.length === 0 ? (
            <div className="flex-shrink-0 w-full flex justify-center items-center p-4">
              <p>{t("player.menus.episodes.emptyState")}</p>
            </div>
          ) : (
            loadingState.value.season.episodes.map((ep) => {
              const episodeProgress =
                progress.items[meta?.tmdbId]?.episodes?.[ep.id];
              const percentage = episodeProgress
                ? (episodeProgress.progress.watched /
                    episodeProgress.progress.duration) *
                  100
                : 0;

              const isAired = hasAired(ep.air_date);
              const isActive = ep.id === meta?.episode?.tmdbId;
              const isWatched = percentage > 90;

              return (
                <div key={ep.id} ref={isActive ? activeEpisodeRef : null}>
                  {/* Extra small screens - Simple vertical list with no thumbnails */}
                  <div
                    className={classNames(
                      "block w-full px-3 relative",
                      forceCompactEpisodeView ? "" : "sm:hidden",
                    )}
                  >
                    <Menu.Link
                      onClick={() => playEpisode(ep.id)}
                      active={isActive}
                      clickable={isAired}
                      rightSide={
                        <div className="flex items-center gap-2">
                          {isAired && !isActive && (
                            <button
                              type="button"
                              onClick={(e) => toggleWatchStatus(ep.id, e)}
                              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                              title={
                                isWatched
                                  ? t("player.menus.episodes.markAsUnwatched")
                                  : t("player.menus.episodes.markAsWatched")
                              }
                            >
                              <Icon
                                icon={isWatched ? Icons.EYE_SLASH : Icons.EYE}
                                className="h-4 w-4 text-white/80"
                              />
                            </button>
                          )}
                          {episodeProgress && (
                            <ProgressRing
                              className="h-[18px] w-[18px] text-white"
                              percentage={percentage}
                            />
                          )}
                        </div>
                      }
                    >
                      <Menu.LinkTitle>
                        <div
                          className={classNames(
                            "text-left flex items-center space-x-1 text-video-context-type-main",
                            isAired || isActive ? "" : "text-opacity-25",
                          )}
                        >
                          <span className="p-0.5 px-2 rounded inline bg-video-context-hoverColor bg-opacity-50">
                            {t("media.episodeShort")}
                            {ep.number}
                          </span>
                          <span className="line-clamp-1 break-all">
                            {ep.title}
                          </span>
                        </div>
                      </Menu.LinkTitle>
                    </Menu.Link>
                  </div>

                  {/* Small screens - Vertical list with thumbnails to the left */}
                  <div
                    onClick={() => playEpisode(ep.id)}
                    className={classNames(
                      "hidden sm:flex lg:hidden w-full rounded-lg overflow-hidden transition-all duration-200 relative cursor-pointer",
                      forceCompactEpisodeView ? "!hidden" : "",
                      isActive
                        ? "bg-video-context-hoverColor/50"
                        : "hover:bg-video-context-hoverColor/50",
                      !isAired ? "opacity-50" : "",
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video max-h-[110px] w-1/3 flex-shrink-0 bg-video-context-hoverColor">
                      {ep.still_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                          alt={ep.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                          <Icon
                            icon={Icons.FILM}
                            className="text-video-context-type-main opacity-50 text-3xl"
                          />
                        </div>
                      )}

                      {/* Episode Number Badge */}
                      <div className="absolute top-2 left-2 flex items-center space-x-2">
                        <span className="p-0.5 px-2 rounded inline bg-video-context-hoverColor bg-opacity-80 text-video-context-type-main text-sm">
                          E{ep.number}
                        </span>
                        {!isAired && (
                          <span className="bg-video-context-hoverColor/50 text-video-context-type-main/80 text-sm px-1 py-0.5 rounded-md">
                            {ep.air_date
                              ? `(${t("details.airs")} - ${new Date(ep.air_date).toLocaleDateString()})`
                              : `(${t("media.unreleased")})`}
                          </span>
                        )}
                      </div>

                      {/* Mark as watched button */}
                      {isAired && !isActive && (
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={(e) => toggleWatchStatus(ep.id, e)}
                            className="p-1.5 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
                            title={
                              isWatched
                                ? t("player.menus.episodes.markAsUnwatched")
                                : t("player.menus.episodes.markAsWatched")
                            }
                          >
                            <Icon
                              icon={isWatched ? Icons.EYE_SLASH : Icons.EYE}
                              className="h-4 w-4 text-white/80"
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1">
                      <h3 className="font-bold text-white line-clamp-1">
                        {ep.title}
                      </h3>
                      {ep.overview && (
                        <div className="relative">
                          <p
                            ref={(el) => {
                              descriptionRefs.current[`medium-${ep.id}`] = el;
                            }}
                            className={classNames(
                              "text-sm text-white/80 mt-1.5 transition-all duration-200",
                              !expandedEpisodes[`medium-${ep.id}`]
                                ? "line-clamp-2"
                                : "max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2",
                            )}
                          >
                            {ep.overview}
                          </p>
                          {!expandedEpisodes[`medium-${ep.id}`] &&
                            truncatedEpisodes[`medium-${ep.id}`] && (
                              <button
                                type="button"
                                onClick={(e) =>
                                  toggleEpisodeExpansion(`medium-${ep.id}`, e)
                                }
                                className="text-sm text-white/60 hover:text-white transition-opacity duration-200 opacity-0 animate-fade-in"
                              >
                                {t("player.menus.episodes.showMore")}
                              </button>
                            )}
                          {expandedEpisodes[`medium-${ep.id}`] && (
                            <button
                              type="button"
                              onClick={(e) =>
                                toggleEpisodeExpansion(`medium-${ep.id}`, e)
                              }
                              className="mt-2 text-sm text-white/60 hover:text-white transition-opacity duration-200 opacity-0 animate-fade-in"
                            >
                              {t("player.menus.episodes.showLess")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Progress indicator */}
                    {percentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-progress-background/25">
                        <div
                          className="h-full bg-progress-filled"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Large screens - Horizontal cards with thumbnails above title */}
                  <div
                    onClick={() => playEpisode(ep.id)}
                    className={classNames(
                      "hidden lg:block flex-shrink-0 transition-all duration-200 relative cursor-pointer rounded-lg overflow-hidden",
                      forceCompactEpisodeView ? "!hidden" : "",
                      isActive
                        ? "bg-video-context-hoverColor/50"
                        : "hover:bg-video-context-hoverColor/50",
                      !isAired ? "opacity-50" : "hover:scale-95",
                      expandedEpisodes[`large-${ep.id}`] ? "w-[32rem]" : "w-64",
                      "h-[280px]", // Fixed height for all states
                    )}
                  >
                    {/* Thumbnail */}
                    {!expandedEpisodes[`large-${ep.id}`] && (
                      <div className="relative h-[158px] w-full bg-video-context-hoverColor">
                        {ep.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                            alt={ep.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                            <Icon
                              icon={Icons.FILM}
                              className="text-video-context-type-main opacity-50 text-3xl"
                            />
                          </div>
                        )}

                        {/* Episode Number Badge */}
                        <div className="absolute top-2 left-2 flex items-center space-x-2">
                          <span className="p-0.5 px-2 rounded inline bg-video-context-hoverColor bg-opacity-80 text-video-context-type-main text-sm">
                            E{ep.number}
                          </span>
                          {!isAired && (
                            <span className="bg-video-context-hoverColor/50 text-video-context-type-main/80 text-sm px-1 py-0.5 rounded-md">
                              {ep.air_date
                                ? `(${t("details.airs")} - ${new Date(ep.air_date).toLocaleDateString()})`
                                : `(${t("media.unreleased")})`}
                            </span>
                          )}
                        </div>

                        {/* Mark as watched button */}
                        {isAired && !isActive && (
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              onClick={(e) => toggleWatchStatus(ep.id, e)}
                              className="p-1.5 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
                              title={
                                isWatched
                                  ? t("player.menus.episodes.markAsUnwatched")
                                  : t("player.menus.episodes.markAsWatched")
                              }
                            >
                              <Icon
                                icon={isWatched ? Icons.EYE_SLASH : Icons.EYE}
                                className="h-4 w-4 text-white/80"
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div
                      className={classNames(
                        "p-3",
                        expandedEpisodes[`large-${ep.id}`]
                          ? "h-full"
                          : "h-[122px]",
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-white line-clamp-1">
                          {ep.title}
                        </h3>
                        {expandedEpisodes[`large-${ep.id}`] && isAired && (
                          <button
                            type="button"
                            onClick={(e) => toggleWatchStatus(ep.id, e)}
                            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                            title={
                              isWatched
                                ? t("player.menus.episodes.markAsUnwatched")
                                : t("player.menus.episodes.markAsWatched")
                            }
                          >
                            <Icon
                              icon={isWatched ? Icons.EYE_SLASH : Icons.EYE}
                              className="h-4 w-4 text-white/80"
                            />
                          </button>
                        )}
                      </div>
                      {ep.overview && (
                        <div className="relative">
                          <p
                            ref={(el) => {
                              descriptionRefs.current[`large-${ep.id}`] = el;
                            }}
                            className={classNames(
                              "text-sm text-white/80 mt-1.5 transition-all duration-200",
                              !expandedEpisodes[`large-${ep.id}`]
                                ? "line-clamp-2"
                                : "max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2",
                            )}
                          >
                            {ep.overview}
                          </p>
                          {!expandedEpisodes[`large-${ep.id}`] &&
                            truncatedEpisodes[`large-${ep.id}`] && (
                              <button
                                type="button"
                                onClick={(e) =>
                                  toggleEpisodeExpansion(`large-${ep.id}`, e)
                                }
                                className="text-sm text-white/60 hover:text-white transition-opacity duration-200 opacity-0 animate-fade-in"
                              >
                                {t("player.menus.episodes.showMore")}
                              </button>
                            )}
                          {expandedEpisodes[`large-${ep.id}`] && (
                            <button
                              type="button"
                              onClick={(e) =>
                                toggleEpisodeExpansion(`large-${ep.id}`, e)
                              }
                              className="mt-2 text-sm text-white/60 hover:text-white transition-opacity duration-200 opacity-0 animate-fade-in"
                            >
                              {t("player.menus.episodes.showLess")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Progress indicator */}
                    {percentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-progress-background/25">
                        <div
                          className="h-full bg-progress-filled"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right scroll button */}
        <div
          className={classNames(
            "absolute right-0 top-1/2 transform -translate-y-1/2 z-10 px-4",
            forceCompactEpisodeView ? "hidden" : "hidden lg:block",
          )}
        >
          <button
            type="button"
            className="p-2 bg-black/80 hover:bg-video-context-hoverColor transition-colors rounded-full border border-video-context-border backdrop-blur-sm"
            onClick={() => handleScroll("right")}
          >
            <Icon icon={Icons.CHEVRON_RIGHT} className="text-white/80" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Menu.CardWithScrollable>
      <Menu.BackLink onClick={goBack} side="right">
        {loadingState?.value?.season.title ||
          t("player.menus.episodes.loadingTitle")}
      </Menu.BackLink>
      {content}
    </Menu.CardWithScrollable>
  );
}

function EpisodesOverlay({
  id,
  onChange,
}: {
  id: string;
  onChange?: (meta: PlayerMeta) => void;
}) {
  const router = useOverlayRouter(id);
  const meta = usePlayerStore((s) => s.meta);
  const [selectedSeason, setSelectedSeason] = useState("");

  const lastActiveState = useRef(false);
  useEffect(() => {
    if (lastActiveState.current === router.isRouterActive) return;
    lastActiveState.current = router.isRouterActive;
    setSelectedSeason(meta?.season?.tmdbId ?? "");
  }, [meta, selectedSeason, setSelectedSeason, router.isRouterActive]);

  const setSeason = useCallback(
    (seasonId: string) => {
      setSelectedSeason(seasonId);
      router.navigate("/episodes");
    },
    [router],
  );

  const forceCompactEpisodeView = usePreferencesStore(
    (s) => s.forceCompactEpisodeView,
  );

  return (
    <Overlay id={id}>
      <OverlayRouter id={id}>
        <OverlayPage id={id} path="/" width={343} height={431}>
          <SeasonsView setSeason={setSeason} selectedSeason={selectedSeason} />
        </OverlayPage>
        <OverlayPage
          id={id}
          path="/episodes"
          width={343}
          height={
            forceCompactEpisodeView || window.innerWidth < 1024 ? 431 : 375
          }
          fullWidth={!forceCompactEpisodeView}
        >
          {selectedSeason.length > 0 ? (
            <EpisodesView
              selectedSeason={selectedSeason}
              id={id}
              goBack={() => router.navigate("/")}
              onChange={onChange}
            />
          ) : null}
        </OverlayPage>
      </OverlayRouter>
    </Overlay>
  );
}

interface EpisodesProps {
  onChange?: (meta: PlayerMeta) => void;
}

export function EpisodesRouter(props: EpisodesProps) {
  return <EpisodesOverlay onChange={props.onChange} id="episodes" />;
}

export function Episodes(props: { inControl: boolean }) {
  const { t } = useTranslation();
  const router = useOverlayRouter("episodes");
  const setHasOpenOverlay = usePlayerStore((s) => s.setHasOpenOverlay);
  const type = usePlayerStore((s) => s.meta?.type);

  useEffect(() => {
    setHasOpenOverlay(router.isRouterActive);
  }, [setHasOpenOverlay, router.isRouterActive]);
  if (type !== "show" || !props.inControl) return null;

  return (
    <OverlayAnchor id={router.id}>
      <VideoPlayerButton
        onClick={() => router.open("/episodes")}
        icon={Icons.EPISODES}
      >
        {t("player.menus.episodes.button")}
      </VideoPlayerButton>
    </OverlayAnchor>
  );
}
