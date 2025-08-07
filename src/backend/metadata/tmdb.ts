import slugify from "slugify";

import { conf } from "@/setup/config";
import { useLanguageStore } from "@/stores/language";
import { usePreferencesStore } from "@/stores/preferences";
import { getTmdbLanguageCode } from "@/utils/language";
import { MediaItem } from "@/utils/mediaTypes";
import { getProxyUrls } from "@/utils/proxyUrls";

import { MWMediaMeta, MWMediaType, MWSeasonMeta } from "./types/mw";
import {
  ExternalIdMovieSearchResult,
  TMDBContentTypes,
  TMDBCredits,
  TMDBEpisodeShort,
  TMDBMediaResult,
  TMDBMovieData,
  TMDBMovieSearchResult,
  TMDBPerson,
  TMDBPersonImages,
  TMDBSearchResult,
  TMDBSeason,
  TMDBSeasonMetaResult,
  TMDBShowData,
  TMDBShowSearchResult,
} from "./types/tmdb";
import { mwFetch } from "../helpers/fetch";

export function mediaTypeToTMDB(type: MWMediaType): TMDBContentTypes {
  if (type === MWMediaType.MOVIE) return TMDBContentTypes.MOVIE;
  if (type === MWMediaType.SERIES) return TMDBContentTypes.TV;
  throw new Error("unsupported type");
}

export function mediaItemTypeToMediaType(type: MediaItem["type"]): MWMediaType {
  if (type === "movie") return MWMediaType.MOVIE;
  if (type === "show") return MWMediaType.SERIES;
  throw new Error("unsupported type");
}

export function TMDBMediaToMediaType(type: TMDBContentTypes): MWMediaType {
  if (type === TMDBContentTypes.MOVIE) return MWMediaType.MOVIE;
  if (type === TMDBContentTypes.TV) return MWMediaType.SERIES;
  throw new Error("unsupported type");
}

export function TMDBMediaToMediaItemType(
  type: TMDBContentTypes,
): MediaItem["type"] {
  if (type === TMDBContentTypes.MOVIE) return "movie";
  if (type === TMDBContentTypes.TV) return "show";
  throw new Error("unsupported type");
}

export function formatTMDBMeta(
  media: TMDBMediaResult,
  season?: TMDBSeasonMetaResult,
): MWMediaMeta {
  const type = TMDBMediaToMediaType(media.object_type);
  let seasons: undefined | MWSeasonMeta[];
  if (type === MWMediaType.SERIES) {
    seasons = media.seasons
      ?.sort((a, b) => a.season_number - b.season_number)
      .map(
        (v): MWSeasonMeta => ({
          title: v.title,
          id: v.id.toString(),
          number: v.season_number,
        }),
      );
  }

  return {
    title: media.title,
    id: media.id.toString(),
    year: media.original_release_date?.getFullYear()?.toString(),
    poster: media.poster,
    type,
    seasons: seasons as any,
    seasonData: season
      ? {
          id: season.id.toString(),
          number: season.season_number,
          title: season.title,
          episodes: season.episodes
            .sort((a, b) => a.episode_number - b.episode_number)
            .map((v) => ({
              id: v.id.toString(),
              number: v.episode_number,
              title: v.title,
              air_date: v.air_date,
              still_path: v.still_path,
              overview: v.overview,
            })),
        }
      : (undefined as any),
  };
}

export function formatTMDBMetaToMediaItem(media: TMDBMediaResult): MediaItem {
  const type = TMDBMediaToMediaItemType(media.object_type);

  return {
    title: media.title,
    id: media.id.toString(),
    year: media.original_release_date?.getFullYear() ?? 0,
    release_date: media.original_release_date,
    poster: media.poster,
    type,
  };
}

export function TMDBIdToUrlId(
  type: MWMediaType,
  tmdbId: string,
  title: string,
) {
  return [
    "tmdb",
    mediaTypeToTMDB(type),
    tmdbId,
    slugify(title, { lower: true, strict: true }),
  ].join("-");
}

