import classNames from "classnames";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/buttons/Button";
import { Dropdown } from "@/components/form/Dropdown";
import { Icon, Icons } from "@/components/Icon";
import { Modal, ModalCard, useModal } from "@/components/overlays/Modal";
import { hasAired } from "@/components/player/utils/aired";
import { useProgressStore } from "@/stores/progress";

import { EpisodeCarouselProps } from "../../types";

export function EpisodeCarousel({
  episodes,
  showProgress,
  progress,
  selectedSeason,
  onSeasonChange,
  seasons,
  mediaId,
  mediaTitle,
  mediaPosterUrl,
}: EpisodeCarouselProps) {
  const [showEpisodeMenu, setShowEpisodeMenu] = useState(false);
  const [customSeason, setCustomSeason] = useState("");
  const [customEpisode, setCustomEpisode] = useState("");
  const [SeasonWatched, setSeasonWatched] = useState(false);
  const [expandedEpisodes, setExpandedEpisodes] = useState<{
    [key: number]: boolean;
  }>({});
  const [truncatedEpisodes, setTruncatedEpisodes] = useState<{
    [key: number]: boolean;
  }>({});
  const episodeMenuRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeEpisodeRef = useRef<HTMLAnchorElement>(null);
  const descriptionRefs = useRef<{
    [key: number]: HTMLParagraphElement | null;
  }>({});
  const updateItem = useProgressStore((s) => s.updateItem);
  const confirmModal = useModal("season-watch-confirm");

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

  // Function to generate the episode URL
  const getEpisodeUrl = (episode: any) => {
    // Find the season ID for the current season
    const season = seasons.find((s) => s.season_number === selectedSeason);

    if (!season || !mediaId || !mediaTitle) return "#";

    // Create the URL in the format: /media/tmdb-tv-{showId}-{showName}/{seasonId}/{episodeId}
    return `/media/tmdb-tv-${mediaId}-${mediaTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${season.id}/${episode.id}`;
  };

  useEffect(() => {
    if (carouselRef.current) {
      if (activeEpisodeRef.current) {
        // If there's an active episode, scroll to it
        const containerLeft = carouselRef.current.getBoundingClientRect().left;
        const containerWidth = carouselRef.current.clientWidth;
        const elementLeft =
          activeEpisodeRef.current.getBoundingClientRect().left;
        const elementWidth = activeEpisodeRef.current.clientWidth;

        const scrollPosition =
          elementLeft - containerLeft - containerWidth / 2 + elementWidth / 2;

        carouselRef.current.scrollTo({
          left: carouselRef.current.scrollLeft + scrollPosition,
          behavior: "smooth",
        });
      } else {
        // If no active episode, scroll to the start
        carouselRef.current.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      }
    }
  }, [episodes, showProgress]);

  // Add click outside handler for episode menu
  useEffect(() => {
    if (!showEpisodeMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        episodeMenuRef.current &&
        !episodeMenuRef.current.contains(event.target as Node)
      ) {
        setShowEpisodeMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEpisodeMenu]);

  const handleCustomNavigation = () => {
    const season = parseInt(customSeason, 10);
    const episode = parseInt(customEpisode, 10);

    if (
      Number.isNaN(season) ||
      Number.isNaN(episode) ||
      !mediaId ||
      !mediaTitle
    )
      return;

    // Find the season
    const seasonData = seasons.find((s) => s.season_number === season);
    if (!seasonData) return;

    // Find the episode in the current season's episodes
    const episodeData = episodes.find(
      (e) => e.season_number === season && e.episode_number === episode,
    );

    if (!episodeData) {
      console.error(
        "No episode data found for season:",
        season,
        "episode:",
        episode,
      );
      return;
    }

    // Navigate to the episode using the same URL format as getEpisodeUrl
    const url = `/media/tmdb-tv-${mediaId}-${mediaTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${seasonData.id}/${episodeData.id}`;
    window.location.href = url;
    setShowEpisodeMenu(false);
  };

  const toggleWatchStatus = (episodeId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (mediaId) {
      const episode = episodes.find((ep) => ep.id === episodeId);
      if (episode) {
        const seasonData = seasons.find(
          (s) => s.season_number === selectedSeason,
        );
        if (!seasonData) return;

        // Check if the episode is already watched
        const episodeProgress =
          progress[mediaId.toString()]?.episodes?.[episodeId];
        const percentage = episodeProgress
          ? (episodeProgress.progress.watched /
              episodeProgress.progress.duration) *
            100
          : 0;

        // If watched (>90%), reset to 0%, otherwise set to 100%
        const isWatched = percentage > 90;

        // Get the poster URL from the mediaPosterUrl prop
        const posterUrl = mediaPosterUrl;

        // Update progress
        updateItem({
          meta: {
            tmdbId: mediaId.toString(),
            title: mediaTitle || "",
            type: "show",
            releaseYear: new Date().getFullYear(),
            poster: posterUrl,
            episode: {
              tmdbId: episodeId.toString(),
              number: episode.episode_number,
              title: episode.name || "",
            },
            season: {
              tmdbId: seasonData.id.toString(),
              number: selectedSeason,
              title: seasonData.name || "",
            },
          },
          progress: {
            watched: isWatched ? 0 : 60,
            duration: 60,
          },
        });
      }
    }
  };

  // Toggle whole season watch status
  const toggleSeasonWatchStatus = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    confirmModal.show();
  };

  const handleCancel = () => {
    confirmModal.hide();
  };

  const currentSeasonEpisodes = episodes.filter(
    (ep) => ep.season_number === selectedSeason,
  );

  const handleConfirm = (event: React.MouseEvent) => {
    try {
      const episodeWatchedStatus: boolean[] = [];
      currentSeasonEpisodes.forEach((episode: any) => {
        const episodeProgress =
          progress[mediaId?.toString() ?? ""]?.episodes?.[episode.id];
        const percentage = episodeProgress
          ? (episodeProgress.progress.watched /
              episodeProgress.progress.duration) *
            100
          : 0;
        const isAired = hasAired(episode.air_date);
        const isWatched = percentage > 90;
        if (isAired && !isWatched) {
          episodeWatchedStatus.push(isWatched);
        }
      });

      const hasUnwatched = episodeWatchedStatus.length >= 1;

      currentSeasonEpisodes.forEach((episode: any) => {
        const episodeProgress =
          progress[mediaId?.toString() ?? ""]?.episodes?.[episode.id];
        const percentage = episodeProgress
          ? (episodeProgress.progress.watched /
              episodeProgress.progress.duration) *
            100
          : 0;
        const isAired = hasAired(episode.air_date);
        const isWatched = percentage > 90;
        if (hasUnwatched && isAired && !isWatched) {
          toggleWatchStatus(episode.id, event); // Mark unwatched as watched
        } else if (!hasUnwatched && isAired && isWatched) {
          toggleWatchStatus(episode.id, event); // Mark watched as unwatched
        }
      });

      confirmModal.hide();
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      confirmModal.hide();
    }
  };

  const toggleEpisodeExpansion = (
    episodeId: number,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    setExpandedEpisodes((prev) => ({
      ...prev,
      [episodeId]: !prev[episodeId],
    }));
  };

  const isTextTruncated = (element: HTMLElement | null) => {
    if (!element) return false;
    return element.scrollHeight > element.clientHeight;
  };

  // Add a new effect to reset states when season changes
  useEffect(() => {
    setExpandedEpisodes({});
    setTruncatedEpisodes({});
  }, [selectedSeason]);

  // Check truncation after render and when expanded state changes
  useEffect(() => {
    const checkTruncation = () => {
      const newTruncatedState: { [key: number]: boolean } = {};
      episodes.forEach((episode) => {
        if (!expandedEpisodes[episode.id]) {
          const element = descriptionRefs.current[episode.id];
          newTruncatedState[episode.id] = isTextTruncated(element);
        }
      });
      setTruncatedEpisodes(newTruncatedState);
    };

    checkTruncation();

    // Wait for the transition to complete
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
  }, [episodes, expandedEpisodes]);

  useEffect(() => {
    const episodeWatchedStatus: boolean[] = [];

    currentSeasonEpisodes.forEach((episode: any) => {
      const episodeProgress =
        progress[mediaId?.toString() ?? ""]?.episodes?.[episode.id];
      const percentage = episodeProgress
        ? (episodeProgress.progress.watched /
            episodeProgress.progress.duration) *
          100
        : 0;
      const isAired = hasAired(episode.air_date);
      const isWatched = percentage > 90;

      if (isAired && !isWatched) {
        episodeWatchedStatus.push(isWatched);
      }
    });

    if (episodeWatchedStatus.length >= 1) {
      setSeasonWatched(true); // If no episodes are watched, we want to mark all as watched
    } else {
      setSeasonWatched(false); // if all episodes are watched, we want to mark all as unwatched
    }
  }, [currentSeasonEpisodes, episodes, mediaId, progress]);

  return (
    <div className="mt-6 md:mt-0">
      {/* Season Selector */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-semibold text-white">
            {t("details.episodes")}
          </h4>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEpisodeMenu(!showEpisodeMenu)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title={t("details.goToEpisode")}
            >
              <Icon icon={Icons.SEARCH} className="text-white/80" />
            </button>

            {/* Episode Selection Menu */}
            {showEpisodeMenu && (
              <div
                ref={episodeMenuRef}
                className="absolute top-full left-0 mt-2 p-4 bg-background-main rounded-lg shadow-lg border border-white/10 z-50 min-w-[250px]"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/80 mb-1">
                      {t("details.season")}
                    </label>
                    <input
                      type="number"
                      value={customSeason}
                      onChange={(e) => setCustomSeason(e.target.value)}
                      min="1"
                      max={seasons.length}
                      className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 text-white focus:outline-none focus:border-white/30"
                      placeholder={t("details.season")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/80 mb-1">
                      {t("details.episode")}
                    </label>
                    <input
                      type="number"
                      value={customEpisode}
                      onChange={(e) => setCustomEpisode(e.target.value)}
                      min="1"
                      className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 text-white focus:outline-none focus:border-white/30"
                      placeholder={t("details.episode")}
                    />
                  </div>
                  <Button
                    theme="purple"
                    onClick={handleCustomNavigation}
                    className="w-full px-4 py-2"
                  >
                    {t("details.play")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Season Watched Confirmation */}
        <div className="flex items-center justify-between gap-2">
          <Modal id={confirmModal.id}>
            <ModalCard>
              <h3 className="text-lg font-semibold text-white mb-4">
                {SeasonWatched
                  ? t("media.seasonWatched")
                  : t("media.seasonUnwatched")}
              </h3>
              <div className="flex justify-end gap-2">
                <Button theme="secondary" onClick={handleCancel}>
                  {t("actions.cancel")}
                </Button>
                <Button theme="purple" onClick={handleConfirm}>
                  {t("actions.confirm")}
                </Button>
              </div>
            </ModalCard>
          </Modal>
          <button
            type="button"
            onClick={(e) => toggleSeasonWatchStatus(e)}
            className="p-1.5 bg-dropdown-background hover:bg-dropdown-hoverBackground transition-colors rounded-full"
            title={t("Mark season as watched")}
          >
            <Icon
              icon={SeasonWatched ? Icons.EYE : Icons.EYE_SLASH}
              className="h-5 w-5 text-white"
            />
          </button>

          <Dropdown
            options={seasons.map((season) => ({
              id: season.season_number.toString(),
              name: `${t("details.season")} ${season.season_number}`,
            }))}
            selectedItem={{
              id: selectedSeason.toString(),
              name: `${t("details.season")} ${selectedSeason}`,
            }}
            setSelectedItem={(item) => onSeasonChange(Number(item.id))}
          />
        </div>
      </div>

      {/* Episodes Carousel */}
      <div className="relative">
        {/* Left scroll button */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 px-4 hidden lg:block">
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
          className="flex overflow-x-auto space-x-4 pb-4 pt-2 lg:px-12 scrollbar-hide carousel-container"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Add padding before the first card */}
          <div className="flex-shrink-0 w-4" />
          {currentSeasonEpisodes.map((episode) => {
            const isActive =
              showProgress?.episode?.id === episode.id.toString();
            const episodeProgress =
              progress[mediaId?.toString() ?? ""]?.episodes?.[episode.id];
            const percentage = episodeProgress
              ? (episodeProgress.progress.watched /
                  episodeProgress.progress.duration) *
                100
              : 0;
            const isAired = hasAired(episode.air_date);
            const isExpanded = expandedEpisodes[episode.id];
            const isWatched = percentage > 90;

            return (
              <Link
                key={episode.id}
                to={getEpisodeUrl(episode)}
                ref={isActive ? activeEpisodeRef : null}
                className={classNames(
                  "flex-shrink-0 transition-all duration-200 relative cursor-pointer hover:scale-95 rounded-lg overflow-hidden",
                  isActive
                    ? "bg-video-context-hoverColor/50 hover:bg-white/5"
                    : "hover:bg-white/5",
                  !isAired ? "opacity-50" : "",
                  isExpanded ? "w-[32rem]" : "w-52 md:w-64",
                  "h-[280px]", // Fixed height for all states
                )}
              >
                {/* Thumbnail */}
                {!isExpanded && (
                  <div className="relative h-[158px] w-full bg-video-context-hoverColor">
                    {episode.still_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={episode.name}
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
                        {t("media.episodeShort")}
                        {episode.episode_number}
                      </span>
                      {!isAired && (
                        <span className="bg-video-context-hoverColor/50 text-video-context-type-main/80 text-sm px-1 py-0.5 rounded-md">
                          {episode.air_date
                            ? `(${t("details.airs")} - ${new Date(episode.air_date).toLocaleDateString()})`
                            : `(${t("media.unreleased")})`}
                        </span>
                      )}
                    </div>

                    {/* Mark as watched button */}
                    {isAired && (
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={(e) => toggleWatchStatus(episode.id, e)}
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
                    isExpanded ? "h-full" : "h-[122px]",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-white line-clamp-1">
                      {episode.name}
                    </h3>
                    {isExpanded && isAired && (
                      <button
                        type="button"
                        onClick={(e) => toggleWatchStatus(episode.id, e)}
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
                  {episode.overview && (
                    <div className="relative">
                      <p
                        ref={(el) => {
                          descriptionRefs.current[episode.id] = el;
                        }}
                        className={classNames(
                          "text-sm text-white/80 mt-1.5 transition-all duration-200",
                          !isExpanded
                            ? "line-clamp-2"
                            : "max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2",
                        )}
                      >
                        {episode.overview}
                      </p>
                      {!isExpanded && truncatedEpisodes[episode.id] && (
                        <button
                          type="button"
                          onClick={(e) => toggleEpisodeExpansion(episode.id, e)}
                          className="text-sm text-white/60 hover:text-white transition-opacity duration-200 opacity-0 animate-fade-in"
                        >
                          {t("player.menus.episodes.showMore")}
                        </button>
                      )}
                      {isExpanded && (
                        <button
                          type="button"
                          onClick={(e) => toggleEpisodeExpansion(episode.id, e)}
                          className="mt-2 text-sm text-white/60 hover:text-white transition-opacity duration-200 opacity-0 animate-fade-in"
                        >
                          {t("player.menus.episodes.showLess")}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {percentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-progress-background/25">
                    <div
                      className="h-full bg-progress-filled"
                      style={{
                        width: `${percentage > 98 ? 100 : percentage}%`,
                      }}
                    />
                  </div>
                )}
              </Link>
            );
          })}

          {/* Add padding after the last card */}
          <div className="flex-shrink-0 w-4" />
        </div>

        {/* Right scroll button */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 px-4 hidden lg:block">
          <button
            type="button"
            className="p-2 bg-black/80 hover:bg-video-context-hoverColor transition-colors rounded-full border border-video-context-border backdrop-blur-sm"
            onClick={() => handleScroll("right")}
          >
            <Icon icon={Icons.CHEVRON_RIGHT} className="text-white/80" />
          </button>
        </div>
      </div>
    </div>
  );
}
