import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { TmdbMovie, getLetterboxdLists } from "@/backend/metadata/letterboxd";
import { Icon, Icons } from "@/components/Icon";
import { WideContainer } from "@/components/layout/WideContainer";
import { MediaCard } from "@/components/media/MediaCard";
import { DetailsModal } from "@/components/overlays/detailsModal";
import { useModal } from "@/components/overlays/Modal";
import { Heading1 } from "@/components/utils/Text";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CarouselNavButtons } from "@/pages/discover/components/CarouselNavButtons";
import { SubPageLayout } from "@/pages/layouts/SubPageLayout";
import { useDiscoverStore } from "@/stores/discover";
import { MediaItem } from "@/utils/mediaTypes";

import { MediaCarousel } from "./components/MediaCarousel";

export function DiscoverMore() {
  const [detailsData, setDetailsData] = useState<any>();
  const [letterboxdLists, setLetterboxdLists] = useState<any[]>([]);
  const detailsModal = useModal("discover-details");
  const carouselRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const navigate = useNavigate();
  const { lastView } = useDiscoverStore();
  const { isMobile } = useIsMobile();

  // Track overflow states for Letterboxd lists
  const [overflowStates, setOverflowStates] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchLetterboxdLists = async () => {
      try {
        const response = await getLetterboxdLists();
        setLetterboxdLists(response.lists);
      } catch (error) {
        console.error("Failed to fetch Letterboxd lists:", error);
      }
    };

    fetchLetterboxdLists();
  }, []);

  const handleShowDetails = async (media: MediaItem) => {
    setDetailsData({
      id: Number(media.id),
      type: media.type === "movie" ? "movie" : "show",
    });
    detailsModal.show();
  };

  const handleBack = () => {
    if (lastView) {
      navigate(lastView.url);
      window.scrollTo(0, lastView.scrollPosition);
    } else {
      navigate(-1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Function to check overflow for a carousel
  const checkOverflow = (element: HTMLDivElement | null, key: string) => {
    if (!element) {
      setOverflowStates((prev) => ({ ...prev, [key]: false }));
      return;
    }

    const hasOverflow = element.scrollWidth > element.clientWidth;
    setOverflowStates((prev) => ({ ...prev, [key]: hasOverflow }));
  };

  // Function to set carousel ref and check overflow
  const setCarouselRef = (element: HTMLDivElement | null, key: string) => {
    carouselRefs.current[key] = element;

    // Check overflow after a short delay to ensure content is rendered
    setTimeout(() => checkOverflow(element, key), 100);
  };

  // Effect to recheck overflow on window resize
  useEffect(() => {
    const handleResize = () => {
      // Recheck overflow for all carousels
      Object.keys(carouselRefs.current).forEach((key) => {
        const element = carouselRefs.current[key];
        if (element) {
          checkOverflow(element, key);
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SubPageLayout>
      <WideContainer>
        <div className="flex items-center justify-between gap-8">
          <Heading1 className="text-2xl font-bold text-white">
            {t("discover.allLists")}
          </Heading1>
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
      </WideContainer>
      <WideContainer ultraWide>
        {/* Latest Movies */}
        <div className="relative">
          <MediaCarousel
            content={{ type: "latest", fallback: "nowPlaying" }}
            isTVShow={false}
            carouselRefs={carouselRefs}
            onShowDetails={handleShowDetails}
          />
        </div>

        {/* Top Rated Movies */}
        <div className="relative">
          <MediaCarousel
            content={{ type: "latest4k", fallback: "topRated" }}
            isTVShow={false}
            carouselRefs={carouselRefs}
            onShowDetails={handleShowDetails}
          />
        </div>

        {/* Letterboxd Lists */}
        {letterboxdLists.map((list) => (
          <div key={list.listUrl}>
            <div className="flex items-center justify-between ml-2 md:ml-8 mt-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl cursor-default font-bold text-white md:text-2xl pl-5 text-balance">
                    {list.listName}
                  </h2>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden carousel-container md:pb-4">
              <div
                className="grid grid-flow-col auto-cols-max gap-4 pt-0 overflow-x-scroll scrollbar-none rounded-xl overflow-y-hidden md:pl-8 md:pr-8"
                ref={(el) => setCarouselRef(el, list.listUrl)}
                onWheel={handleWheel}
              >
                <div className="md:w-12" />
                {list.tmdbMovies.map((movie: TmdbMovie) => (
                  <div
                    key={movie.id}
                    className="relative mt-4 group cursor-pointer user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto"
                  >
                    <MediaCard
                      linkable
                      media={{
                        id: movie.id.toString(),
                        title: movie.title,
                        poster: movie.poster_path
                          ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                          : "/placeholder.png",
                        type: "movie",
                        year: movie.release_date
                          ? parseInt(movie.release_date.split("-")[0], 10)
                          : undefined,
                      }}
                      onShowDetails={handleShowDetails}
                    />
                  </div>
                ))}
                <div className="md:w-12" />
              </div>
              {!isMobile && (
                <CarouselNavButtons
                  categorySlug={list.listUrl}
                  carouselRefs={carouselRefs}
                  hasOverflow={overflowStates[list.listUrl]}
                />
              )}
            </div>
          </div>
        ))}
      </WideContainer>
      {detailsData && <DetailsModal id="discover-details" data={detailsData} />}
    </SubPageLayout>
  );
}
