import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { get } from "@/backend/metadata/tmdb";
import {
  GENRE_TO_TRAKT_MAP,
  PROVIDER_TO_TRAKT_MAP,
  TraktLatestResponse,
  getActionReleases,
  getAppleTVReleases,
  getDisneyReleases,
  getDramaReleases,
  getHBOReleases,
  getHuluReleases,
  getLatest4KReleases,
  getLatestReleases,
  getLatestTVReleases,
  getNetflixMovies,
  getNetflixTVShows,
  getPrimeReleases,
  paginateResults,
} from "@/backend/metadata/traktApi";
import { conf } from "@/setup/config";
import { useLanguageStore } from "@/stores/language";
import { getTmdbLanguageCode } from "@/utils/language";

// Shuffle array utility
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Editor Picks lists
export const EDITOR_PICKS_MOVIES = shuffleArray([
  { id: 9342, type: "movie" }, // The Mask of Zorro
  { id: 293, type: "movie" }, // A River Runs Through It
  { id: 370172, type: "movie" }, // No Time To Die
  { id: 661374, type: "movie" }, // The Glass Onion
  { id: 207, type: "movie" }, // Dead Poets Society
  { id: 378785, type: "movie" }, // The Best of the Blues Brothers
  { id: 335984, type: "movie" }, // Blade Runner 2049
  { id: 13353, type: "movie" }, // It's the Great Pumpkin, Charlie Brown
  { id: 27205, type: "movie" }, // Inception
  { id: 106646, type: "movie" }, // The Wolf of Wall Street
  { id: 334533, type: "movie" }, // Captain Fantastic
  { id: 693134, type: "movie" }, // Dune: Part Two
  { id: 765245, type: "movie" }, // Swan Song
  { id: 264660, type: "movie" }, // Ex Machina
  { id: 92591, type: "movie" }, // Bernie
  { id: 976893, type: "movie" }, // Perfect Days
  { id: 13187, type: "movie" }, // A Charlie Brown Christmas
  { id: 11527, type: "movie" }, // Excalibur
  { id: 120, type: "movie" }, // LOTR: The Fellowship of the Ring
  { id: 157336, type: "movie" }, // Interstellar
  { id: 762, type: "movie" }, // Monty Python and the Holy Grail
  { id: 666243, type: "movie" }, // The Witcher: Nightmare of the Wolf
  { id: 545611, type: "movie" }, // Everything Everywhere All at Once
  { id: 329, type: "movie" }, // Jurrassic Park
  { id: 330459, type: "movie" }, // Rogue One: A Star Wars Story
  { id: 279, type: "movie" }, // Amadeus
  { id: 823219, type: "movie" }, // Flow
  { id: 22, type: "movie" }, // Pirates of the Caribbean: The Curse of the Black Pearl
  { id: 18971, type: "movie" }, // Rosencrantz and Guildenstern Are Dead
  { id: 26388, type: "movie" }, // Buried
  { id: 152601, type: "movie" }, // Her
  { id: 11886, type: "movie" }, // Robin Hood
  { id: 1362, type: "movie" }, // The Hobbit 1977
  { id: 578, type: "movie" }, // Jaws
  { id: 78, type: "movie" }, // Blade Runner
  { id: 348, type: "movie" }, // Alien
  { id: 198184, type: "movie" }, // Chappie
  { id: 405774, type: "movie" }, // Bird Box
  { id: 333339, type: "movie" }, // Ready Player One
]);

export const EDITOR_PICKS_TV_SHOWS = shuffleArray([
  { id: 456, type: "show" }, // The Simpsons
  { id: 73021, type: "show" }, // Disenchantment
  { id: 1434, type: "show" }, // Family Guy
  { id: 1695, type: "show" }, // Monk
  { id: 1408, type: "show" }, // House
  { id: 93740, type: "show" }, // Foundation
  { id: 60625, type: "show" }, // Rick and Morty
  { id: 1396, type: "show" }, // Breaking Bad
  { id: 44217, type: "show" }, // Vikings
  { id: 90228, type: "show" }, // Dune Prophecy
  { id: 13916, type: "show" }, // Death Note
  { id: 71912, type: "show" }, // The Witcher
  { id: 61222, type: "show" }, // Bojack Horseman
  { id: 93405, type: "show" }, // Squid Game
  { id: 87108, type: "show" }, // Chernobyl
  { id: 105248, type: "show" }, // Cyberpunk: Edgerunners
  { id: 82738, type: "show" }, // IRODUKU: The World in Colors
  { id: 615, type: "show" }, // Futurama
  { id: 4625, type: "show" }, // The New Batman Adventures
  { id: 513, type: "show" }, // Batman Beyond
  { id: 110948, type: "show" }, // The Snoopy Show
  { id: 110492, type: "show" }, // Peacemaker
  { id: 125988, type: "show" }, // Silo
  { id: 87917, type: "show" }, // For All Mankind
  { id: 42009, type: "show" }, // Black Mirror
  { id: 86831, type: "show" }, // Love, Death & Robots
  { id: 261579, type: "show" }, // Secret Level
]);

