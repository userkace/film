import {
  APP_VERSION,
  BACKEND_URL,
  DISCORD_LINK,
  // GITHUB_LINK,
  TWITTER_LINK,
} from "./constants";

interface Config {
  APP_VERSION: string;
  GITHUB_LINK: string;
  DISCORD_LINK: string;
  DMCA_EMAIL: string;
  TWITTER_LINK: string;
  TMDB_READ_API_KEY: string;
  CORS_PROXY_URL: string;
  M3U8_PROXY_URL: string;
  NORMAL_ROUTER: boolean;
  BACKEND_URL: string;
  DISALLOWED_IDS: string;
  TURNSTILE_KEY: string;
  CDN_REPLACEMENTS: string;
  HAS_ONBOARDING: string;
  ONBOARDING_CHROME_EXTENSION_INSTALL_LINK: string;
  ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK: string;
  ONBOARDING_PROXY_INSTALL_LINK: string;
  ALLOW_AUTOPLAY: boolean;
  ALLOW_FEBBOX_KEY: boolean;
  ALLOW_REAL_DEBRID_KEY: boolean;
  SHOW_AD: boolean;
  AD_CONTENT_URL: string;
  TRACK_SCRIPT: string;
  BANNER_MESSAGE: string;
  BANNER_ID: string;
}

export interface RuntimeConfig {
  APP_VERSION: string;
  GITHUB_LINK: string;
  DISCORD_LINK: string;
  DMCA_EMAIL: string | null;
  TWITTER_LINK: string;
  TMDB_READ_API_KEY: string | null;
  ALLOW_REAL_DEBRID_KEY: boolean;
  NORMAL_ROUTER: boolean;
  PROXY_URLS: string[];
  M3U8_PROXY_URLS: string[];
  BACKEND_URL: string | null;
  DISALLOWED_IDS: string[];
  TURNSTILE_KEY: string | null;
  CDN_REPLACEMENTS: Array<string[]>;
  HAS_ONBOARDING: boolean;
  ALLOW_AUTOPLAY: boolean;
  ONBOARDING_CHROME_EXTENSION_INSTALL_LINK: string | null;
  ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK: string | null;
  ONBOARDING_PROXY_INSTALL_LINK: string | null;
  ALLOW_FEBBOX_KEY: boolean;
  SHOW_AD: boolean;
  AD_CONTENT_URL: string[];
  TRACK_SCRIPT: string | null;
  BANNER_MESSAGE: string | null;
  BANNER_ID: string | null;
}

const env: Record<keyof Config, undefined | string> = {
  TMDB_READ_API_KEY: import.meta.env.VITE_TMDB_READ_API_KEY,
  APP_VERSION: undefined,
  GITHUB_LINK: undefined,
  DISCORD_LINK: undefined,
  TWITTER_LINK: undefined,
  ONBOARDING_CHROME_EXTENSION_INSTALL_LINK: import.meta.env
    .VITE_ONBOARDING_CHROME_EXTENSION_INSTALL_LINK,
  ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK: import.meta.env
    .VITE_ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK,
  ONBOARDING_PROXY_INSTALL_LINK: import.meta.env
    .VITE_ONBOARDING_PROXY_INSTALL_LINK,
  DMCA_EMAIL: import.meta.env.VITE_DMCA_EMAIL,
  CORS_PROXY_URL: import.meta.env.VITE_CORS_PROXY_URL,
  M3U8_PROXY_URL: import.meta.env.VITE_M3U8_PROXY_URL,
  NORMAL_ROUTER: import.meta.env.VITE_NORMAL_ROUTER,
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  DISALLOWED_IDS: import.meta.env.VITE_DISALLOWED_IDS,
  TURNSTILE_KEY: import.meta.env.VITE_TURNSTILE_KEY,
  CDN_REPLACEMENTS: import.meta.env.VITE_CDN_REPLACEMENTS,
  HAS_ONBOARDING: import.meta.env.VITE_HAS_ONBOARDING,
  ALLOW_AUTOPLAY: import.meta.env.VITE_ALLOW_AUTOPLAY,
  ALLOW_FEBBOX_KEY: import.meta.env.VITE_ALLOW_FEBBOX_KEY,
  ALLOW_REAL_DEBRID_KEY: import.meta.env.VITE_ALLOW_REAL_DEBRID_KEY,
  SHOW_AD: import.meta.env.VITE_SHOW_AD,
  AD_CONTENT_URL: import.meta.env.VITE_AD_CONTENT_URL,
  TRACK_SCRIPT: import.meta.env.VITE_TRACK_SCRIPT,
  BANNER_MESSAGE: import.meta.env.VITE_BANNER_MESSAGE,
  BANNER_ID: import.meta.env.VITE_BANNER_ID,
};