export function TMDBMediaToId(media: MWMediaMeta): string {
  return TMDBIdToUrlId(media.type, media.id, media.title);
}

export function mediaItemToId(media: MediaItem): string {
  return TMDBIdToUrlId(
    mediaItemTypeToMediaType(media.type),
    media.id,
    media.title,
  );
}

export function decodeTMDBId(
  paramId: string,
): { id: string; type: MWMediaType } | null {
  const [prefix, type, id] = paramId.split("-", 3);
  if (prefix !== "tmdb") return null;
  let mediaType;
  try {
    mediaType = TMDBMediaToMediaType(type as TMDBContentTypes);
  } catch {
    return null;
  }
  return {
    type: mediaType,
    id,
  };
}

const tmdbBaseUrl1 = "https://api.themoviedb.org/3/";
const tmdbBaseUrl2 = "https://api.tmdb.org/3/";

const apiKey = conf().TMDB_READ_API_KEY;

const tmdbHeaders = {
  accept: "application/json",
  Authorization: `Bearer ${apiKey}`,
};

function abortOnTimeout(timeout: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller.signal;
}

let proxyRotationIndex = 0;

function getNextProxy(proxyUrls: string[]): string | undefined {
  if (!proxyUrls.length) return undefined;
  const proxy = proxyUrls[proxyRotationIndex % proxyUrls.length];
  proxyRotationIndex += 1;
  return proxy;
}

export async function get<T>(url: string, params?: object): Promise<T> {
  const proxyUrls = getProxyUrls();
  const proxy = getNextProxy(proxyUrls);
  const shouldProxyTmdb = usePreferencesStore.getState().proxyTmdb;
  const userLanguage = useLanguageStore.getState().language;
  const formattedLanguage = getTmdbLanguageCode(userLanguage);

  if (!apiKey) throw new Error("TMDB API key not set");

  // directly writing parameters, otherwise it will start the first parameter in the proxied request as "&" instead of "?" because it doesnt understand its proxied
  const fullUrl = new URL(tmdbBaseUrl1 + url);
  const allParams = {
    ...params,
    language: formattedLanguage,
  };

  if (allParams) {
    Object.entries(allParams).forEach(([key, value]) => {
      fullUrl.searchParams.append(key, String(value));
    });
  }

  if (proxy && shouldProxyTmdb) {
    try {
      return await mwFetch<T>(
        `/?destination=${encodeURIComponent(fullUrl.toString())}`,
        {
          headers: tmdbHeaders,
          baseURL: proxy,
          signal: abortOnTimeout(5000),
        },
      );
    } catch (err) {
      console.error(err);
    }
  }

  try {
    return await mwFetch<T>(encodeURI(url), {
      headers: tmdbHeaders,
      baseURL: tmdbBaseUrl1,
      params: allParams,
      signal: abortOnTimeout(5000),
    });
  } catch (err) {
    return mwFetch<T>(encodeURI(url), {
      headers: tmdbHeaders,
      baseURL: tmdbBaseUrl2,
      params: allParams,
      signal: abortOnTimeout(30000),
    });
  }
}

export async function multiSearch(
  query: string,
): Promise<(TMDBMovieSearchResult | TMDBShowSearchResult)[]> {
  const data = await get<TMDBSearchResult>("search/multi", {
    query,
    include_adult: false,
    page: 1,
  });
  // filter out results that aren't movies or shows
  const results = data.results.filter(
    (r) =>
      r.media_type === TMDBContentTypes.MOVIE ||
      r.media_type === TMDBContentTypes.TV,
  );
  return results;
}

export async function searchMovies(
  query: string,
): Promise<TMDBMovieSearchResult[]> {
  const data = await get<{
    results: TMDBMovieSearchResult[];
  }>("search/movie", {
    query,
    include_adult: false,
    page: 1,
  });
  return data.results.map((result) => ({
    ...result,
    media_type: TMDBContentTypes.MOVIE,
  }));
}

