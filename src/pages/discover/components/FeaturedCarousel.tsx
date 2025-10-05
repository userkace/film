import classNames from "classnames";
import { t } from "i18next";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "react-use";

import { isExtensionActive } from "@/backend/extension/messaging";
import { get, getMediaLogo } from "@/backend/metadata/tmdb";
import {
  TraktReleaseResponse,
  getDiscoverContent,
  getReleaseDetails,
} from "@/backend/metadata/traktApi";
import { TMDBContentTypes } from "@/backend/metadata/types/tmdb";
import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { Movie, TVShow } from "@/pages/discover/common";
import { conf } from "@/setup/config";
import { useDiscoverStore } from "@/stores/discover";
import { useLanguageStore } from "@/stores/language";
import { usePreferencesStore } from "@/stores/preferences";
import { scrapeIMDb } from "@/utils/imdbScraper";
import { getTmdbLanguageCode } from "@/utils/language";

import { RandomMovieButton } from "./RandomMovieButton";
import {
  EDITOR_PICKS_MOVIES,
  EDITOR_PICKS_TV_SHOWS,
} from "../hooks/useDiscoverMedia";

export interface FeaturedMedia extends Partial<Movie & TVShow> {
  children?: ReactNode;
  backdrop_path: string;
  overview: string;
  title?: string;
  name?: string;
  type: "movie" | "show";
  vote_average?: number;
  vote_count?: number;
  number_of_seasons?: number;
  imdb_rating?: number;
  imdb_votes?: number;
  external_ids?: {
    imdb_id?: string;
  };
}

interface FeaturedCarouselProps {
  onShowDetails: (media: FeaturedMedia) => void;
  children?: ReactNode;
  searching?: boolean;
  shorter?: boolean;
  forcedCategory?: "movies" | "tvshows" | "editorpicks";
}

interface IMDbRatingData {
  rating: number;
  votes: number;
}

