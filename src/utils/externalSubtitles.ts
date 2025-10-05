/* eslint-disable no-console */
import { type SubtitleData, searchSubtitles } from "wyzie-lib";

import { CaptionListItem, PlayerMeta } from "@/stores/player/slices/source";

// Helper function to convert language names to language codes
function labelToLanguageCode(languageName: string): string {
  const languageMap: Record<string, string> = {
    English: "en",
    Spanish: "es",
    French: "fr",
    German: "de",
    Italian: "it",
    Portuguese: "pt",
    Russian: "ru",
    Japanese: "ja",
    Korean: "ko",
    Chinese: "zh",
    Arabic: "ar",
    Hindi: "hi",
    Turkish: "tr",
    Dutch: "nl",
    Polish: "pl",
    Swedish: "sv",
    Norwegian: "no",
    Danish: "da",
    Finnish: "fi",
    Greek: "el",
    Hebrew: "he",
    Thai: "th",
    Vietnamese: "vi",
    Indonesian: "id",
    Malay: "ms",
    Filipino: "tl",
    Ukrainian: "uk",
    Romanian: "ro",
    Czech: "cs",
    Hungarian: "hu",
    Bulgarian: "bg",
    Croatian: "hr",
    Serbian: "sr",
    Slovak: "sk",
    Slovenian: "sl",
    Estonian: "et",
    Latvian: "lv",
    Lithuanian: "lt",
    Icelandic: "is",
    Maltese: "mt",
    Georgian: "ka",
    Armenian: "hy",
    Azerbaijani: "az",
    Kazakh: "kk",
    Kyrgyz: "ky",
    Uzbek: "uz",
    Tajik: "tg",
    Turkmen: "tk",
    Mongolian: "mn",
    Persian: "fa",
    Urdu: "ur",
    Bengali: "bn",
    Tamil: "ta",
    Telugu: "te",
    Marathi: "mr",
    Gujarati: "gu",
    Kannada: "kn",
    Malayalam: "ml",
    Punjabi: "pa",
    Sinhala: "si",
    Nepali: "ne",
    Burmese: "my",
    Khmer: "km",
    Lao: "lo",
    Tibetan: "bo",
    Uyghur: "ug",
    Kurdish: "ku",
    Pashto: "ps",
    Dari: "prs",
    Sindhi: "sd",
    Kashmiri: "ks",
    Dogri: "doi",
    Konkani: "kok",
    Manipuri: "mni",
    Bodo: "brx",
    Sanskrit: "sa",
    Santhali: "sat",
    Maithili: "mai",
    Bhojpuri: "bho",
    Awadhi: "awa",
    Chhattisgarhi: "hne",
    Magahi: "mag",
    Rajasthani: "raj",
    Malvi: "mup",
    Bundeli: "bns",
    Bagheli: "bfy",
    Pahari: "phr",
    Kumaoni: "kfy",
    Garhwali: "gbm",
    Kangri: "xnr",
  };

  return languageMap[languageName] || languageName.toLowerCase();
}

export async function scrapeWyzieCaptions(
  tmdbId: string | number,
  imdbId: string,
  season?: number,
  episode?: number,
): Promise<CaptionListItem[]> {
  try {
    const searchParams: any = {
      encoding: "utf-8",
      source: "all",
      imdb_id: imdbId,
    };

    if (tmdbId && !imdbId) {
      searchParams.tmdb_id =
        typeof tmdbId === "string" ? parseInt(tmdbId, 10) : tmdbId;
    }

    if (season && episode) {
      searchParams.season = season;
      searchParams.episode = episode;
    }

    console.log("Searching Wyzie subtitles with params:", searchParams);
    const wyzieSubtitles: SubtitleData[] = await searchSubtitles(searchParams);

    const wyzieCaptions: CaptionListItem[] = wyzieSubtitles.map((subtitle) => ({
      id: subtitle.id,
      language: subtitle.language,
      url: subtitle.url,
      type:
        subtitle.format === "srt" || subtitle.format === "vtt"
          ? subtitle.format
          : "srt",
      needsProxy: false,
      opensubtitles: true,
      // Additional metadata from Wyzie
      display: subtitle.display,
      media: subtitle.media,
      isHearingImpaired: subtitle.isHearingImpaired,
      source: `wyzie ${subtitle.source.toString() === "opensubtitles" ? "opensubs" : subtitle.source}`,
      encoding: subtitle.encoding,
    }));

    return wyzieCaptions;
  } catch (error) {
    console.error("Error fetching Wyzie subtitles:", error);
    return [];
  }
}

