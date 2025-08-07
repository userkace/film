/* eslint-disable no-console */
import { isExtensionActive } from "@/backend/extension/messaging";
import { proxiedFetch } from "@/backend/helpers/fetch";
import { makeExtensionFetcher } from "@/backend/providers/fetchers";
import { useAuthStore } from "@/stores/auth";
import { useLanguageStore } from "@/stores/language";

import { getTmdbLanguageCode } from "./language";

// IMDb language code mapping (differs from TMDB format)
// Map from ISO language code to IMDb language parameter
const imdbLanguageMap: Record<string, string> = {
  "en-US": "en-US",
  "es-ES": "es-ES",
  "fr-FR": "fr-FR",
  "de-DE": "de-DE",
  "it-IT": "it-IT",
  "pt-PT": "pt-PT",
  "ru-RU": "ru-RU",
  "ja-JP": "ja-JP",
  "zh-CN": "zh-CN",
  "ko-KR": "ko-KR",
  "ar-SA": "ar-SA",
  "hi-IN": "hi-IN",
  "el-GR": "el-GR",
  // Add more mappings as needed
};

/**
 * Convert a TMDB-style language code to an IMDb language code
 * @param language TMDB-style language code (e.g., "en-US")
 * @returns IMDb language code or default "en-US"
 */
function getImdbLanguageCode(language: string): string {
  // If we have a direct mapping, use it
  if (imdbLanguageMap[language]) return imdbLanguageMap[language];

  // Otherwise default to English
  return "en-US";
}

interface IMDbMetadata {
  title: string;
  original_title: string;
  title_type: string;
  year: number | null;
  end_year: number | null;
  day: number | null;
  month: number | null;
  date: string;
  runtime: number | null;
  age_rating: string;
  imdb_rating: number | null;
  votes: number | null;
  plot: string;
  poster_url: string;
  trailer_url: string;
  url: string;
  genre: string[];
  cast: string[];
  directors: string[];
  writers: string[];
  keywords: string[];
  countries: string[];
  languages: string[];
  locations: string[];
  season?: number;
  episode?: number;
  episode_title?: string;
  episode_plot?: string;
  episode_rating?: number;
  episode_votes?: number;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
];

function getRandomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function formatRuntime(seconds: number | null): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function arrayToString(list: string[]): string {
  return list.join(", ");
}