export async function searchTVShows(
  query: string,
): Promise<TMDBShowSearchResult[]> {
  const data = await get<{
    results: TMDBShowSearchResult[];
  }>("search/tv", {
    query,
    include_adult: false,
    page: 1,
  });
  return data.results.map((result) => ({
    ...result,
    media_type: TMDBContentTypes.TV,
  }));
}

export async function generateQuickSearchMediaUrl(
  query: string,
): Promise<string | undefined> {
  const data = await multiSearch(query);
  if (data.length === 0) return undefined;
  const result = data[0];
  const title =
    result.media_type === TMDBContentTypes.MOVIE ? result.title : result.name;

  return `/media/${TMDBIdToUrlId(
    TMDBMediaToMediaType(result.media_type),
    result.id.toString(),
    title,
  )}`;
}

// Conditional type which for inferring the return type based on the content type
type MediaDetailReturn<T extends TMDBContentTypes> =
  T extends TMDBContentTypes.MOVIE
    ? TMDBMovieData
    : T extends TMDBContentTypes.TV
      ? TMDBShowData
      : never;

export async function getMediaDetails<
  T extends TMDBContentTypes,
  TReturn = MediaDetailReturn<T>,
>(id: string, type: T): Promise<TReturn> {
  if (type === TMDBContentTypes.MOVIE) {
    return get<TReturn>(`/movie/${id}`, {
      append_to_response: "external_ids,credits,release_dates",
    });
  }
  if (type === TMDBContentTypes.TV) {
    const showData = await get<TReturn>(`/tv/${id}`, {
      append_to_response: "external_ids,credits,content_ratings",
    });

    // Fetch episodes for each season
    const showDetails = showData as TMDBShowData;
    const episodePromises = showDetails.seasons.map(async (season) => {
      const seasonData = await get<TMDBSeason>(
        `/tv/${id}/season/${season.season_number}`,
      );
      return seasonData.episodes.map((episode) => ({
        id: episode.id,
        name: episode.name,
        episode_number: episode.episode_number,
        overview: episode.overview,
        still_path: episode.still_path,
        air_date: episode.air_date,
        season_number: season.season_number,
      }));
    });

    const allEpisodes = (await Promise.all(episodePromises)).flat();

    return {
      ...showData,
      episodes: allEpisodes,
    } as TReturn;
  }
  throw new Error("Invalid media type");
}

export function getMediaBackdrop(
  backdropPath: string | null,
): string | undefined {
  const shouldProxyTmdb = usePreferencesStore.getState().proxyTmdb;
  const imgUrl = `https://image.tmdb.org/t/p/original${backdropPath}`;
  const proxyUrl = getProxyUrls()[0];
  if (proxyUrl && shouldProxyTmdb) {
    return `${proxyUrl}/?destination=${imgUrl}`;
  }
  if (backdropPath) return imgUrl;
}

export function getMediaPoster(posterPath: string | null): string | undefined {
  const shouldProxyTmdb = usePreferencesStore.getState().proxyTmdb;
  const imgUrl = `https://image.tmdb.org/t/p/w342/${posterPath}`;

  if (shouldProxyTmdb) {
    const proxyUrls = getProxyUrls();
    const proxy = getNextProxy(proxyUrls);
    if (proxy) {
      return `${proxy}/?destination=${imgUrl}`;
    }
  }

  if (posterPath) return imgUrl;
}

export async function getEpisodes(
  id: string,
  season: number,
): Promise<TMDBEpisodeShort[]> {
  const data = await get<TMDBSeason>(`/tv/${id}/season/${season}`);
  return data.episodes.map((e) => ({
    id: e.id,
    episode_number: e.episode_number,
    title: e.name,
    air_date: e.air_date,
    still_path: e.still_path,
    overview: e.overview,
  }));
}