export async function scrapeOpenSubtitlesCaptions(
  imdbId: string,
  season?: number,
  episode?: number,
): Promise<CaptionListItem[]> {
  try {
    const url = `https://rest.opensubtitles.org/search/${
      season && episode ? `episode-${episode}/` : ""
    }imdbid-${imdbId.slice(2)}${season && episode ? `/season-${season}` : ""}`;

    const response = await fetch(url, {
      headers: {
        "X-User-Agent": "VLSub 0.10.2",
      },
    });

    if (!response.ok) {
      throw new Error(`OpenSubtitles API returned ${response.status}`);
    }

    const data = await response.json();
    const openSubtitlesCaptions: CaptionListItem[] = [];

    for (const caption of data) {
      const downloadUrl = caption.SubDownloadLink.replace(".gz", "").replace(
        "download/",
        "download/subencoding-utf8/",
      );
      const language = labelToLanguageCode(caption.LanguageName);

      if (!downloadUrl || !language) continue;

      openSubtitlesCaptions.push({
        id: downloadUrl,
        language,
        url: downloadUrl,
        type: caption.SubFormat || "srt",
        needsProxy: false,
        opensubtitles: true,
        source: "opensubs", // shortened becuase used on CaptionView for badge
      });
    }

    return openSubtitlesCaptions;
  } catch (error) {
    console.error("Error fetching OpenSubtitles:", error);
    return [];
  }
}

export async function scrapeFebboxCaptions(
  imdbId: string,
  season?: number,
  episode?: number,
): Promise<CaptionListItem[]> {
  try {
    let url: string;
    if (season && episode) {
      url = `https://fed-subs.pstream.mov/tv/${imdbId}/${season}/${episode}`;
    } else {
      url = `https://fed-subs.pstream.mov/movie/${imdbId}`;
    }

    // console.log("Searching Febbox subtitles with URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Febbox API returned ${response.status}`);
    }

    const data = await response.json();

    // Check for error response
    if (data.error) {
      console.log("Febbox API error:", data.error);
      return [];
    }

    // Check if subtitles exist
    if (!data.subtitles || typeof data.subtitles !== "object") {
      console.log("No subtitles found in Febbox response");
      return [];
    }

    const febboxCaptions: CaptionListItem[] = [];

    // Iterate through all available languages
    for (const [languageName, subtitleData] of Object.entries(data.subtitles)) {
      if (typeof subtitleData === "object" && subtitleData !== null) {
        const subtitle = subtitleData as {
          subtitle_link: string;
          subtitle_name: string;
        };

        if (subtitle.subtitle_link) {
          const language = labelToLanguageCode(languageName);
          const fileExtension = subtitle.subtitle_link
            .split(".")
            .pop()
            ?.toLowerCase();

          // Determine subtitle type based on file extension
          let type: string = "srt";
          if (fileExtension === "vtt") {
            type = "vtt";
          } else if (fileExtension === "sub") {
            type = "sub";
          }

          febboxCaptions.push({
            id: subtitle.subtitle_link,
            language,
            url: subtitle.subtitle_link,
            type,
            needsProxy: false,
            opensubtitles: true,
            display: subtitle.subtitle_name,
            source: "febbox",
          });
        }
      }
    }

    console.log(`Found ${febboxCaptions.length} Febbox subtitles`);
    return febboxCaptions;
  } catch (error) {
    console.error("Error fetching Febbox subtitles:", error);
    return [];
  }
}

export async function scrapeExternalSubtitles(
  meta: PlayerMeta,
): Promise<CaptionListItem[]> {
  try {
    // Extract IMDb ID from meta
    const imdbId = meta.imdbId;
    if (!imdbId) {
      console.log("No IMDb ID available for external subtitle scraping");
      return [];
    }

    const season = meta.season?.number;
    const episode = meta.episode?.number;
    const tmdbId = meta.tmdbId;

    // Set a reasonable timeout for each source (10 seconds)
    const timeout = 10000;

    // Create promises for each source with individual timeouts
    const wyziePromise = scrapeWyzieCaptions(tmdbId, imdbId, season, episode);
    const openSubsPromise = scrapeOpenSubtitlesCaptions(
      imdbId,
      season,
      episode,
    );
    const febboxPromise = scrapeFebboxCaptions(imdbId, season, episode);

    // Create timeout promises
    const timeoutPromise = new Promise<CaptionListItem[]>((resolve) => {
      setTimeout(() => resolve([]), timeout);
    });

    // Start all promises and collect results as they complete
    const allCaptions: CaptionListItem[] = [];
    let completedSources = 0;
    const totalSources = 3;

    // Helper function to handle individual source completion
    const handleSourceCompletion = (
      sourceName: string,
      captions: CaptionListItem[],
    ) => {
      allCaptions.push(...captions);
      completedSources += 1;
      console.log(
        `${sourceName} completed with ${captions.length} captions (${completedSources}/${totalSources} sources done)`,
      );
    };

    // Start all sources concurrently and handle them as they complete
    const promises = [
      Promise.race([wyziePromise, timeoutPromise]).then((captions) => {
        handleSourceCompletion("Wyzie", captions);
        return captions;
      }),
      Promise.race([openSubsPromise, timeoutPromise]).then((captions) => {
        handleSourceCompletion("OpenSubtitles", captions);
        return captions;
      }),
      Promise.race([febboxPromise, timeoutPromise]).then((captions) => {
        handleSourceCompletion("Febbox", captions);
        return captions;
      }),
    ];

    // Wait for all sources to complete (with timeouts)
    await Promise.allSettled(promises);

    console.log(
      `Found ${allCaptions.length} total external captions from all sources`,
    );

    return allCaptions;
  } catch (error) {
    console.error("Error in scrapeExternalSubtitles:", error);
    return [];
  }
}
