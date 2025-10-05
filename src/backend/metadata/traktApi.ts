import { getMediaDetails } from "./tmdb";
import { MWMediaType } from "./types/mw";
import { TMDBContentTypes, TMDBMovieData } from "./types/tmdb";

export interface TraktLatestResponse {
  tmdb_ids: number[];
  count: number;
}

export interface TraktReleaseResponse {
  tmdb_id: number;
  title: string;
  year?: number;
  type: "movie" | "episode";
  season?: number;
  episode?: number;
  quality?: string;
  source?: string;
  group?: string;
  theatrical_release_date?: string;
  digital_release_date?: string;
}

export interface PaginatedTraktResponse {
  tmdb_ids: number[];
  hasMore: boolean;
  totalCount: number;
}

export type TraktContentType = "movie" | "episode";

export const TRAKT_BASE_URL = "https://fed-airdate.pstream.mov";

export interface TraktDiscoverResponse {
  movie_tmdb_ids: number[];
  tv_tmdb_ids: number[];
  count: number;
}

export interface TraktNetworkResponse {
  type: string;
  platforms: string[];
  count: number;
}

export interface CuratedMovieList {
  listName: string;
  listSlug: string;
  tmdbIds: number[];
  count: number;
}

// Pagination utility
export function paginateResults(
  results: TraktLatestResponse,
  page: number,
  pageSize: number = 20,
): PaginatedTraktResponse {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedIds = results.tmdb_ids.slice(startIndex, endIndex);

  return {
    tmdb_ids: paginatedIds,
    hasMore: endIndex < results.tmdb_ids.length,
    totalCount: results.tmdb_ids.length,
  };
}

// Base function to fetch from Trakt API
async function fetchFromTrakt<T = TraktLatestResponse>(
  endpoint: string,
): Promise<T> {
  const response = await fetch(`${TRAKT_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`);
  }
  return response.json();
}

// Release details
export async function getReleaseDetails(
  id: string,
  season?: number,
  episode?: number,
): Promise<TraktReleaseResponse> {
  let url = `/release/${id}`;
  if (season !== undefined && episode !== undefined) {
    url += `/${season}/${episode}`;
  }
  const response = await fetch(`${TRAKT_BASE_URL}${url}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch release details: ${response.statusText}`);
  }
  return response.json();
}

// Latest releases
export const getLatestReleases = () => fetchFromTrakt("/latest");
export const getLatest4KReleases = () => fetchFromTrakt("/latest4k");
export const getLatestTVReleases = () => fetchFromTrakt("/latesttv");

// Streaming service releases
export const getAppleTVReleases = () => fetchFromTrakt("/appletv");
export const getNetflixMovies = () => fetchFromTrakt("/netflixmovies");
export const getNetflixTVShows = () => fetchFromTrakt("/netflixtv");
export const getPrimeReleases = () => fetchFromTrakt("/prime");
export const getHuluReleases = () => fetchFromTrakt("/hulu");
export const getDisneyReleases = () => fetchFromTrakt("/disney");
export const getHBOReleases = () => fetchFromTrakt("/hbo");

// Genre-specific releases
export const getActionReleases = () => fetchFromTrakt("/action");
export const getDramaReleases = () => fetchFromTrakt("/drama");

// Popular content
export const getPopularTVShows = () => fetchFromTrakt("/populartv");
export const getPopularMovies = () => fetchFromTrakt("/popularmovies");

// Discovery content
export const getDiscoverContent = () =>
  fetchFromTrakt<TraktDiscoverResponse>("/discover");

// Network content
export const getNetworkContent = (tmdbId: string) =>
  fetchFromTrakt<TraktNetworkResponse>(`/network/${tmdbId}`);

// Curated movie lists (replacing Letterboxd functionality)
export const getNarrativeMovies = () => fetchFromTrakt("/narrative");
export const getTopMovies = () => fetchFromTrakt("/top");
export const getLifetimeMovies = () => fetchFromTrakt("/lifetime");
export const getNeverHeardMovies = () => fetchFromTrakt("/never");
export const getLGBTQContent = () => fetchFromTrakt("/LGBTQ");
export const getMindfuckMovies = () => fetchFromTrakt("/mindfuck");
export const getTrueStoryMovies = () => fetchFromTrakt("/truestory");
export const getGreatestTVShows = () => fetchFromTrakt("/greatesttv");

