import { useCallback } from "react";

import { LoginResponse, SessionResponse } from "@/backend/accounts/auth";
import { SettingsResponse } from "@/backend/accounts/settings";
import {
  BookmarkResponse,
  ProgressResponse,
  UserResponse,
  bookmarkResponsesToEntries,
  progressResponsesToEntries,
} from "@/backend/accounts/user";
import { useAuthStore } from "@/stores/auth";
import { useBookmarkStore } from "@/stores/bookmarks";
import { useGroupOrderStore } from "@/stores/groupOrder";
import { useLanguageStore } from "@/stores/language";
import { usePreferencesStore } from "@/stores/preferences";
import { useProgressStore } from "@/stores/progress";
import { useSubtitleStore } from "@/stores/subtitles";
import { useThemeStore } from "@/stores/theme";

export function useAuthData() {
  const loggedIn = !!useAuthStore((s) => s.account);
  const setAccount = useAuthStore((s) => s.setAccount);
  const removeAccount = useAuthStore((s) => s.removeAccount);
  const setProxySet = useAuthStore((s) => s.setProxySet);
  const clearBookmarks = useBookmarkStore((s) => s.clear);
  const clearProgress = useProgressStore((s) => s.clear);
  const clearGroupOrder = useGroupOrderStore((s) => s.clear);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setAppLanguage = useLanguageStore((s) => s.setLanguage);
  const importSubtitleLanguage = useSubtitleStore(
    (s) => s.importSubtitleLanguage,
  );
  const setFebboxKey = usePreferencesStore((s) => s.setFebboxKey);

  const replaceBookmarks = useBookmarkStore((s) => s.replaceBookmarks);
  const replaceItems = useProgressStore((s) => s.replaceItems);

  const setEnableThumbnails = usePreferencesStore((s) => s.setEnableThumbnails);
  const setEnableAutoplay = usePreferencesStore((s) => s.setEnableAutoplay);
  const setEnableSkipCredits = usePreferencesStore(
    (s) => s.setEnableSkipCredits,
  );
  const setEnableDiscover = usePreferencesStore((s) => s.setEnableDiscover);
  const setEnableFeatured = usePreferencesStore((s) => s.setEnableFeatured);
  const setEnableDetailsModal = usePreferencesStore(
    (s) => s.setEnableDetailsModal,
  );
  const setEnableImageLogos = usePreferencesStore((s) => s.setEnableImageLogos);
  const setEnableCarouselView = usePreferencesStore(
    (s) => s.setEnableCarouselView,
  );
  const setSourceOrder = usePreferencesStore((s) => s.setSourceOrder);
  const setEnableSourceOrder = usePreferencesStore(
    (s) => s.setEnableSourceOrder,
  );
  const setProxyTmdb = usePreferencesStore((s) => s.setProxyTmdb);

  const setEnableLowPerformanceMode = usePreferencesStore(
    (s) => s.setEnableLowPerformanceMode,
  );
  const setEnableNativeSubtitles = usePreferencesStore(
    (s) => s.setEnableNativeSubtitles,
  );
  const setEnableHoldToBoost = usePreferencesStore(
    (s) => s.setEnableHoldToBoost,
  );

  const login = useCallback(
    async (
      loginResponse: LoginResponse,
      user: UserResponse,
      session: SessionResponse,
      seed: string,
    ) => {
      const account = {
        token: loginResponse.token,
        userId: user.id,
        sessionId: loginResponse.session.id,
        deviceName: session.device,
        profile: user.profile,
        seed,
      };
      setAccount(account);
      return account;
    },
    [setAccount],
  );

  const logout = useCallback(async () => {
    removeAccount();
    clearBookmarks();
    clearProgress();
    clearGroupOrder();
    setFebboxKey(null);
  }, [
    removeAccount,
    clearBookmarks,
    clearProgress,
    clearGroupOrder,
    setFebboxKey,
  ]);

  const syncData = useCallback(
    async (
      _user: UserResponse,
      _session: SessionResponse,
      progress: ProgressResponse[],
      bookmarks: BookmarkResponse[],
      settings: SettingsResponse,
      groupOrder: { groupOrder: string[] },
    ) => {
      replaceBookmarks(bookmarkResponsesToEntries(bookmarks));
      replaceItems(progressResponsesToEntries(progress));

      if (groupOrder?.groupOrder) {
        useGroupOrderStore.getState().setGroupOrder(groupOrder.groupOrder);
      }

      if (settings.applicationLanguage) {
        setAppLanguage(settings.applicationLanguage);
      }

      if (settings.defaultSubtitleLanguage) {
        importSubtitleLanguage(settings.defaultSubtitleLanguage);
      }

      if (settings.applicationTheme) {
        setTheme(settings.applicationTheme);
      }

      if (settings.proxyUrls) {
        setProxySet(settings.proxyUrls);
      }

      if (settings.enableThumbnails !== undefined) {
        setEnableThumbnails(settings.enableThumbnails);
      }

      if (settings.enableAutoplay !== undefined) {
        setEnableAutoplay(settings.enableAutoplay);
      }

      if (settings.enableSkipCredits !== undefined) {
        setEnableSkipCredits(settings.enableSkipCredits);
      }

      if (settings.enableDiscover !== undefined) {
        setEnableDiscover(settings.enableDiscover);
      }

      if (settings.enableFeatured !== undefined) {
        setEnableFeatured(settings.enableFeatured);
      }

      if (settings.enableDetailsModal !== undefined) {
        setEnableDetailsModal(settings.enableDetailsModal);
      }

      if (settings.enableImageLogos !== undefined) {
        setEnableImageLogos(settings.enableImageLogos);
      }

      if (settings.enableCarouselView !== undefined) {
        setEnableCarouselView(settings.enableCarouselView);
      }

      if (settings.sourceOrder !== undefined) {
        setSourceOrder(settings.sourceOrder);
      }

      if (settings.enableSourceOrder !== undefined) {
        setEnableSourceOrder(settings.enableSourceOrder);
      }

      if (settings.proxyTmdb !== undefined) {
        setProxyTmdb(settings.proxyTmdb);
      }

      if (settings.febboxKey !== undefined) {
        setFebboxKey(settings.febboxKey);
      }

      if (settings.enableLowPerformanceMode !== undefined) {
        setEnableLowPerformanceMode(settings.enableLowPerformanceMode);
      }

      if (settings.enableNativeSubtitles !== undefined) {
        setEnableNativeSubtitles(settings.enableNativeSubtitles);
      }

      if (settings.enableHoldToBoost !== undefined) {
        setEnableHoldToBoost(settings.enableHoldToBoost);
      }
    },
    [
      replaceBookmarks,
      replaceItems,
      setAppLanguage,
      importSubtitleLanguage,
      setTheme,
      setProxySet,
      setEnableThumbnails,
      setEnableAutoplay,
      setEnableSkipCredits,
      setEnableDiscover,
      setEnableFeatured,
      setEnableDetailsModal,
      setEnableImageLogos,
      setEnableCarouselView,
      setSourceOrder,
      setEnableSourceOrder,
      setProxyTmdb,
      setFebboxKey,
      setEnableLowPerformanceMode,
      setEnableNativeSubtitles,
      setEnableHoldToBoost,
    ],
  );

  return {
    loggedIn,
    login,
    logout,
    syncData,
  };
}