/**
 * The type of content to fetch from various endpoints
 */
export type DiscoverContentType =
  | "popular"
  | "topRated"
  | "onTheAir"
  | "nowPlaying"
  | "latest"
  | "latest4k"
  | "latesttv"
  | "genre"
  | "provider"
  | "editorPicks"
  | "recommendations";

/**
 * The type of media to fetch (movie or TV show)
 */
export type MediaType = "movie" | "tv";

/**
 * Props for the useDiscoverMedia hook
 */
export interface UseDiscoverMediaProps {
  /** The type of content to fetch */
  contentType: DiscoverContentType;
  /** Whether to fetch movies or TV shows */
  mediaType: MediaType;
  /** ID used for genre, provider, or recommendations */
  id?: string;
  /** Fallback content type if primary fails */
  fallbackType?: DiscoverContentType;
  /** Page number for paginated results */
  page?: number;
  /** Genre name for display in title */
  genreName?: string;
  /** Provider name for display in title */
  providerName?: string;
  /** Media title for recommendations display */
  mediaTitle?: string;
  /** Whether this is for a carousel view (limits results) */
  isCarouselView?: boolean;
}

/**
 * Media item returned from discover endpoints
 */
export interface DiscoverMedia {
  /** TMDB ID of the media */
  id: number;
  /** Title for movies */
  title: string;
  /** Title for TV shows */
  name?: string;
  /** Poster image path */
  poster_path: string;
  /** Backdrop image path */
  backdrop_path: string;
  /** Release date for movies */
  release_date?: string;
  /** First air date for TV shows */
  first_air_date?: string;
  /** Media overview/description */
  overview: string;
  /** Average vote score (0-10) */
  vote_average: number;
  /** Number of votes */
  vote_count: number;
  /** Type of media (movie or show) */
  type?: "movie" | "show";
}

/**
 * Return type of the useDiscoverMedia hook
 */
export interface UseDiscoverMediaReturn {
  /** Array of media items */
  media: DiscoverMedia[];
  /** Whether media is currently being fetched */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether there are more pages to load */
  hasMore: boolean;
  /** Function to refetch the current media */
  refetch: () => Promise<void>;
  /** Localized section title for the media carousel */
  sectionTitle: string;
}

/**
 * Provider interface for streaming services
 */
export interface Provider {
  /** Provider name (e.g., "Netflix", "Hulu") */
  name: string;
  /** Provider ID from TMDB */
  id: string;
}

/**
 * Genre interface for media categorization
 */
export interface Genre {
  /** Genre ID from TMDB */
  id: number;
  /** Genre name (e.g., "Action", "Drama") */
  name: string;
}

// Static provider lists
export const MOVIE_PROVIDERS: Provider[] = [
  { name: "Netflix", id: "8" },
  { name: "Apple TV+", id: "2" },
  { name: "Amazon Prime Video", id: "10" },
  { name: "Hulu", id: "15" },
  { name: "Disney Plus", id: "337" },
  { name: "Max", id: "1899" },
  { name: "Paramount Plus", id: "531" },
  { name: "Shudder", id: "99" },
  { name: "Crunchyroll", id: "283" },
  { name: "fuboTV", id: "257" },
  { name: "AMC+", id: "526" },
  { name: "Starz", id: "43" },
  { name: "Lifetime", id: "157" },
  { name: "National Geographic", id: "1964" },
];

export const TV_PROVIDERS: Provider[] = [
  { name: "Netflix", id: "8" },
  { name: "Apple TV+", id: "350" },
  { name: "Amazon Prime Video", id: "10" },
  { name: "Paramount Plus", id: "531" },
  { name: "Hulu", id: "15" },
  { name: "Max", id: "1899" },
  { name: "Adult Swim", id: "318" },
  { name: "Disney Plus", id: "337" },
  { name: "Crunchyroll", id: "283" },
  { name: "fuboTV", id: "257" },
  { name: "Shudder", id: "99" },
  { name: "Discovery +", id: "520" },
  { name: "National Geographic", id: "1964" },
  { name: "Fox", id: "328" },
];