// Get all curated movie lists
export const getCuratedMovieLists = async (): Promise<CuratedMovieList[]> => {
  const listConfigs = [
    {
      name: "Letterboxd Top 250 Narrative Feature Films",
      slug: "narrative",
      endpoint: "/narrative",
    },
    {
      name: "1001 Greatest Movies of All Time",
      slug: "top",
      endpoint: "/top",
    },
    {
      name: "1001 Movies You Must See Before You Die",
      slug: "lifetime",
      endpoint: "/lifetime",
    },
    {
      name: "Great Movies You May Have Never Heard Of",
      slug: "never",
      endpoint: "/never",
    },
    {
      name: "LGBT Movies/Shows",
      slug: "LGBTQ",
      endpoint: "/LGBTQ",
    },
    {
      name: "Best Mindfuck Movies",
      slug: "mindfuck",
      endpoint: "/mindfuck",
    },
    {
      name: "Based on a True Story Movies",
      slug: "truestory",
      endpoint: "/truestory",
    },
    {
      name: "Rolling Stone's 100 Greatest TV Shows",
      slug: "greatesttv",
      endpoint: "/greatesttv",
    },
  ];

  const lists: CuratedMovieList[] = [];

  for (const config of listConfigs) {
    try {
      const response = await fetchFromTrakt(config.endpoint);
      lists.push({
        listName: config.name,
        listSlug: config.slug,
        tmdbIds: response.tmdb_ids.slice(0, 30), // Limit to first 30 items
        count: Math.min(response.count, 30), // Update count to reflect the limit
      });
    } catch (error) {
      console.error(`Failed to fetch ${config.name}:`, error);
    }
  }

  return lists;
};

// Fetch movie details for multiple TMDB IDs
export const getMovieDetailsForIds = async (
  tmdbIds: number[],
  limit: number = 50,
): Promise<TMDBMovieData[]> => {
  const limitedIds = tmdbIds.slice(0, limit);
  const movieDetails: TMDBMovieData[] = [];

  // Process in smaller batches to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < limitedIds.length; i += batchSize) {
    const batch = limitedIds.slice(i, i + batchSize);
    const batchPromises = batch.map(async (id) => {
      try {
        const details = await getMediaDetails(
          id.toString(),
          TMDBContentTypes.MOVIE,
        );
        return details as TMDBMovieData;
      } catch (error) {
        console.error(`Failed to fetch movie details for ID ${id}:`, error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(
      (result): result is TMDBMovieData => result !== null,
    );
    movieDetails.push(...validResults);
  }

  return movieDetails;
};

// Type conversion utilities
export function convertToMediaType(type: TraktContentType): MWMediaType {
  return type === "movie" ? MWMediaType.MOVIE : MWMediaType.SERIES;
}

export function convertFromMediaType(type: MWMediaType): TraktContentType {
  return type === MWMediaType.MOVIE ? "movie" : "episode";
}

// Map provider names to their Trakt endpoints
export const PROVIDER_TO_TRAKT_MAP = {
  "8": "netflix", // Netflix
  "2": "appletv", // Apple TV+
  "10": "prime", // Prime Video
  "15": "hulu", // Hulu
  "337": "disney", // Disney+
  "1899": "hbo", // Max
} as const;

// Map genres to their Trakt endpoints
export const GENRE_TO_TRAKT_MAP = {
  "28": "action", // Action
  "18": "drama", // Drama
} as const;

// Map provider names to their image filenames
export const PROVIDER_TO_IMAGE_MAP: Record<string, string> = {
  Max: "max",
  "Prime Video": "prime",
  Netflix: "netflix",
  "Disney+": "disney",
  Hulu: "hulu",
  "Apple TV+": "appletv",
  "Paramount+": "paramount",
};