export async function getMovieFromExternalId(
  imdbId: string,
): Promise<string | undefined> {
  const data = await get<ExternalIdMovieSearchResult>(`/find/${imdbId}`, {
    external_source: "imdb_id",
  });

  const movie = data.movie_results[0];
  if (!movie) return undefined;

  return movie.id.toString();
}

export function formatTMDBSearchResult(
  result: TMDBMovieSearchResult | TMDBShowSearchResult,
  mediatype: TMDBContentTypes,
): TMDBMediaResult {
  const type = TMDBMediaToMediaType(mediatype);
  if (type === MWMediaType.SERIES) {
    const show = result as TMDBShowSearchResult;
    return {
      title: show.name,
      poster: getMediaPoster(show.poster_path),
      id: show.id,
      original_release_date: new Date(show.first_air_date),
      object_type: mediatype,
    };
  }

  const movie = result as TMDBMovieSearchResult;

  return {
    title: movie.title,
    poster: getMediaPoster(movie.poster_path),
    id: movie.id,
    original_release_date: new Date(movie.release_date),
    object_type: mediatype,
  };
}

/**
 * Fetches the clear logo for a movie or show from TMDB images endpoint.
 */
export async function getMediaLogo(
  id: string,
  type: TMDBContentTypes,
  language?: string,
): Promise<string | undefined> {
  const userLanguage = language || useLanguageStore.getState().language;
  const formattedLanguage = getTmdbLanguageCode(userLanguage);
  const url =
    type === TMDBContentTypes.MOVIE
      ? `/movie/${id}/images`
      : `/tv/${id}/images`;
  try {
    const data = await get<any>(url, {
      include_image_language: `${formattedLanguage},en,null`,
    });
    // Try to find a logo in the user's language, then English, then any
    const logo =
      data.logos?.find((l: any) => l.iso_639_1 === formattedLanguage) ||
      data.logos?.find((l: any) => l.iso_639_1 === "en") ||
      data.logos?.[0];
    if (logo && logo.file_path) {
      return `https://image.tmdb.org/t/p/original${logo.file_path}`;
    }
    return undefined;
  } catch (err) {
    console.error("Failed to fetch TMDB logo:", err);
    return undefined;
  }
}

export async function getMediaCredits(
  id: string,
  type: TMDBContentTypes,
): Promise<TMDBCredits> {
  const endpoint = type === TMDBContentTypes.MOVIE ? "movie" : "tv";
  return get<TMDBCredits>(`/${endpoint}/${id}/credits`);
}

export async function getRelatedMedia(
  id: string,
  type: TMDBContentTypes,
  limit: number = 10,
): Promise<TMDBMovieSearchResult[] | TMDBShowSearchResult[]> {
  const endpoint = type === TMDBContentTypes.MOVIE ? "movie" : "tv";
  const data = await get<{
    results: TMDBMovieSearchResult[] | TMDBShowSearchResult[];
  }>(`/${endpoint}/${id}/similar`);

  return data.results.slice(0, limit);
}

export async function getPersonDetails(id: string): Promise<TMDBPerson> {
  return get<TMDBPerson>(`/person/${id}`);
}

export async function getPersonImages(id: string): Promise<TMDBPersonImages> {
  return get<TMDBPersonImages>(`/person/${id}/images`);
}

export function getPersonProfileImage(
  profilePath: string | null,
): string | undefined {
  const shouldProxyTmdb = usePreferencesStore.getState().proxyTmdb;
  const imgUrl = `https://image.tmdb.org/t/p/w185/${profilePath}`;

  if (shouldProxyTmdb) {
    const proxyUrls = getProxyUrls();
    const proxy = getNextProxy(proxyUrls);
    if (proxy) {
      return `${proxy}/?destination=${imgUrl}`;
    }
  }

  if (profilePath) return imgUrl;
}