/**
 * Hook for managing providers and genres
 */
export function useDiscoverOptions(mediaType: MediaType) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userLanguage = useLanguageStore((s) => s.language);
  const formattedLanguage = getTmdbLanguageCode(userLanguage);

  const providers = mediaType === "movie" ? MOVIE_PROVIDERS : TV_PROVIDERS;

  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await get<any>(`/genre/${mediaType}/list`, {
          api_key: conf().TMDB_READ_API_KEY,
          language: formattedLanguage,
        });
        setGenres(data.genres.slice(0, 50));
      } catch (err) {
        console.error(`Error fetching ${mediaType} genres:`, err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, [mediaType, formattedLanguage]);

  return {
    genres,
    providers,
    isLoading,
    error,
  };
}

export function useDiscoverMedia({
  contentType,
  mediaType,
  id,
  fallbackType,
  page = 1,
  genreName,
  providerName,
  mediaTitle,
  isCarouselView = false,
}: UseDiscoverMediaProps): UseDiscoverMediaReturn {
  const [media, setMedia] = useState<DiscoverMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sectionTitle, setSectionTitle] = useState<string>("");
  const [currentContentType, setCurrentContentType] =
    useState<string>(contentType);

  const { t } = useTranslation();
  const userLanguage = useLanguageStore((s) => s.language);
  const formattedLanguage = getTmdbLanguageCode(userLanguage);

  // Reset media when content type or media type changes
  useEffect(() => {
    if (contentType !== currentContentType) {
      setMedia([]);
      setCurrentContentType(contentType);
    }
  }, [contentType, currentContentType]);

  const fetchTMDBMedia = useCallback(
    async (endpoint: string, params: Record<string, any> = {}) => {
      try {
        // For carousel views, we only need one page of results
        if (isCarouselView) {
          params.page = "1"; // Always use first page for carousels
        } else {
          params.page = page.toString(); // Use the requested page for "view more" pages
        }

        const data = await get<any>(endpoint, {
          api_key: conf().TMDB_READ_API_KEY,
          language: formattedLanguage,
          ...params,
        });

        // For carousel views, we might want to limit the number of results
        const results = isCarouselView
          ? data.results.slice(0, 20)
          : data.results;

        return {
          results: results.map((item: any) => ({
            ...item,
            type: mediaType === "movie" ? "movie" : "show",
          })),
          hasMore: page < data.total_pages,
        };
      } catch (err) {
        console.error("Error fetching TMDB media:", err);
        throw err;
      }
    },
    [formattedLanguage, page, mediaType, isCarouselView],
  );

  const fetchTraktMedia = useCallback(
    async (traktFunction: () => Promise<TraktLatestResponse>) => {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise<TraktLatestResponse>((_, reject) => {
          setTimeout(() => reject(new Error("Trakt request timed out")), 3000);
        });

        // Race between the Trakt request and timeout
        const response = await Promise.race([traktFunction(), timeoutPromise]);

        // Paginate the results
        const pageSize = isCarouselView ? 20 : 100; // Limit to 20 items for carousels, get more for detailed views
        const { tmdb_ids: tmdbIds, hasMore: hasMoreResults } = paginateResults(
          response,
          page,
          pageSize,
        );

        // For carousel views, we only need to fetch details for displayed items
        const idsToFetch = isCarouselView ? tmdbIds.slice(0, 20) : tmdbIds;

        // Fetch details for each TMDB ID
        const mediaPromises = idsToFetch.map(async (tmdbId: number) => {
          const endpoint = `/${mediaType}/${tmdbId}`;
          try {
            const data = await get<any>(endpoint, {
              api_key: conf().TMDB_READ_API_KEY,
              language: formattedLanguage,
            });
            return {
              ...data,
              type: mediaType === "movie" ? "movie" : "show",
            };
          } catch (err) {
            console.error(`Error fetching details for TMDB ID ${tmdbId}:`, err);
            return null; // Return null for failed items
          }
        });

        // Use Promise.allSettled to handle failed requests gracefully
        const settledResults = await Promise.allSettled(mediaPromises);

        // Filter out failed requests and nulls
        const results = settledResults
          .filter(
            (result): result is PromiseFulfilledResult<any> =>
              result.status === "fulfilled" && result.value !== null,
          )
          .map((result) => result.value);

        return {
          results,
          hasMore: hasMoreResults,
        };
      } catch (err) {
        console.error("Error fetching Trakt media:", err);
        throw err;
      }
    },
    [mediaType, formattedLanguage, page, isCarouselView],
  );

  // Get Trakt function for provider
  const getTraktProviderFunction = useCallback(
    (providerId: string) => {
      const trakt =
        PROVIDER_TO_TRAKT_MAP[providerId as keyof typeof PROVIDER_TO_TRAKT_MAP];
      if (!trakt) return null;

      // Handle TV vs Movies for Netflix
      if (trakt === "netflix" && mediaType === "tv") {
        return getNetflixTVShows;
      }
      if (trakt === "netflix" && mediaType === "movie") {
        return getNetflixMovies;
      }

      // Map provider to corresponding Trakt function
      switch (trakt) {
        case "appletv":
          return getAppleTVReleases;
        case "prime":
          return getPrimeReleases;
        case "hulu":
          return getHuluReleases;
        case "disney":
          return getDisneyReleases;
        case "hbo":
          return getHBOReleases;
        default:
          return null;
      }
    },
    [mediaType],
  );

  // Get Trakt function for genre
  const getTraktGenreFunction = useCallback((genreId: string) => {
    const trakt =
      GENRE_TO_TRAKT_MAP[genreId as keyof typeof GENRE_TO_TRAKT_MAP];
    if (!trakt) return null;

    switch (trakt) {
      case "action":
        return getActionReleases;
      case "drama":
        return getDramaReleases;
      default:
        return null;
    }
  }, []);

  const fetchEditorPicks = useCallback(async () => {
    const picks =
      mediaType === "movie" ? EDITOR_PICKS_MOVIES : EDITOR_PICKS_TV_SHOWS;

    // For carousel views, limit the number of picks to fetch
    const picksToFetch = isCarouselView ? picks.slice(0, 20) : picks;

    try {
      const mediaPromises = picksToFetch.map(async (item) => {
        const endpoint = `/${mediaType}/${item.id}`;
        const data = await get<any>(endpoint, {
          api_key: conf().TMDB_READ_API_KEY,
          language: formattedLanguage,
          append_to_response: "videos,images",
        });
        return {
          ...data,
          type: item.type,
        };
      });

      const results = await Promise.all(mediaPromises);
      return {
        results,
        hasMore: picks.length > picksToFetch.length,
      };
    } catch (err) {
      console.error("Error fetching editor picks:", err);
      throw err;
    }
  }, [mediaType, formattedLanguage, isCarouselView]);

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const attemptFetch = async (type: DiscoverContentType) => {
      let data;
      let traktGenreFunction;
      let traktProviderFunction;

      // Map content types to their endpoints and handling logic
      switch (type) {
        case "popular":
          data = await fetchTMDBMedia(`/${mediaType}/popular`);
          setSectionTitle(t("discover.carousel.title.popular"));
          break;

        case "topRated":
          data = await fetchTMDBMedia(`/${mediaType}/top_rated`);
          setSectionTitle(t("discover.carousel.title.topRated"));
          break;

        case "onTheAir":
          if (mediaType === "tv") {
            data = await fetchTMDBMedia("/tv/on_the_air");
            setSectionTitle(t("discover.carousel.title.onTheAir"));
          } else {
            throw new Error("onTheAir is only available for TV shows");
          }
          break;

        case "nowPlaying":
          if (mediaType === "movie") {
            data = await fetchTMDBMedia("/movie/now_playing");
            setSectionTitle(t("discover.carousel.title.inCinemas"));
          } else {
            throw new Error("nowPlaying is only available for movies");
          }
          break;

        case "latest":
          data = await fetchTraktMedia(getLatestReleases);
          setSectionTitle(t("discover.carousel.title.latestReleases"));
          break;

        case "latest4k":
          data = await fetchTraktMedia(getLatest4KReleases);
          setSectionTitle(t("discover.carousel.title.4kReleases"));
          break;

        case "latesttv":
          data = await fetchTraktMedia(getLatestTVReleases);
          setSectionTitle(t("discover.carousel.title.latestTVReleases"));
          break;

        case "genre":
          if (!id) throw new Error("Genre ID is required");

          // Try to use Trakt genre endpoint if available
          traktGenreFunction = getTraktGenreFunction(id);
          if (traktGenreFunction) {
            try {
              data = await fetchTraktMedia(traktGenreFunction);
              setSectionTitle(
                mediaType === "movie"
                  ? t("discover.carousel.title.movies", { category: genreName })
                  : t("discover.carousel.title.tvshows", {
                      category: genreName,
                    }),
              );
            } catch (traktErr) {
              console.error(
                "Trakt genre fetch failed, falling back to TMDB:",
                traktErr,
              );
              // Fall back to TMDB
              data = await fetchTMDBMedia(`/discover/${mediaType}`, {
                with_genres: id,
              });
              setSectionTitle(
                mediaType === "movie"
                  ? t("discover.carousel.title.movies", { category: genreName })
                  : t("discover.carousel.title.tvshows", {
                      category: genreName,
                    }),
              );
            }
          } else {
            // Use TMDB if no Trakt endpoint exists for this genre
            data = await fetchTMDBMedia(`/discover/${mediaType}`, {
              with_genres: id,
            });
            setSectionTitle(
              mediaType === "movie"
                ? t("discover.carousel.title.movies", { category: genreName })
                : t("discover.carousel.title.tvshows", { category: genreName }),
            );
          }
          break;

        case "provider":
          if (!id) throw new Error("Provider ID is required");

          // Try to use Trakt provider endpoint if available
          traktProviderFunction = getTraktProviderFunction(id);
          if (traktProviderFunction) {
            try {
              data = await fetchTraktMedia(traktProviderFunction);
              setSectionTitle(
                mediaType === "movie"
                  ? t("discover.carousel.title.moviesOn", {
                      provider: providerName,
                    })
                  : t("discover.carousel.title.tvshowsOn", {
                      provider: providerName,
                    }),
              );
            } catch (traktErr) {
              console.error(
                "Trakt provider fetch failed, falling back to TMDB:",
                traktErr,
              );
              // Fall back to TMDB
              data = await fetchTMDBMedia(`/discover/${mediaType}`, {
                with_watch_providers: id,
                watch_region: "US",
              });
              setSectionTitle(
                mediaType === "movie"
                  ? t("discover.carousel.title.moviesOn", {
                      provider: providerName,
                    })
                  : t("discover.carousel.title.tvshowsOn", {
                      provider: providerName,
                    }),
              );
            }
          } else {
            // Use TMDB if no Trakt endpoint exists for this provider
            data = await fetchTMDBMedia(`/discover/${mediaType}`, {
              with_watch_providers: id,
              watch_region: "US",
            });
            setSectionTitle(
              mediaType === "movie"
                ? t("discover.carousel.title.moviesOn", {
                    provider: providerName,
                  })
                : t("discover.carousel.title.tvshowsOn", {
                    provider: providerName,
                  }),
            );
          }
          break;

        case "recommendations":
          if (!id) throw new Error("Media ID is required for recommendations");
          data = await fetchTMDBMedia(`/${mediaType}/${id}/recommendations`);
          setSectionTitle(
            t("discover.carousel.title.recommended", { title: mediaTitle }),
          );
          break;

        case "editorPicks":
          data = await fetchEditorPicks();
          setSectionTitle(
            mediaType === "movie"
              ? t("discover.carousel.title.editorPicksMovies")
              : t("discover.carousel.title.editorPicksShows"),
          );
          break;

        default:
          throw new Error(`Unsupported content type: ${type}`);
      }

      return data;
    };

    try {
      const data = await attemptFetch(contentType);
      setMedia((prevMedia) => {
        // If page is 1, replace the media array, otherwise append
        return page === 1 ? data.results : [...prevMedia, ...data.results];
      });
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Error fetching media:", err);
      setError((err as Error).message);

      // Try fallback content type if available
      if (fallbackType && fallbackType !== contentType) {
        console.info(`Falling back from ${contentType} to ${fallbackType}`);
        try {
          const fallbackData = await attemptFetch(fallbackType);
          setMedia((prevMedia) => {
            // If page is 1, replace the media array, otherwise append
            return page === 1
              ? fallbackData.results
              : [...prevMedia, ...fallbackData.results];
          });
          setHasMore(fallbackData.hasMore);
          setError(null); // Clear error if fallback succeeds
        } catch (fallbackErr) {
          console.error("Error fetching fallback media:", fallbackErr);
          setError((fallbackErr as Error).message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    contentType,
    mediaType,
    id,
    fallbackType,
    genreName,
    providerName,
    mediaTitle,
    fetchTMDBMedia,
    fetchTraktMedia,
    fetchEditorPicks,
    t,
    page,
    getTraktGenreFunction,
    getTraktProviderFunction,
  ]);

  useEffect(() => {
    // Reset media when content type, media type, or id changes
    if (contentType !== currentContentType || page === 1) {
      setMedia([]);
      setCurrentContentType(contentType);
    }
    fetchMedia();
  }, [fetchMedia, contentType, currentContentType, page, id]);

  return {
    media,
    isLoading,
    error,
    hasMore,
    refetch: fetchMedia,
    sectionTitle,
  };
}
