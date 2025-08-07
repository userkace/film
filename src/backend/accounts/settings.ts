import { ofetch } from "ofetch";

import { getAuthHeaders } from "@/backend/accounts/auth";
import { AccountWithToken } from "@/stores/auth";

export interface SettingsInput {
  applicationLanguage?: string;
  applicationTheme?: string | null;
  defaultSubtitleLanguage?: string;
  proxyUrls?: string[] | null;
  febboxKey?: string | null;
  realDebridKey?: string | null;
  enableThumbnails?: boolean;
  enableAutoplay?: boolean;
  enableSkipCredits?: boolean;
  enableDiscover?: boolean;
  enableFeatured?: boolean;
  enableDetailsModal?: boolean;
  enableImageLogos?: boolean;
  enableCarouselView?: boolean;
  forceCompactEpisodeView?: boolean;
  sourceOrder?: string[];
  enableSourceOrder?: boolean;
  proxyTmdb?: boolean;
  enableLowPerformanceMode?: boolean;
  enableNativeSubtitles?: boolean;
}

export interface SettingsResponse {
  applicationTheme?: string | null;
  applicationLanguage?: string | null;
  defaultSubtitleLanguage?: string | null;
  proxyUrls?: string[] | null;
  febboxKey?: string | null;
  realDebridKey?: string | null;
  enableThumbnails?: boolean;
  enableAutoplay?: boolean;
  enableSkipCredits?: boolean;
  enableDiscover?: boolean;
  enableFeatured?: boolean;
  enableDetailsModal?: boolean;
  enableImageLogos?: boolean;
  enableCarouselView?: boolean;
  sourceOrder?: string[];
  enableSourceOrder?: boolean;
  proxyTmdb?: boolean;
  enableLowPerformanceMode?: boolean;
  enableNativeSubtitles?: boolean;
}

export function updateSettings(
  url: string,
  account: AccountWithToken,
  settings: SettingsInput,
) {
  return ofetch<SettingsResponse>(`/users/${account.userId}/settings`, {
    method: "PUT",
    body: settings,
    baseURL: url,
    headers: getAuthHeaders(account.token),
  });
}

export function getSettings(url: string, account: AccountWithToken) {
  return ofetch<SettingsResponse>(`/users/${account.userId}/settings`, {
    method: "GET",
    baseURL: url,
    headers: getAuthHeaders(account.token),
  });
}