function coerceUndefined(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (value.length === 0) return undefined;
  return value;
}

// loads from different locations, in order: environment (VITE_{KEY}), window (public/config.js)
function getKeyValue(key: keyof Config): string | undefined {
  const windowValue = (window as any)?.__CONFIG__?.[`VITE_${key}`];

  return coerceUndefined(env[key]) ?? coerceUndefined(windowValue) ?? undefined;
}

function getKey(key: keyof Config): string | null;
function getKey(key: keyof Config, defaultString: string): string;
function getKey(key: keyof Config, defaultString?: string): string | null {
  return getKeyValue(key)?.toString() ?? defaultString ?? null;
}

export function conf(): RuntimeConfig {
  return {
    APP_VERSION,
    GITHUB_LINK: getKey("GITHUB_LINK", ""),
    DISCORD_LINK,
    TWITTER_LINK,
    DMCA_EMAIL: getKey("DMCA_EMAIL"),
    ONBOARDING_CHROME_EXTENSION_INSTALL_LINK: getKey(
      "ONBOARDING_CHROME_EXTENSION_INSTALL_LINK",
      "https://docs.pstream.mov/extension",
    ),
    ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK: getKey(
      "ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK",
      "https://docs.pstream.mov/extension",
    ),
    ONBOARDING_PROXY_INSTALL_LINK: getKey("ONBOARDING_PROXY_INSTALL_LINK"),
    BACKEND_URL: getKey("BACKEND_URL", BACKEND_URL),
    TMDB_READ_API_KEY: getKey("TMDB_READ_API_KEY"),
    PROXY_URLS: getKey("CORS_PROXY_URL", "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0),
    M3U8_PROXY_URLS: getKey("M3U8_PROXY_URL", "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0),
    NORMAL_ROUTER: getKey("NORMAL_ROUTER", "false") === "true",
    HAS_ONBOARDING: getKey("HAS_ONBOARDING", "false") === "true",
    ALLOW_AUTOPLAY: getKey("ALLOW_AUTOPLAY", "false") === "true",
    TURNSTILE_KEY: getKey("TURNSTILE_KEY"),
    DISALLOWED_IDS: getKey("DISALLOWED_IDS", "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0), // Should be comma-seperated and contain the media type and ID, formatted like so: movie-753342,movie-753342,movie-753342
    CDN_REPLACEMENTS: getKey("CDN_REPLACEMENTS", "")
      .split(",")
      .map((v) =>
        v
          .split(":")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
      )
      .filter((v) => v.length === 2), // The format is <beforeA>:<afterA>,<beforeB>:<afterB>
    ALLOW_FEBBOX_KEY: getKey("ALLOW_FEBBOX_KEY", "false") === "true",
    ALLOW_REAL_DEBRID_KEY: getKey("ALLOW_REAL_DEBRID_KEY", "false") === "true",
    SHOW_AD: getKey("SHOW_AD", "false") === "true",
    AD_CONTENT_URL: getKey("AD_CONTENT_URL", "")
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0),
    TRACK_SCRIPT: getKey("TRACK_SCRIPT"),
    BANNER_MESSAGE: getKey("BANNER_MESSAGE"),
    BANNER_ID: getKey("BANNER_ID"),
  };
}