function FeaturedCarouselSkeleton({ shorter }: { shorter?: boolean }) {
  return (
    <div
      className={classNames(
        "relative w-full transition-[height] duration-300 ease-in-out",
        shorter ? "h-[75vh]" : "h-[75vh] md:h-[100vh]",
      )}
    >
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-900"
          style={{
            maskImage:
              "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 500px)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 500px)",
          }}
        />
      </div>

      {/* Navigation Buttons Skeleton */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30">
        <div className="w-8 h-8 bg-gray-900 rounded-full animate-pulse" />
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30">
        <div className="w-8 h-8 bg-gray-900 rounded-full animate-pulse" />
      </div>

      {/* Navigation Dots Skeleton */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[19] flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-gray-900 animate-pulse"
          />
        ))}
      </div>

      {/* Content Overlay Skeleton */}
      <div className="absolute inset-0 flex items-end pb-20 z-10">
        <div className="container mx-auto px-8 md:px-4">
          <div className="max-w-3xl">
            <div className="h-12 w-48 bg-gray-900 rounded animate-pulse mb-6" />
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-gray-900 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-900 rounded animate-pulse w-1/2" />
            </div>
            <div className="flex gap-4 justify-center items-center sm:justify-start">
              <div className="h-10 w-32 bg-gray-900 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-900 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedCarousel({
  onShowDetails,
  children,
  searching,
  shorter,
  forcedCategory,
}: FeaturedCarouselProps) {
  const { selectedCategory } = useDiscoverStore();
  const effectiveCategory = forcedCategory || selectedCategory;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [media, setMedia] = useState<FeaturedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imdbRatings, setImdbRatings] = useState<
    Record<string, IMDbRatingData>
  >({});
  const hasExtension = useRef<boolean>(false);
  const logoFetchController = useRef<AbortController | null>(null);
  const autoPlayInterval = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const enableImageLogos = usePreferencesStore(
    (state) => state.enableImageLogos,
  );
  const userLanguage = useLanguageStore((s) => s.language);
  const formattedLanguage = getTmdbLanguageCode(userLanguage);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [releaseInfo, setReleaseInfo] = useState<TraktReleaseResponse | null>(
    null,
  );
  const [contentOpacity, setContentOpacity] = useState(1);

  const currentMedia = media[currentIndex];

  const SLIDE_QUANTITY = 10;
  const FETCH_QUANTITY = 20;
  const SLIDE_QUANTITY_EDITOR_PICKS_MOVIES = 6;
  const SLIDE_QUANTITY_EDITOR_PICKS_TV_SHOWS = 4;
  const SLIDE_DURATION = 8000;

  // Check for extension on mount
  useEffect(() => {
    isExtensionActive().then((active) => {
      hasExtension.current = active;
    });
  }, []);

  // Fetch IMDb ratings when media changes
  useEffect(() => {
    const fetchImdbRatings = async () => {
      if (!hasExtension.current || !currentMedia?.external_ids?.imdb_id) return;

      try {
        const imdbData = await scrapeIMDb(
          currentMedia.external_ids.imdb_id,
          undefined,
          undefined,
          undefined,
          currentMedia.type,
        );
        // Only update if we have both rating and votes as non-null numbers
        if (
          typeof imdbData.imdb_rating === "number" &&
          typeof imdbData.votes === "number"
        ) {
          const ratingData: IMDbRatingData = {
            rating: imdbData.imdb_rating,
            votes: imdbData.votes,
          };
          setImdbRatings((prev) => ({
            ...prev,
            [currentMedia.external_ids!.imdb_id!]: ratingData,
          }));
        }
      } catch (error) {
        console.error("Error fetching IMDb ratings:", error);
      }
    };

    if (currentMedia) {
      fetchImdbRatings();
    }
  }, [currentMedia]);

  useEffect(() => {
    const fetchFeaturedMedia = async () => {
      setIsLoading(true);
      // Clear all previous data when transitioning
      setLogoUrl(undefined);
      setImdbRatings({});
      setReleaseInfo(null);
      setCurrentIndex(0);
      setContentOpacity(1);
      if (logoFetchController.current) {
        logoFetchController.current.abort(); // Cancel any in-progress logo fetches
      }
      try {
        if (effectiveCategory === "movies" || effectiveCategory === "tvshows") {
          // First try to get IDs from Trakt discover endpoint
          try {
            const discoverData = await getDiscoverContent();

            let tmdbIds: number[] = [];
            if (effectiveCategory === "movies") {
              tmdbIds = discoverData.movie_tmdb_ids;
            } else {
              tmdbIds = discoverData.tv_tmdb_ids;
            }

            // Then fetch full details for each movie/show to get external_ids
            const detailPromises = tmdbIds.map((id) =>
              get<any>(
                `/${effectiveCategory === "movies" ? "movie" : "tv"}/${id}`,
                {
                  api_key: conf().TMDB_READ_API_KEY,
                  language: formattedLanguage,
                  append_to_response: "external_ids",
                },
              ),
            );

            const details = await Promise.all(detailPromises);
            const mediaItems = details.map((item) => ({
              ...item,
              type:
                effectiveCategory === "movies" ? "movie" : ("show" as const),
            }));

            // Take the first SLIDE_QUANTITY items
            setMedia(mediaItems.slice(0, SLIDE_QUANTITY));
          } catch (traktError) {
            console.error(
              "Falling back to TMDB method",
              "Error fetching from Trakt discover:",
              traktError,
            );

            // Fallback to TMDB method
            if (effectiveCategory === "movies") {
              // First get the list of popular movies
              const listData = await get<any>("/movie/popular", {
                api_key: conf().TMDB_READ_API_KEY,
                language: formattedLanguage,
              });

              // Then fetch full details for each movie to get external_ids
              const moviePromises = listData.results
                .slice(0, FETCH_QUANTITY)
                .map((movie: any) =>
                  get<any>(`/movie/${movie.id}`, {
                    api_key: conf().TMDB_READ_API_KEY,
                    language: formattedLanguage,
                    append_to_response: "external_ids",
                  }),
                );

              const movieDetails = await Promise.all(moviePromises);
              const allMovies = movieDetails.map((movie) => ({
                ...movie,
                type: "movie" as const,
              }));

              // Shuffle
              const shuffledMovies = [...allMovies].sort(
                () => 0.5 - Math.random(),
              );
              setMedia(shuffledMovies.slice(0, SLIDE_QUANTITY));
            } else if (effectiveCategory === "tvshows") {
              // First get the list of popular shows
              const listData = await get<any>("/tv/popular", {
                api_key: conf().TMDB_READ_API_KEY,
                language: formattedLanguage,
              });

              // Then fetch full details for each show to get external_ids
              const showPromises = listData.results
                .slice(0, FETCH_QUANTITY)
                .map((show: any) =>
                  get<any>(`/tv/${show.id}`, {
                    api_key: conf().TMDB_READ_API_KEY,
                    language: formattedLanguage,
                    append_to_response: "external_ids",
                  }),
                );

              const showDetails = await Promise.all(showPromises);
              const allShows = showDetails.map((show) => ({
                ...show,
                type: "show" as const,
              }));

              // Shuffle
              const shuffledShows = [...allShows].sort(
                () => 0.5 - Math.random(),
              );
              setMedia(shuffledShows.slice(0, SLIDE_QUANTITY));
            }
          }
        } else if (effectiveCategory === "editorpicks") {
          // Shuffle editor picks Ids
          const allMovieIds = EDITOR_PICKS_MOVIES.map((item) => ({
            id: item.id,
            type: "movie" as const,
          }));
          const allShowIds = EDITOR_PICKS_TV_SHOWS.map((item) => ({
            id: item.id,
            type: "show" as const,
          }));

          // Combine and shuffle
          const combinedIds = [...allMovieIds, ...allShowIds].sort(
            () => 0.5 - Math.random(),
          );

          // Select the quantity
          const selectedMovieIds = combinedIds
            .filter((item) => item.type === "movie")
            .slice(0, SLIDE_QUANTITY_EDITOR_PICKS_MOVIES);
          const selectedShowIds = combinedIds
            .filter((item) => item.type === "show")
            .slice(0, SLIDE_QUANTITY_EDITOR_PICKS_TV_SHOWS);

          // Fetch items
          const moviePromises = selectedMovieIds.map(({ id }) =>
            get<any>(`/movie/${id}`, {
              api_key: conf().TMDB_READ_API_KEY,
              language: formattedLanguage,
              append_to_response: "external_ids",
            }),
          );

          const showPromises = selectedShowIds.map(({ id }) =>
            get<any>(`/tv/${id}`, {
              api_key: conf().TMDB_READ_API_KEY,
              language: formattedLanguage,
              append_to_response: "external_ids",
            }),
          );

          const [movieResults, showResults] = await Promise.all([
            Promise.all(moviePromises),
            Promise.all(showPromises),
          ]);

          const movies = movieResults.map((movie) => ({
            ...movie,
            type: "movie" as const,
          }));
          const shows = showResults.map((show) => ({
            ...show,
            type: "show" as const,
          }));

          setMedia([...movies, ...shows]);
        }
      } catch (error) {
        console.error("Error fetching featured media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedMedia();
  }, [formattedLanguage, effectiveCategory]);

  const handlePrevSlide = () => {
    setContentOpacity(0);
    setImdbRatings({});
    setReleaseInfo(null);

    // Wait for fade out, then change index and fade in
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
      // Clear logo after index change so new logo can load
      setLogoUrl(undefined);
      setTimeout(() => setContentOpacity(1), 100);
    }, 150);

    // Reset autoplay timer
    if (autoPlayInterval.current) {
      clearInterval(autoPlayInterval.current);
    }
    if (isAutoPlaying) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }, 5000);
    }
  };

  const handleNextSlide = () => {
    setContentOpacity(0);
    setImdbRatings({});
    setReleaseInfo(null);

    // Wait for fade out, then change index and fade in
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
      // Clear logo after index change so new logo can load
      setLogoUrl(undefined);
      setTimeout(() => setContentOpacity(1), 100);
    }, 150);

    // Reset autoplay timer
    if (autoPlayInterval.current) {
      clearInterval(autoPlayInterval.current);
    }
    if (isAutoPlaying) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }, 5000);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Fetch clear logo when current media changes
  useEffect(() => {
    const fetchLogo = async () => {
      // Cancel any in-progress logo fetch
      if (logoFetchController.current) {
        logoFetchController.current.abort();
      }

      // Create new abort controller for this fetch
      logoFetchController.current = new AbortController();

      const currentMediaId = media[currentIndex]?.id;
      if (!currentMediaId) {
        setLogoUrl(undefined);
        return;
      }

      try {
        const logo = await getMediaLogo(
          currentMediaId.toString(),
          media[currentIndex].type === "movie"
            ? TMDBContentTypes.MOVIE
            : TMDBContentTypes.TV,
        );
        // Only update if this is still the current media
        if (media[currentIndex]?.id === currentMediaId) {
          setLogoUrl(logo);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          // Ignore abort errors
          return;
        }
        console.error("Error fetching logo:", error);
        setLogoUrl(undefined);
      }
    };

    fetchLogo();

    return () => {
      if (logoFetchController.current) {
        logoFetchController.current.abort();
      }
    };
  }, [currentIndex, media]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (logoFetchController.current) {
        logoFetchController.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (isAutoPlaying && media.length > 0) {
      autoPlayInterval.current = setInterval(() => {
        setContentOpacity(0);
        setImdbRatings({});
        setReleaseInfo(null);

        // Wait for fade out, then change index and fade in
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % media.length);
          // Clear logo after index change so new logo can load
          setLogoUrl(undefined);
          setTimeout(() => setContentOpacity(1), 100);
        }, 150);
      }, SLIDE_DURATION);
    }

    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
    };
  }, [isAutoPlaying, media.length]);

  useEffect(() => {
    const fetchReleaseInfo = async () => {
      if (currentMedia?.id) {
        try {
          const info = await getReleaseDetails(currentMedia.id.toString());
          setReleaseInfo(info);
        } catch (error) {
          console.error("Failed to fetch release info:", error);
        }
      }
    };
    fetchReleaseInfo();
  }, [currentMedia?.id]);

  if (isLoading) {
    return <FeaturedCarouselSkeleton shorter={shorter} />;
  }

  if (media.length === 0) {
    return <FeaturedCarouselSkeleton shorter={shorter} />;
  }

  const mediaTitle = currentMedia.title || currentMedia.name;

  let searchClasses = "";
  if (searching) searchClasses = "opacity-0 transition-opacity duration-300";
  else searchClasses = "opacity-100 transition-opacity duration-300";

  const getQualityIndicator = () => {
    if (!releaseInfo || currentMedia.type === "show") return null;

    const hasDigitalRelease = !!releaseInfo.digital_release_date;
    const hasTheatricalRelease = !!releaseInfo.theatrical_release_date;

    if (hasDigitalRelease) {
      const digitalReleaseDate = new Date(releaseInfo.digital_release_date!);
      const twoDaysAfter = new Date(digitalReleaseDate);
      twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

      if (new Date() >= twoDaysAfter) {
        return <span className="text-green-400">HD</span>;
      }
    }

    if (hasTheatricalRelease) {
      const theatricalReleaseDate = new Date(
        releaseInfo.theatrical_release_date!,
      );
      const fortyFiveDaysAfter = new Date(theatricalReleaseDate);
      fortyFiveDaysAfter.setDate(fortyFiveDaysAfter.getDate() + 45);

      if (new Date() >= fortyFiveDaysAfter) {
        return (
          <div className="px-2 py-1 rounded-lg backdrop-blur-sm bg-gray-600/40">
            <span className="text-green-400">HD</span>
          </div>
        );
      }

      return (
        <div className="px-2 py-1 rounded-lg backdrop-blur-sm bg-gray-600/40">
          <span className="text-yellow-400">CAM</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={classNames(
        "relative w-full transition-[height] duration-300 ease-in-out",
        searching
          ? "h-24"
          : shorter
            ? windowHeight > 600
              ? "h-[40rem] md:h-[85vh]"
              : "h-[100vh]"
            : "h-[40rem] md:h-[100vh]",
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={classNames(
          "relative w-full h-full overflow-hidden",
          searchClasses,
        )}
      >
        {media.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${item.backdrop_path})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              maskImage:
                "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 700px)",
              WebkitMaskImage:
                "linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1) 700px)",
            }}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={handlePrevSlide}
        className={classNames(
          "absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors",
          searchClasses,
        )}
        aria-label="Previous slide"
      >
        <Icon icon={Icons.CHEVRON_LEFT} className="text-white w-8 h-8" />
      </button>
      <button
        type="button"
        onClick={handleNextSlide}
        className={classNames(
          "absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors",
          searchClasses,
        )}
        aria-label="Next slide"
      >
        <Icon icon={Icons.CHEVRON_RIGHT} className="text-white w-8 h-8" />
      </button>

      {/* Navigation Dots */}
      <div
        className={classNames(
          "absolute bottom-8 left-1/2 -translate-x-1/2 z-[19] flex gap-2",
          searchClasses,
        )}
      >
        {media.map((item, index) => (
          <button
            key={`dot-${item.id}`}
            type="button"
            onClick={() => {
              setContentOpacity(0);
              setImdbRatings({});
              setReleaseInfo(null);

              // Wait for fade out, then change index and fade in
              setTimeout(() => {
                setCurrentIndex(index);
                // Clear logo after index change so new logo can load
                setLogoUrl(undefined);
                setTimeout(() => setContentOpacity(1), 100);
              }, 150);

              // Reset autoplay timer when clicking dots
              if (autoPlayInterval.current) {
                clearInterval(autoPlayInterval.current);
              }
              if (isAutoPlaying) {
                autoPlayInterval.current = setInterval(() => {
                  setCurrentIndex((prev) => (prev + 1) % media.length);
                }, 5000);
              }
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content Overlay */}
      <div
        className={classNames(
          "absolute inset-0 flex items-end pb-20 z-10 transition-opacity duration-150",
          searchClasses,
        )}
        style={{ opacity: contentOpacity }}
      >
        <div className="container mx-auto px-8 lg:px-4 flex justify-between items-end w-full">
          <div className="max-w-3xl">
            {logoUrl && enableImageLogos ? (
              <img
                src={logoUrl}
                alt={mediaTitle}
                className="max-w-[14rem] md:max-w-[22rem] max-h-[20vh] object-contain drop-shadow-lg bg-transparent mb-6"
                style={{ background: "none" }}
              />
            ) : (
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {mediaTitle}
              </h1>
            )}
            {/* TMDB Rating and Year/Seasons */}
            <div className="flex items-center gap-2 text-sm text-white/80 mb-4">
              {/* Quality Indicator */}
              {getQualityIndicator() && (
                <>
                  {getQualityIndicator()}
                  <span className="text-white/60">•</span>
                </>
              )}
              {currentMedia?.vote_average && (
                <div className="flex items-center gap-1">
                  <Icon icon={Icons.TMDB} />
                  <span>{currentMedia.vote_average.toFixed(1)}</span>
                  {currentMedia.vote_count && (
                    <span className="text-white/60">
                      ({currentMedia.vote_count.toLocaleString()})
                    </span>
                  )}
                </div>
              )}
              {currentMedia?.external_ids?.imdb_id &&
                imdbRatings[currentMedia.external_ids.imdb_id] && (
                  <>
                    <span className="text-white/60">•</span>
                    <div className="flex items-center gap-1">
                      <Icon icon={Icons.IMDB} className="text-yellow-400" />
                      <span>
                        {imdbRatings[
                          currentMedia.external_ids.imdb_id
                        ].rating.toFixed(1)}
                      </span>
                      <span className="text-white/60">
                        (
                        {imdbRatings[
                          currentMedia.external_ids.imdb_id
                        ].votes.toLocaleString()}
                        )
                      </span>
                    </div>
                  </>
                )}
              {currentMedia?.release_date && (
                <>
                  <span className="text-white/60">•</span>
                  <span>
                    {new Date(currentMedia.release_date).getFullYear()}
                  </span>
                </>
              )}
              {currentMedia?.type === "show" &&
                currentMedia?.number_of_seasons && (
                  <>
                    <span className="text-white/60">•</span>
                    <span>
                      {currentMedia.number_of_seasons} {t("details.seasons")}
                    </span>
                  </>
                )}
            </div>
            <p className="text-lg text-white mb-6 line-clamp-3 md:line-clamp-4">
              {currentMedia.overview}
            </p>
            <div
              className="flex gap-4 justify-center items-center sm:justify-start"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <Button
                onClick={() =>
                  navigate(
                    `/media/tmdb-${currentMedia.type}-${currentMedia.id}-${mediaTitle?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
                  )
                }
                theme="secondary"
                className="w-full sm:w-auto text-base"
              >
                <Icon icon={Icons.PLAY} className="text-white" />
                <span className="text-white">
                  {t("discover.featured.playNow")}
                </span>
              </Button>
              <Button
                onClick={() => onShowDetails(currentMedia)}
                theme="secondary"
                className="w-full sm:w-auto text-base"
              >
                <Icon
                  icon={Icons.CIRCLE_QUESTION}
                  className="text-white scale-100"
                />
                <span className="text-white">
                  {t("discover.featured.moreInfo")}
                </span>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <RandomMovieButton />
          </div>
        </div>
      </div>
      {children && (
        <div
          className={classNames(
            "absolute inset-0 pointer-events-none",
            windowWidth > 1280 ? "pt-0" : "pt-14",
          )}
        >
          <div className="pointer-events-auto z-50">{children}</div>
        </div>
      )}
    </div>
  );
}
