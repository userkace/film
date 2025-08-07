import classNames from "classnames";
import { t } from "i18next";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/buttons/Button";
import { WideContainer } from "@/components/layout/WideContainer";
import { DetailsModal } from "@/components/overlays/detailsModal";
import { useModal } from "@/components/overlays/Modal";
import { useDiscoverStore } from "@/stores/discover";
import { useProgressStore } from "@/stores/progress";
import { MediaItem } from "@/utils/mediaTypes";

import { DiscoverNavigation } from "./components/DiscoverNavigation";
import type { FeaturedMedia } from "./components/FeaturedCarousel";
import { LazyTabContent } from "./components/LazyTabContent";
import { MediaCarousel } from "./components/MediaCarousel";
import { ScrollToTopButton } from "./components/ScrollToTopButton";

export function DiscoverContent() {
  const { selectedCategory, setSelectedCategory } = useDiscoverStore();
  const [detailsData, setDetailsData] = useState<any>();
  const navigate = useNavigate();
  const detailsModal = useModal("discover-details");
  const carouselRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const progressItems = useProgressStore((state) => state.items);

  // Only load data for the active tab
  const isMoviesTab = selectedCategory === "movies";
  const isTVShowsTab = selectedCategory === "tvshows";
  const isEditorPicksTab = selectedCategory === "editorpicks";

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as "movies" | "tvshows" | "editorpicks");
  };

  const handleShowDetails = async (media: MediaItem | FeaturedMedia) => {
    setDetailsData({
      id: Number(media.id),
      type: media.type === "movie" ? "movie" : "show",
    });
    detailsModal.show();
  };

  const movieProgressItems = Object.entries(progressItems || {}).filter(
    ([_, item]) => item.type === "movie",
  );
  const tvProgressItems = Object.entries(progressItems || {}).filter(
    ([_, item]) => item.type === "show",
  );

  // Render Movies content with lazy loading
  const renderMoviesContent = () => {
    return (
      <>
        {/* Movie Recommendations - only show if there are movie progress items */}
        {movieProgressItems.length > 0 && (
          <MediaCarousel
            content={{ type: "recommendations" }}
            isTVShow={false}
            carouselRefs={carouselRefs}
            onShowDetails={handleShowDetails}
            moreContent
            showRecommendations
          />
        )}

        {/* Latest Releases */}
        <MediaCarousel
          content={{ type: "latest", fallback: "nowPlaying" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />

        {/* 4K Releases */}
        <MediaCarousel
          content={{ type: "latest4k", fallback: "popular" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />

        {/* Top Rated */}
        <MediaCarousel
          content={{ type: "topRated" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />

        {/* Provider Movies */}
        <MediaCarousel
          content={{ type: "provider" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          showProviders
          moreContent
        />

        {/* Genre Movies */}
        <MediaCarousel
          content={{ type: "genre" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          showGenres
          moreContent
        />
      </>
    );
  };

  // Render TV Shows content with lazy loading
  const renderTVShowsContent = () => {
    return (
      <>
        {/* TV Show Recommendations - only show if there are TV show progress items */}
        {tvProgressItems.length > 0 && (
          <MediaCarousel
            content={{ type: "recommendations" }}
            isTVShow
            carouselRefs={carouselRefs}
            onShowDetails={handleShowDetails}
            moreContent
            showRecommendations
          />
        )}

        {/* On Air */}
        <MediaCarousel
          content={{ type: "latesttv", fallback: "onTheAir" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />

        {/* Top Rated */}
        <MediaCarousel
          content={{ type: "topRated" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />

        {/* Popular */}
        <MediaCarousel
          content={{ type: "popular" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />

        {/* Provider TV Shows */}
        <MediaCarousel
          content={{ type: "provider" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          showProviders
          moreContent
        />

        {/* Genre TV Shows */}
        <MediaCarousel
          content={{ type: "genre" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          showGenres
          moreContent
        />
      </>
    );
  };

  // Render Editor Picks content
  const renderEditorPicksContent = () => {
    return (
      <>
        <MediaCarousel
          content={{ type: "editorPicks" }}
          isTVShow={false}
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
        <MediaCarousel
          content={{ type: "editorPicks" }}
          isTVShow
          carouselRefs={carouselRefs}
          onShowDetails={handleShowDetails}
          moreContent
        />
      </>
    );
  };

  return (
    <div className="relative min-h-screen">
      <DiscoverNavigation
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <WideContainer ultraWide classNames="!px-0">
        {/* Movies Tab */}
        <LazyTabContent isActive={isMoviesTab}>
          {renderMoviesContent()}
        </LazyTabContent>

        {/* TV Shows Tab */}
        <LazyTabContent isActive={isTVShowsTab}>
          {renderTVShowsContent()}
        </LazyTabContent>

        {/* Editor Picks Tab */}
        <LazyTabContent isActive={isEditorPicksTab}>
          {renderEditorPicksContent()}
        </LazyTabContent>
      </WideContainer>

      {/* View All Button */}
      <div
        className={classNames(
          "flex justify-center mt-8 mb-12",
          isMoviesTab ? "block" : "hidden",
        )}
      >
        <Button theme="purple" onClick={() => navigate("/discover/all")}>
          {t("discover.viewLists")}
        </Button>
      </div>

      <ScrollToTopButton />

      {detailsData && <DetailsModal id="discover-details" data={detailsData} />}
    </div>
  );
}

export default DiscoverContent;
