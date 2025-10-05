import { Listbox } from "@headlessui/react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useWindowSize } from "react-use";

import { Dropdown, OptionItem } from "@/components/form/Dropdown";
import { Icon, Icons } from "@/components/Icon";
import { MediaCard } from "@/components/media/MediaCard";
import { Flare } from "@/components/utils/Flare";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  DiscoverContentType,
  MediaType,
  useDiscoverMedia,
  useDiscoverOptions,
} from "@/pages/discover/hooks/useDiscoverMedia";
import { useIntersectionObserver } from "@/pages/discover/hooks/useIntersectionObserver";
import { useDiscoverStore } from "@/stores/discover";
import { useProgressStore } from "@/stores/progress";
import { MediaItem } from "@/utils/mediaTypes";

import { CarouselNavButtons } from "./CarouselNavButtons";

interface ContentConfig {
  /** Primary content type to fetch */
  type: DiscoverContentType;
  /** Fallback content type if primary fails */
  fallback?: DiscoverContentType;
}

interface MediaCarouselProps {
  /** Content configuration for the carousel */
  content: ContentConfig;
  /** Whether this is a TV show carousel */
  isTVShow: boolean;
  /** Refs for carousel navigation */
  carouselRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
  /** Callback when media details should be shown */
  onShowDetails?: (media: MediaItem) => void;
  /** Whether to show more content button/link */
  moreContent?: boolean;
  /** Custom more content link */
  moreLink?: string;
  /** Whether to show provider selection */
  showProviders?: boolean;
  /** Whether to show genre selection */
  showGenres?: boolean;
  /** Whether to show recommendations */
  showRecommendations?: boolean;
}

function MediaCardSkeleton() {
  return (
    <div className="relative mt-4 group cursor-default user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto">
      <div className="animate-pulse">
        <div className="w-full aspect-[2/3] bg-mediaCard-hoverBackground rounded-lg" />
        <div className="mt-2 h-4 bg-mediaCard-hoverBackground rounded w-3/4" />
      </div>
    </div>
  );
}

function MoreCard({ link }: { link: string }) {
  const { t } = useTranslation();

  return (
    <div className="relative mt-4 group cursor-pointer user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto">
      <Link to={link} className="block">
        <Flare.Base className="group -m-[0.705em] h-[20rem] hover:scale-95 transition-all rounded-xl bg-background-main duration-300 hover:bg-mediaCard-hoverBackground tabbable">
          <Flare.Light
            flareSize={300}
            cssColorVar="--colors-mediaCard-hoverAccent"
            backgroundClass="bg-mediaCard-hoverBackground duration-100"
            className="rounded-xl bg-background-main group-hover:opacity-100"
          />
          <Flare.Child className="pointer-events-auto h-[20rem] relative mb-2 p-[0.4em] transition-transform duration-300">
            <div className="flex absolute inset-0 flex-col items-center justify-center">
              <Icon
                icon={Icons.ARROW_RIGHT}
                className="text-4xl mb-2 transition-transform duration-300"
              />
              <span className="text-sm text-center px-2">
                {t("discover.carousel.more")}
              </span>
            </div>
          </Flare.Child>
        </Flare.Base>
      </Link>
    </div>
  );
}