export async function scrapeIMDb(
  imdbId: string,
  season?: number,
  episode?: number,
  language?: string,
): Promise<IMDbMetadata> {
  // Check if we have a proxy or extension
  const hasExtension = await isExtensionActive();
  const hasProxy = Boolean(useAuthStore.getState().proxySet);

  if (!hasExtension && !hasProxy) {
    throw new Error(
      "IMDb scraping requires either the browser extension or a custom proxy to be set up. " +
        "Please install the extension or set up a proxy in the settings.",
    );
  }

  console.log(
    `[IMDb Scraper] Using ${hasExtension ? "browser extension" : "custom proxy"} for requests`,
  );

  // Get user language if not provided
  if (!language) {
    const userLanguage = useLanguageStore.getState().language;
    language = getTmdbLanguageCode(userLanguage);
  }

  // Get IMDb language format
  const imdbLanguage = getImdbLanguageCode(language);

  // Construct IMDb URL with language parameter
  let imdbUrl = `https://www.imdb.com/title/${imdbId}/`;
  if (season && episode) {
    imdbUrl += `episodes?season=${season}`;
  }

  // Add language parameter to URL
  const separator = imdbUrl.includes("?") ? "&" : "?";
  imdbUrl += `${separator}locale=${imdbLanguage}`;

  // Add random delay to avoid rate limiting
  const delay = Math.floor(Math.random() * (197 - 69) + 69);
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });

  // Fetch IMDb page using appropriate fetcher
  let response: string;
  if (hasExtension) {
    const extensionFetcher = makeExtensionFetcher();
    const result = await extensionFetcher(imdbUrl, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        "Accept-Language": imdbLanguage,
      },
      method: "GET",
      query: {},
      readHeaders: [],
    });
    response = result.body as string;
  } else {
    response = await proxiedFetch<string>(imdbUrl, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        "Accept-Language": imdbLanguage,
      },
    });
  }

  // Extract JSON data from the page
  const jsonMatch = response.match(
    /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/,
  );
  if (!jsonMatch) {
    throw new Error("Could not find IMDb data on the page");
  }

  const data = JSON.parse(jsonMatch[1]);
  const metadata: IMDbMetadata = {
    title: "",
    original_title: "",
    title_type: "",
    year: null,
    end_year: null,
    day: null,
    month: null,
    date: "",
    runtime: null,
    age_rating: "",
    imdb_rating: null,
    votes: null,
    plot: "",
    poster_url: "",
    trailer_url: "",
    url: imdbUrl,
    genre: [],
    cast: [],
    directors: [],
    writers: [],
    keywords: [],
    countries: [],
    languages: [],
    locations: [],
    season,
    episode,
  };

  try {
    // Extract all the metadata
    const aboveTheFold = data.props.pageProps.aboveTheFoldData;
    const mainColumn = data.props.pageProps.mainColumnData;

    metadata.title = aboveTheFold.titleText?.text || "";
    metadata.original_title = aboveTheFold.originalTitleText?.text || "";
    metadata.title_type = aboveTheFold.titleType?.text || "";
    metadata.age_rating = aboveTheFold.certificate?.rating || "";
    metadata.year = aboveTheFold.releaseYear?.year || null;
    metadata.end_year = aboveTheFold.releaseYear?.endYear || null;
    metadata.day = aboveTheFold.releaseDate?.day || null;
    metadata.month = aboveTheFold.releaseDate?.month || null;

    if (metadata.month && metadata.day && metadata.year) {
      metadata.date = `${months[metadata.month - 1]} ${metadata.day}, ${metadata.year}`;
    }

    metadata.runtime = aboveTheFold.runtime?.seconds || null;
    metadata.plot = aboveTheFold.plot?.plotText?.plainText || "";
    metadata.imdb_rating = aboveTheFold.ratingsSummary?.aggregateRating || null;
    metadata.votes = aboveTheFold.ratingsSummary?.voteCount || null;
    metadata.poster_url = aboveTheFold.primaryImage?.url || "";
    metadata.trailer_url =
      aboveTheFold.primaryVideos?.edges?.[0]?.node?.playbackURLs?.[0]?.url ||
      "";

    // Extract arrays
    metadata.genre = aboveTheFold.genres?.genres?.map((g: any) => g.text) || [];
    metadata.cast =
      aboveTheFold.castPageTitle?.edges?.map(
        (e: any) => e.node.name.nameText.text,
      ) || [];
    metadata.directors =
      aboveTheFold.directorsPageTitle?.[0]?.credits?.map(
        (c: any) => c.name.nameText.text,
      ) || [];
    metadata.writers =
      mainColumn.writers?.[0]?.credits?.map((c: any) => c.name.nameText.text) ||
      [];
    metadata.keywords =
      aboveTheFold.keywords?.edges?.map((e: any) => e.node.text) || [];
    metadata.countries =
      mainColumn.countriesOfOrigin?.countries?.map((c: any) => c.text) || [];
    metadata.languages =
      mainColumn.spokenLanguages?.spokenLanguages?.map((l: any) => l.text) ||
      [];
    metadata.locations =
      mainColumn.filmingLocations?.edges?.map((e: any) => e.node.text) || [];

    // If season and episode are provided, get episode-specific data
    if (season && episode) {
      const episodeData =
        data.props.pageProps.mainColumnData.episodes?.edges?.find(
          (e: any) => e.node.episodeNumber === episode,
        );

      if (episodeData) {
        metadata.episode_title = episodeData.node.titleText?.text || "";
        metadata.episode_plot =
          episodeData.node.plot?.plotText?.plainText || "";
        metadata.episode_rating =
          episodeData.node.ratingsSummary?.aggregateRating || null;
        metadata.episode_votes =
          episodeData.node.ratingsSummary?.voteCount || null;
      }
    }
  } catch (error) {
    console.error("Error parsing IMDb data:", error);
    throw error;
  }

  return metadata;
}

// Helper function to print metadata (useful for debugging)
export function printIMDbMetadata(metadata: IMDbMetadata): void {
  console.log("\nTitle:", metadata.title);
  if (metadata.title !== metadata.original_title) {
    console.log("Original Title:", metadata.original_title);
  }
  console.log("Type:", metadata.title_type);
  console.log("Year:", metadata.year);
  console.log("Runtime:", formatRuntime(metadata.runtime));
  console.log("Date:", metadata.date);
  console.log("Age Rating:", metadata.age_rating);
  console.log("Genre:", arrayToString(metadata.genre));
  console.log("Cast:", arrayToString(metadata.cast));
  console.log("Directed by:", arrayToString(metadata.directors));
  console.log("Writers:", arrayToString(metadata.writers));
  console.log("Countries:", arrayToString(metadata.countries));
  console.log("Filming Locations:", arrayToString(metadata.locations));
  console.log("Languages:", arrayToString(metadata.languages));
  console.log("Keywords:", arrayToString(metadata.keywords));

  if (metadata.season && metadata.episode) {
    console.log("\nEpisode Details:");
    console.log("Season:", metadata.season);
    console.log("Episode:", metadata.episode);
    console.log("Title:", metadata.episode_title);
    console.log("Plot:", metadata.episode_plot);
    console.log("Rating:", metadata.episode_rating);
    console.log("Votes:", metadata.episode_votes);
  }
  console.log("\n");
}
