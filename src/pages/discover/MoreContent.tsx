import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useWindowSize } from "react-use";

import { Button } from "@/components/buttons/Button";
import { Dropdown, OptionItem } from "@/components/form/Dropdown";
import { Icon, Icons } from "@/components/Icon";
import { WideContainer } from "@/components/layout/WideContainer";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaGrid } from "@/components/media/MediaGrid";
import { DetailsModal } from "@/components/overlays/detailsModal";
import { useModal } from "@/components/overlays/Modal";
import { Heading1 } from "@/components/utils/Text";
import {
  DiscoverContentType,
  MediaType,
  useDiscoverMedia,
  useDiscoverOptions,
} from "@/pages/discover/hooks/useDiscoverMedia";
import { SubPageLayout } from "@/pages/layouts/SubPageLayout";
import { useDiscoverStore } from "@/stores/discover";
import { useProgressStore } from "@/stores/progress";
import { MediaItem } from "@/utils/mediaTypes";

interface MoreContentProps {
  onShowDetails?: (media: MediaItem) => void;
}

export function MoreContent({ onShowDetails }: MoreContentProps) {
  const { mediaType = "movie", contentType, id, category } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsData, setDetailsData] = useState<any>();
  const [selectedProvider, setSelectedProvider] = useState<OptionItem | null>(
    null,
  );
  const [selectedGenre, setSelectedGenre] = useState<OptionItem | null>(null);
  const [selectedRecommendationId, setSelectedRecommendationId] =
    useState<string>("");
  const [isContentVisible, setIsContentVisible] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const detailsModal = useModal("discover-details");
  const { lastView } = useDiscoverStore();
  const { width: windowWidth } = useWindowSize();
  const progressStore = useProgressStore();

  // Get available providers and genres
  const { providers, genres } = useDiscoverOptions(mediaType as MediaType);

  // Get recommendation sources from progress store
  const recommendationSources = Object.entries(progressStore.items || {})
    .filter(
      ([_itemId, item]) =>
        item.type === (mediaType === "tv" ? "show" : "movie"),
    )
    .map(([itemId, item]) => ({
      id: itemId,
      title: item.title || "",
    }));

  // Determine the actual content type and ID from URL parameters
  const actualContentType = contentType || category?.split("-")[0] || "popular";
  const actualMediaType =
    mediaType || (category?.endsWith("-tv") ? "tv" : "movie");

  // Fetch media using our hook
  const {
    media: mediaItems,
    isLoading,
    hasMore,
    sectionTitle,
  } = useDiscoverMedia({
    contentType: actualContentType as DiscoverContentType,
    mediaType: actualMediaType as MediaType,
    id:
      id ||
      selectedProvider?.id ||
      selectedGenre?.id ||
      selectedRecommendationId,
    page: currentPage,
    genreName: selectedGenre?.name,
    providerName: selectedProvider?.name,
    mediaTitle: recommendationSources.find(
      (s) => s.id === selectedRecommendationId,
    )?.title,
    isCarouselView: false,
  });

  // Handle content visibility
  useEffect(() => {
    if (!isLoading || currentPage > 1) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsContentVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
    setIsContentVisible(false);
  }, [isLoading, mediaItems, currentPage]);

  const handleBack = () => {
    if (lastView) {
      navigate(lastView.url);
      window.scrollTo(0, lastView.scrollPosition);
    } else {
      navigate(-1);
    }
  };

  const handleShowDetails = async (media: MediaItem) => {
    if (onShowDetails) {
      onShowDetails(media);
      return;
    }
    setDetailsData({
      id: Number(media.id),
      type: media.type === "movie" ? "movie" : "show",
    });
    detailsModal.show();
  };

  const handleLoadMore = async () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Set initial provider/genre/recommendation selection
  useEffect(() => {
    if (contentType === "provider" && id) {
      const provider = providers.find((p) => p.id === id);
      if (provider) {
        setSelectedProvider({ id: provider.id, name: provider.name });
      }
    } else if (contentType === "genre" && id) {
      const genre = genres.find((g) => g.id.toString() === id);
      if (genre) {
        setSelectedGenre({ id: genre.id.toString(), name: genre.name });
      }
    } else if (contentType === "recommendations" && id) {
      setSelectedRecommendationId(id);
    }
  }, [contentType, id, providers, genres]);

  // Handle selection changes
  useEffect(() => {
    if (contentType === "provider" && selectedProvider) {
      navigate(
        `/discover/more/provider/${selectedProvider.id}/${actualMediaType}`,
      );
    } else if (contentType === "genre" && selectedGenre) {
      navigate(`/discover/more/genre/${selectedGenre.id}/${actualMediaType}`);
    } else if (contentType === "recommendations" && selectedRecommendationId) {
      navigate(
        `/discover/more/recommendations/${selectedRecommendationId}/${actualMediaType}`,
      );
    }
  }, [
    selectedProvider,
    selectedGenre,
    selectedRecommendationId,
    contentType,
    actualMediaType,
    navigate,
  ]);

  // Split buttons into visible and dropdown based on window width
  const { visibleButtons, dropdownButtons } = React.useMemo(() => {
    const items =
      contentType === "provider"
        ? providers
        : contentType === "genre"
          ? genres
          : [];

    const visible = windowWidth > 850 ? items.slice(0, 7) : items.slice(0, 2);
    const dropdown = windowWidth > 850 ? items.slice(7) : items.slice(2);

    return { visibleButtons: visible, dropdownButtons: dropdown };
  }, [contentType, providers, genres, windowWidth]);

  if (isLoading && currentPage === 1) {
    return (
      <SubPageLayout>
        <WideContainer>
          <div className="animate-pulse">
            <div className="h-8 bg-mediaCard-hoverBackground rounded w-1/4 mb-8" />
            <MediaGrid>
              {Array(20)
                .fill(null)
                .map(() => (
                  <div
                    key={`loading-skeleton-${Math.random().toString(36).substring(2)}`}
                    className="relative group cursor-default user-select-none rounded-xl p-2 bg-transparent"
                  >
                    <div className="animate-pulse">
                      <div className="w-full aspect-[2/3] bg-mediaCard-hoverBackground rounded-lg" />
                      <div className="mt-2 h-4 bg-mediaCard-hoverBackground rounded w-3/4" />
                    </div>
                  </div>
                ))}
            </MediaGrid>
          </div>
        </WideContainer>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout>
      <WideContainer>
        <div className="flex items-center justify-between gap-8">
          <Heading1 className="text-2xl font-bold text-white">
            {sectionTitle}
          </Heading1>
          {contentType === "recommendations" && (
            <div className="relative pr-4">
              <Dropdown
                selectedItem={
                  recommendationSources.find(
                    (s) => s.id === selectedRecommendationId,
                  )
                    ? {
                        id: selectedRecommendationId,
                        name:
                          recommendationSources.find(
                            (s) => s.id === selectedRecommendationId,
                          )?.title || "",
                      }
                    : { id: "", name: "..." }
                }
                setSelectedItem={(item) => setSelectedRecommendationId(item.id)}
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
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pb-8">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center text-white hover:text-gray-300 transition-colors"
          >
            <Icon className="text-xl" icon={Icons.ARROW_LEFT} />
            <span className="ml-2">{t("discover.page.back")}</span>
          </button>
        </div>

        {(contentType === "provider" || contentType === "genre") && (
          <div className="flex items-center space-x-2 mb-4">
            {visibleButtons.map((item: any) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  if (contentType === "provider") {
                    setSelectedProvider({ id: item.id, name: item.name });
                  } else {
                    setSelectedGenre({
                      id: item.id.toString(),
                      name: item.name,
                    });
                  }
                }}
                className={`px-3 py-1 text-sm rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                  item.id.toString() ===
                  (selectedProvider?.id || selectedGenre?.id)
                    ? "bg-mediaCard-background"
                    : "bg-mediaCard-hoverBackground hover:bg-mediaCard-background"
                }`}
              >
                {item.name}
              </button>
            ))}
            {dropdownButtons.length > 0 && (
              <div className="relative">
                <Dropdown
                  selectedItem={
                    contentType === "provider"
                      ? selectedProvider || { id: "", name: "..." }
                      : selectedGenre || { id: "", name: "..." }
                  }
                  setSelectedItem={(item) => {
                    if (contentType === "provider") {
                      setSelectedProvider(item);
                    } else {
                      setSelectedGenre(item);
                    }
                  }}
                  options={dropdownButtons.map((item: any) => ({
                    id:
                      contentType === "provider" ? item.id : item.id.toString(),
                    name: item.name,
                  }))}
                  customButton={
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-mediaCard-hoverBackground hover:bg-mediaCard-background rounded-full transition-colors flex items-center gap-1"
                    >
                      <span>...</span>
                      <Icon
                        icon={Icons.UP_DOWN_ARROW}
                        className="text-xs text-dropdown-secondary"
                      />
                    </button>
                  }
                  side="right"
                />
              </div>
            )}
          </div>
        )}

        <div
          className={`transition-opacity duration-300 ease-in-out ${
            isContentVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <MediaGrid>
            {mediaItems.map((item) => {
              const isTVShow = Boolean(item.first_air_date);
              const releaseDate = isTVShow
                ? item.first_air_date
                : item.release_date;
              const year = releaseDate
                ? parseInt(releaseDate.split("-")[0], 10)
                : undefined;

              const mediaItem: MediaItem = {
                id: item.id.toString(),
                title: item.title || item.name || "",
                poster: item.poster_path
                  ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                  : "/placeholder.png",
                type: isTVShow ? "show" : "movie",
                year,
                release_date: releaseDate ? new Date(releaseDate) : undefined,
              };

              return (
                <div
                  key={item.id}
                  style={{ userSelect: "none" }}
                  onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                    e.preventDefault()
                  }
                >
                  <MediaCard
                    media={mediaItem}
                    onShowDetails={handleShowDetails}
                    linkable
                  />
                </div>
              );
            })}
          </MediaGrid>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                theme="purple"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading
                  ? t("discover.page.loading")
                  : t("discover.page.loadMore")}
              </Button>
            </div>
          )}
        </div>
      </WideContainer>
      {detailsData && <DetailsModal id="discover-details" data={detailsData} />}
    </SubPageLayout>
  );
}