export function MediaCarousel({
  content,
  isTVShow,
  carouselRefs,
  onShowDetails,
  moreContent,
  moreLink,
  showProviders = false,
  showGenres = false,
  showRecommendations = false,
}: MediaCarouselProps) {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowSize();
  const { setLastView } = useDiscoverStore();
  const { isMobile } = useIsMobile();
  const browser = !!window.chrome;

  // State for selected options
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedProviderName, setSelectedProviderName] = useState<string>("");
  const [selectedGenreId, setSelectedGenreId] = useState<string>("");
  const [selectedGenreName, setSelectedGenreName] = useState<string>("");
  const [selectedRecommendationId, setSelectedRecommendationId] =
    useState<string>("");
  const [selectedRecommendationTitle, setSelectedRecommendationTitle] =
    useState<string>("");
  const [selectedGenre, setSelectedGenre] = React.useState<OptionItem | null>(
    null,
  );

  // Get available providers and genres
  const mediaType: MediaType = isTVShow ? "tv" : "movie";
  const { providers, genres } = useDiscoverOptions(mediaType);

  // Get progress items for recommendations
  const progressItems = useProgressStore((state) => state.items);
  const recommendationSources = Object.entries(progressItems || {})
    .filter(([_, item]) => item.type === (isTVShow ? "show" : "movie"))
    .map(([id, item]) => ({
      id,
      title: item.title || "",
    }));

  // Set up intersection observer for lazy loading
  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "300px",
  });

  // Handle provider/genre selection
  const handleProviderChange = React.useCallback((id: string, name: string) => {
    setSelectedProviderId(id);
    setSelectedProviderName(name);
  }, []);

  const handleGenreChange = React.useCallback((id: string, name: string) => {
    setSelectedGenreId(id);
    setSelectedGenreName(name);
  }, []);

  // Get related buttons based on type
  const relatedButtons = React.useMemo(() => {
    if (showProviders) {
      return providers.map((p) => ({ id: p.id, name: p.name }));
    }
    if (showGenres) {
      return genres.map((g) => ({ id: g.id.toString(), name: g.name }));
    }
    return undefined;
  }, [showProviders, showGenres, providers, genres]);

  // Set initial provider/genre selection
  useEffect(() => {
    if (showProviders && providers.length > 0 && !selectedProviderId) {
      handleProviderChange(providers[0].id, providers[0].name);
    }
    if (showGenres && genres.length > 0 && !selectedGenreId) {
      handleGenreChange(genres[0].id.toString(), genres[0].name);
    }
  }, [
    showProviders,
    showGenres,
    providers,
    genres,
    selectedProviderId,
    selectedGenreId,
    handleProviderChange,
    handleGenreChange,
  ]);

  // Get the appropriate button click handler
  const onButtonClick = React.useMemo(() => {
    if (showProviders) return handleProviderChange;
    if (showGenres) return handleGenreChange;
    return undefined;
  }, [showProviders, showGenres, handleProviderChange, handleGenreChange]);

  // Split buttons into visible and dropdown based on window width
  const { visibleButtons, dropdownButtons } = React.useMemo(() => {
    if (!relatedButtons) return { visibleButtons: [], dropdownButtons: [] };

    const visible = windowWidth > 850 ? relatedButtons.slice(0, 5) : [];
    const dropdown =
      windowWidth > 850 ? relatedButtons.slice(5) : relatedButtons;

    return { visibleButtons: visible, dropdownButtons: dropdown };
  }, [relatedButtons, windowWidth]);

  // Determine content type and ID based on selection
  const contentType = React.useMemo(() => {
    if (showProviders && selectedProviderId) return "provider";
    if (showGenres && selectedGenreId) return "genre";
    if (showRecommendations && selectedRecommendationId)
      return "recommendations";
    return content.type;
  }, [
    showProviders,
    selectedProviderId,
    showGenres,
    selectedGenreId,
    showRecommendations,
    selectedRecommendationId,
    content.type,
  ]);

  // Fetch media using our hook
  const { media, sectionTitle } = useDiscoverMedia({
    contentType,
    mediaType,
    id: selectedProviderId || selectedGenreId || selectedRecommendationId,
    fallbackType: content.fallback,
    genreName: selectedGenreName,
    providerName: selectedProviderName,
    mediaTitle: selectedRecommendationTitle,
    isCarouselView: true,
  });

  // Find active button
  const activeButton = React.useMemo(() => {
    return relatedButtons?.find(
      (btn) =>
        btn.name === selectedGenre?.name ||
        btn.name === sectionTitle.split(" on ")[1],
    );
  }, [relatedButtons, selectedGenre?.name, sectionTitle]);

  // Convert buttons to dropdown options
  const dropdownOptions: OptionItem[] = React.useMemo(() => {
    return dropdownButtons.map((button) => ({
      id: button.id,
      name: button.name,
    }));
  }, [dropdownButtons]);

  // Set selected genre if active button is in dropdown
  React.useEffect(() => {
    if (
      activeButton &&
      !visibleButtons.find((btn) => btn.id === activeButton.id)
    ) {
      setSelectedGenre({ id: activeButton.id, name: activeButton.name });
    }
  }, [activeButton, visibleButtons]);

  // Set initial recommendation source
  useEffect(() => {
    if (
      showRecommendations &&
      recommendationSources.length > 0 &&
      !selectedRecommendationId
    ) {
      const randomSource =
        recommendationSources[
          Math.floor(Math.random() * recommendationSources.length)
        ];
      setSelectedRecommendationId(randomSource.id);
      setSelectedRecommendationTitle(randomSource.title);
    }
  }, [showRecommendations, recommendationSources, selectedRecommendationId]);

  const categorySlug = `${sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${isTVShow ? "tv" : "movie"}`;
  const isScrollingRef = useRef(false);

  const handleWheel = React.useCallback(
    (e: React.WheelEvent) => {
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.stopPropagation();
        e.preventDefault();
      }

      if (browser) {
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 345);
      } else {
        isScrollingRef.current = false;
      }
    },
    [browser],
  );

  const handleMoreClick = React.useCallback(() => {
    setLastView({
      url: window.location.pathname,
      scrollPosition: window.scrollY,
    });
  }, [setLastView]);

  // Generate more link
  const generatedMoreLink = React.useMemo(() => {
    if (moreLink) return moreLink;

    const baseLink = `/discover/more`;
    if (showProviders && selectedProviderId) {
      return `${baseLink}/provider/${selectedProviderId}/${mediaType}`;
    }
    if (showGenres && selectedGenreId) {
      return `${baseLink}/genre/${selectedGenreId}/${mediaType}`;
    }
    if (showRecommendations && selectedRecommendationId) {
      return `${baseLink}/recommendations/${selectedRecommendationId}/${mediaType}`;
    }
    return `${baseLink}/${content.type}/${mediaType}`;
  }, [
    moreLink,
    showProviders,
    selectedProviderId,
    showGenres,
    selectedGenreId,
    showRecommendations,
    selectedRecommendationId,
    mediaType,
    content.type,
  ]);

  // Loading state
  if (!isIntersecting || !sectionTitle) {
    return (
      <div ref={targetRef as React.RefObject<HTMLDivElement>}>
        <div className="flex items-center justify-between ml-2 md:ml-8 mt-2">
          <div className="flex gap-4 items-center">
            <h2 className="text-2xl cursor-default font-bold text-white md:text-2xl pl-5 text-balance">
              {t("discover.carousel.title.loading")}
            </h2>
          </div>
        </div>
        <div className="relative overflow-hidden carousel-container md:pb-4">
          <div className="grid grid-flow-col auto-cols-max gap-4 pt-0 overflow-x-scroll scrollbar-none rounded-xl overflow-y-hidden md:pl-8 md:pr-8">
            <div className="md:w-12" />
            {Array(10)
              .fill(null)
              .map(() => (
                <MediaCardSkeleton
                  key={`skeleton-loading-${Math.random().toString(36).substring(2)}`}
                />
              ))}
            <div className="md:w-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={targetRef as React.RefObject<HTMLDivElement>}>
      <div className="flex items-center justify-between ml-2 md:ml-8 mt-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl cursor-default font-bold text-white md:text-2xl pl-5 text-balance">
              {sectionTitle}
            </h2>
            {showRecommendations &&
              recommendationSources &&
              recommendationSources.length > 0 && (
                <div className="relative pr-4">
                  <Dropdown
                    selectedItem={
                      recommendationSources.find(
                        (s) => s.id === selectedRecommendationId,
                      )
                        ? {
                            id: selectedRecommendationId || "",
                            name:
                              recommendationSources.find(
                                (s) => s.id === selectedRecommendationId,
                              )?.title || "",
                          }
                        : {
                            id: "",
                            name: recommendationSources[0]?.title || "",
                          }
                    }
                    setSelectedItem={(item) => {
                      const source = recommendationSources.find(
                        (s) => s.id === item.id,
                      );
                      if (source) {
                        setSelectedRecommendationId(item.id);
                        setSelectedRecommendationTitle(source.title);
                      }
                    }}
                    options={recommendationSources.map((source) => ({
                      id: source.id,
                      name: source.title,
                    }))}
                    customButton={
                      <button
                        type="button"
                        className="px-2 py-1 text-sm bg-mediaCard-hoverBackground rounded-full hover:bg-mediaCard-background transition-colors flex items-center gap-1"
                      >
                        <span>{t("discover.carousel.change")}</span>
                        <Icon
                          icon={Icons.UP_DOWN_ARROW}
                          className="text-xs text-dropdown-secondary"
                        />
                      </button>
                    }
                    side="right"
                    customMenu={
                      <Listbox.Options static className="py-1">
                        {recommendationSources.map((opt) => (
                          <Listbox.Option
                            className={({ active }) =>
                              `cursor-pointer min-w-60 flex gap-4 items-center relative select-none py-2 px-4 mx-1 rounded-lg ${
                                active
                                  ? "bg-background-secondaryHover text-type-link"
                                  : "text-type-secondary"
                              }`
                            }
                            key={opt.id}
                            value={{ id: opt.id, name: opt.title }}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block ${selected ? "font-medium" : "font-normal"}`}
                                >
                                  {opt.title}
                                </span>
                                {selected && (
                                  <Icon
                                    icon={Icons.CHECKMARK}
                                    className="text-xs text-type-link"
                                  />
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    }
                  />
                </div>
              )}
          </div>
          {moreContent && (
            <Link
              to={generatedMoreLink}
              onClick={handleMoreClick}
              className="flex px-5 items-center hover:text-type-link transition-colors"
            >
              <span className="text-sm">{t("discover.carousel.more")}</span>
              <Icon className="text-sm ml-1" icon={Icons.ARROW_RIGHT} />
            </Link>
          )}
        </div>
        {relatedButtons && relatedButtons.length > 0 && (
          <div className="flex items-center space-x-2 mr-6">
            {visibleButtons?.map((button) => (
              <button
                type="button"
                key={button.id}
                onClick={() => onButtonClick?.(button.id, button.name)}
                className={`px-3 py-1 text-sm rounded-full hover:bg-mediaCard-background transition-colors whitespace-nowrap flex-shrink-0 ${
                  button.id === (selectedProviderId || selectedGenreId)
                    ? "bg-mediaCard-background"
                    : "bg-mediaCard-hoverBackground"
                }`}
              >
                {button.name}
              </button>
            ))}
            {dropdownButtons && dropdownButtons.length > 0 && (
              <div className="relative my-0">
                <Dropdown
                  selectedItem={
                    selectedGenre || {
                      id: "",
                      name:
                        activeButton &&
                        !visibleButtons.find(
                          (btn) => btn.id === activeButton.id,
                        )
                          ? activeButton.name
                          : "...",
                    }
                  }
                  setSelectedItem={(item) => {
                    setSelectedGenre(item);
                    onButtonClick?.(item.id, item.name);
                  }}
                  options={dropdownOptions}
                  customButton={
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-mediaCard-hoverBackground rounded-full hover:bg-mediaCard-background transition-colors flex items-center gap-1"
                    >
                      <span>
                        {activeButton &&
                        !visibleButtons.find(
                          (btn) => btn.id === activeButton.id,
                        )
                          ? activeButton.name
                          : "..."}
                      </span>
                      <Icon
                        icon={Icons.UP_DOWN_ARROW}
                        className="text-xs text-dropdown-secondary"
                      />
                    </button>
                  }
                  side="right"
                  preventWrap
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative overflow-hidden carousel-container md:pb-4">
        <div
          id={`carousel-${categorySlug}`}
          className="grid grid-flow-col auto-cols-max gap-4 pt-0 overflow-x-scroll scrollbar-none rounded-xl overflow-y-hidden md:pl-8 md:pr-8"
          ref={(el) => {
            carouselRefs.current[categorySlug] = el;
          }}
          onWheel={handleWheel}
        >
          <div className="md:w-12" />

          {media.length > 0
            ? media.map((item) => (
                <div
                  onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                    e.preventDefault()
                  }
                  key={item.id}
                  className="relative mt-4 group cursor-pointer user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto"
                >
                  <MediaCard
                    linkable
                    key={item.id}
                    media={{
                      id: item.id.toString(),
                      title: item.title || item.name || "",
                      poster: item.poster_path
                        ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                        : "/placeholder.png",
                      type: isTVShow ? "show" : "movie",
                      year: isTVShow
                        ? item.first_air_date
                          ? parseInt(item.first_air_date.split("-")[0], 10)
                          : undefined
                        : item.release_date
                          ? parseInt(item.release_date.split("-")[0], 10)
                          : undefined,
                    }}
                    onShowDetails={onShowDetails}
                  />
                </div>
              ))
            : Array(10)
                .fill(null)
                .map((_, _i) => (
                  <MediaCardSkeleton
                    key={`skeleton-${categorySlug}-${Math.random().toString(36).substring(2)}`}
                  />
                ))}

          {moreContent && generatedMoreLink && (
            <MoreCard link={generatedMoreLink} />
          )}

          <div className="md:w-12" />
        </div>

        {!isMobile && (
          <CarouselNavButtons
            categorySlug={categorySlug}
            carouselRefs={carouselRefs}
          />
        )}
      </div>
    </div>
  );
}
