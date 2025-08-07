import { isExtensionActive } from "@/backend/extension/messaging";
import { proxiedFetch } from "@/backend/helpers/fetch";
import { makeExtensionFetcher } from "@/backend/providers/fetchers";
import { useAuthStore } from "@/stores/auth";

interface RTMovie {
  title: string;
  tomatoIcon: "certified_fresh" | "fresh" | "rotten";
  tomatoScore: number;
  url: string;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeTitle(str1);
  const s2 = normalizeTitle(str2);

  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  // Calculate word overlap
  const words1 = new Set(s1.split(/[^a-z0-9]+/));
  const words2 = new Set(s2.split(/[^a-z0-9]+/));
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

function findBestMatch(searchTitle: string, movies: any[], year?: number): any {
  let bestMatch = null;
  let bestScore = 0;

  for (const movie of movies) {
    const similarity = calculateSimilarity(searchTitle, movie.name);

    // Boost score if year matches
    const yearBoost = year && movie.year === year ? 0.2 : 0;
    const score = similarity + yearBoost;

    // Consider it a match if:
    // 1. Score is better than previous best
    // 2. Score is above threshold (0.5 for general matches, 0.3 if year matches)
    if (score > bestScore && (score >= 0.5 || (yearBoost && score >= 0.3))) {
      bestMatch = movie;
      bestScore = score;
    }
  }

  return bestMatch;
}

export async function scrapeRottenTomatoes(
  title: string,
  year?: number,
): Promise<RTMovie | null> {
  // Check if we have a proxy or extension
  const hasExtension = await isExtensionActive();
  const hasProxy = Boolean(useAuthStore.getState().proxySet);

  if (!hasExtension && !hasProxy) {
    throw new Error(
      "Rotten Tomatoes scraping requires either the browser extension or a custom proxy to be set up. " +
        "Please install the extension or set up a proxy in the settings.",
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    `[RT Scraper] Using ${hasExtension ? "browser extension" : "custom proxy"} for requests`,
  );

  // Construct search URL with cleaned title
  const searchQuery = encodeURIComponent(title.trim());
  const searchUrl = `https://www.rottentomatoes.com/search?search=${searchQuery}`;

  // Add random delay to avoid rate limiting
  const delay = Math.floor(Math.random() * (197 - 69) + 69);
  await new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });

  // Fetch search results using appropriate fetcher
  let response: string;
  if (hasExtension) {
    const extensionFetcher = makeExtensionFetcher();
    const result = await extensionFetcher(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      method: "GET",
      query: {},
      readHeaders: [],
    });
    response = result.body as string;
  } else {
    response = await proxiedFetch<string>(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
  }

  try {
    // Extract movie data from the new HTML structure
    const searchResultsDiv = response.match(
      /<div id="search-results"[^>]*>(.*?)<\/div>/s,
    );
    if (!searchResultsDiv) {
      console.error("Could not find search results in RT response");
      return null;
    }

    // Extract movie rows from search results
    const movieRows = searchResultsDiv[1].match(
      /<search-page-media-row[^>]*>(.*?)<\/search-page-media-row>/gs,
    );
    if (!movieRows || movieRows.length === 0) return null;

    // Convert movie rows to structured data
    const movies = movieRows.map((row) => {
      const nameMatch = row.match(/data-qa="info-name"[^>]*>([^<]+)</);
      const urlMatch = row.match(/href="([^"]+)"/);
      const scoreMatch = row.match(/tomatometerscore="([^"]+)"/);
      const sentimentMatch = row.match(/tomatometersentiment="([^"]+)"/);
      const yearMatch = row.match(/releaseyear="([^"]+)"/);
      const tomatometeriscertified = row.match(
        /tomatometeriscertified="([^"]+)"/,
      );

      return {
        name: nameMatch ? nameMatch[1].trim() : "",
        url: urlMatch ? urlMatch[1] : "",
        year: yearMatch ? parseInt(yearMatch[1], 10) : null,
        tomatometer: {
          value: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
          state:
            sentimentMatch &&
            tomatometeriscertified?.[1] === "true" &&
            parseInt(scoreMatch?.[1] || "0", 10) >= 75
              ? "certified_fresh"
              : sentimentMatch
                ? sentimentMatch[1].toLowerCase() === "positive"
                  ? "fresh"
                  : "rotten"
                : "rotten",
        },
      };
    });

    // Try to find the best matching movie
    const match = findBestMatch(title, movies, year);

    if (!match) return null;

    // Extract the movie data
    return {
      title: match.name,
      tomatoIcon: match.tomatometer?.state || "rotten",
      tomatoScore: match.tomatometer?.value || 0,
      url: `https://www.rottentomatoes.com${match.url}`,
    };
  } catch (error) {
    console.error("Error parsing Rotten Tomatoes data:", error);
    return null;
  }
}

export function getRTIcon(
  type: "certified_fresh" | "fresh" | "rotten",
): string {
  switch (type) {
    case "certified_fresh":
      return "/tomatoes/Certified_Fresh.svg";
    case "fresh":
      return "/tomatoes/Fresh.svg";
    case "rotten":
      return "/tomatoes/Rotten.svg";
    default:
      return "/tomatoes/Rotten.svg";
  }
}
