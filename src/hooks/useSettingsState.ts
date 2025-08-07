import isEqual from "lodash.isequal";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { SubtitleStyling } from "@/stores/subtitles";
import { usePreviewThemeStore } from "@/stores/theme";

export function useDerived<T>(
  initial: T,
): [T, Dispatch<SetStateAction<T>>, () => void, boolean] {
  const [overwrite, setOverwrite] = useState<T | undefined>(undefined);
  useEffect(() => {
    setOverwrite(undefined);
  }, [initial]);
  const changed = useMemo(
    () => !isEqual(overwrite, initial) && overwrite !== undefined,
    [overwrite, initial],
  );
  const setter = useCallback<Dispatch<SetStateAction<T>>>(
    (inp) => {
      if (!(inp instanceof Function)) setOverwrite(inp);
      else setOverwrite((s) => inp(s !== undefined ? s : initial));
    },
    [initial, setOverwrite],
  );
  const data = overwrite === undefined ? initial : overwrite;

  const reset = useCallback(() => setOverwrite(undefined), [setOverwrite]);

  return [data, setter, reset, changed];
}

export function useSettingsState(
  theme: string | null,
  appLanguage: string,
  subtitleStyling: SubtitleStyling,
  deviceName: string,
  proxyUrls: string[] | null,
  backendUrl: string | null,
  febboxKey: string | null,
  realDebridKey: string | null,
  profile:
    | {
        colorA: string;
        colorB: string;
        icon: string;
      }
    | undefined,
  enableThumbnails: boolean,
  enableAutoplay: boolean,
  enableDiscover: boolean,
  enableFeatured: boolean,
  enableDetailsModal: boolean,
  sourceOrder: string[],
  enableSourceOrder: boolean,
  proxyTmdb: boolean,
  enableSkipCredits: boolean,
  enableImageLogos: boolean,
  enableCarouselView: boolean,
  forceCompactEpisodeView: boolean,
  enableLowPerformanceMode: boolean,
) {
  const [proxyUrlsState, setProxyUrls, resetProxyUrls, proxyUrlsChanged] =
    useDerived(proxyUrls);
  const [backendUrlState, setBackendUrl, resetBackendUrl, backendUrlChanged] =
    useDerived(backendUrl);
  const [febboxKeyState, setFebboxKey, resetFebboxKey, febboxKeyChanged] =
    useDerived(febboxKey);
  const [
    realDebridKeyState,
    setRealDebridKey,
    resetRealDebridKey,
    realDebridKeyChanged,
  ] = useDerived(realDebridKey);
  const [themeState, setTheme, resetTheme, themeChanged] = useDerived(theme);
  const setPreviewTheme = usePreviewThemeStore((s) => s.setPreviewTheme);
  const resetPreviewTheme = useCallback(
    () => setPreviewTheme(theme),
    [setPreviewTheme, theme],
  );
  const [
    appLanguageState,
    setAppLanguage,
    resetAppLanguage,
    appLanguageChanged,
  ] = useDerived(appLanguage);
  const [subStylingState, setSubStyling, resetSubStyling, subStylingChanged] =
    useDerived(subtitleStyling);
  const [
    deviceNameState,
    setDeviceNameState,
    resetDeviceName,
    deviceNameChanged,
  ] = useDerived(deviceName);
  const [profileState, setProfileState, resetProfile, profileChanged] =
    useDerived(profile);
  const [
    enableThumbnailsState,
    setEnableThumbnailsState,
    resetEnableThumbnails,
    enableThumbnailsChanged,
  ] = useDerived(enableThumbnails);
  const [
    enableAutoplayState,
    setEnableAutoplayState,
    resetEnableAutoplay,
    enableAutoplayChanged,
  ] = useDerived(enableAutoplay);
  const [
    enableSkipCreditsState,
    setEnableSkipCreditsState,
    resetEnableSkipCredits,
    enableSkipCreditsChanged,
  ] = useDerived(enableSkipCredits);
  const [
    enableDiscoverState,
    setEnableDiscoverState,
    resetEnableDiscover,
    enableDiscoverChanged,
  ] = useDerived(enableDiscover);
  const [
    enableFeaturedState,
    setEnableFeaturedState,
    resetEnableFeatured,
    enableFeaturedChanged,
  ] = useDerived(enableFeatured);
  const [
    enableDetailsModalState,
    setEnableDetailsModalState,
    resetEnableDetailsModal,
    enableDetailsModalChanged,
  ] = useDerived(enableDetailsModal);
  const [
    enableImageLogosState,
    setEnableImageLogosState,
    resetEnableImageLogos,
    enableImageLogosChanged,
  ] = useDerived(enableImageLogos);
  const [
    sourceOrderState,
    setSourceOrderState,
    resetSourceOrder,
    sourceOrderChanged,
  ] = useDerived(sourceOrder);
  const [
    enableSourceOrderState,
    setEnableSourceOrderState,
    resetEnableSourceOrder,
    enableSourceOrderChanged,
  ] = useDerived(enableSourceOrder);
  const [proxyTmdbState, setProxyTmdbState, resetProxyTmdb, proxyTmdbChanged] =
    useDerived(proxyTmdb);
  const [
    enableCarouselViewState,
    setEnableCarouselViewState,
    resetEnableCarouselView,
    enableCarouselViewChanged,
  ] = useDerived(enableCarouselView);
  const [
    forceCompactEpisodeViewState,
    setForceCompactEpisodeViewState,
    resetForceCompactEpisodeView,
    forceCompactEpisodeViewChanged,
  ] = useDerived(forceCompactEpisodeView);
  const [
    enableLowPerformanceModeState,
    setEnableLowPerformanceModeState,
    resetEnableLowPerformanceMode,
    enableLowPerformanceModeChanged,
  ] = useDerived(enableLowPerformanceMode);

  function reset() {
    resetTheme();
    resetPreviewTheme();
    resetAppLanguage();
    resetSubStyling();
    resetProxyUrls();
    resetBackendUrl();
    resetFebboxKey();
    resetRealDebridKey();
    resetDeviceName();
    resetProfile();
    resetEnableThumbnails();
    resetEnableAutoplay();
    resetEnableSkipCredits();
    resetEnableDiscover();
    resetEnableFeatured();
    resetEnableDetailsModal();
    resetEnableImageLogos();
    resetSourceOrder();
    resetEnableSourceOrder();
    resetProxyTmdb();
    resetEnableCarouselView();
    resetForceCompactEpisodeView();
    resetEnableLowPerformanceMode();
  }

  const changed =
    themeChanged ||
    appLanguageChanged ||
    subStylingChanged ||
    deviceNameChanged ||
    backendUrlChanged ||
    proxyUrlsChanged ||
    febboxKeyChanged ||
    realDebridKeyChanged ||
    profileChanged ||
    enableThumbnailsChanged ||
    enableAutoplayChanged ||
    enableSkipCreditsChanged ||
    enableDiscoverChanged ||
    enableFeaturedChanged ||
    enableDetailsModalChanged ||
    enableImageLogosChanged ||
    sourceOrderChanged ||
    enableSourceOrderChanged ||
    proxyTmdbChanged ||
    enableCarouselViewChanged ||
    forceCompactEpisodeViewChanged ||
    enableLowPerformanceModeChanged;

  return {
    reset,
    changed,
    theme: {
      state: themeState,
      set: setTheme,
      changed: themeChanged,
    },
    appLanguage: {
      state: appLanguageState,
      set: setAppLanguage,
      changed: appLanguageChanged,
    },
    subtitleStyling: {
      state: subStylingState,
      set: setSubStyling,
      changed: subStylingChanged,
    },
    deviceName: {
      state: deviceNameState,
      set: setDeviceNameState,
      changed: deviceNameChanged,
    },
    proxyUrls: {
      state: proxyUrlsState,
      set: setProxyUrls,
      changed: proxyUrlsChanged,
    },
    backendUrl: {
      state: backendUrlState,
      set: setBackendUrl,
      changed: backendUrlChanged,
    },
    febboxKey: {
      state: febboxKeyState,
      set: setFebboxKey,
      changed: febboxKeyChanged,
    },
    realDebridKey: {
      state: realDebridKeyState,
      set: setRealDebridKey,
      changed: realDebridKeyChanged,
    },
    profile: {
      state: profileState,
      set: setProfileState,
      changed: profileChanged,
    },
    enableThumbnails: {
      state: enableThumbnailsState,
      set: setEnableThumbnailsState,
      changed: enableThumbnailsChanged,
    },
    enableAutoplay: {
      state: enableAutoplayState,
      set: setEnableAutoplayState,
      changed: enableAutoplayChanged,
    },
    enableSkipCredits: {
      state: enableSkipCreditsState,
      set: setEnableSkipCreditsState,
      changed: enableSkipCreditsChanged,
    },
    enableDiscover: {
      state: enableDiscoverState,
      set: setEnableDiscoverState,
      changed: enableDiscoverChanged,
    },
    enableFeatured: {
      state: enableFeaturedState,
      set: setEnableFeaturedState,
      changed: enableFeaturedChanged,
    },
    enableDetailsModal: {
      state: enableDetailsModalState,
      set: setEnableDetailsModalState,
      changed: enableDetailsModalChanged,
    },
    enableImageLogos: {
      state: enableImageLogosState,
      set: setEnableImageLogosState,
      changed: enableImageLogosChanged,
    },
    sourceOrder: {
      state: sourceOrderState,
      set: setSourceOrderState,
      changed: sourceOrderChanged,
    },
    enableSourceOrder: {
      state: enableSourceOrderState,
      set: setEnableSourceOrderState,
      changed: enableSourceOrderChanged,
    },
    proxyTmdb: {
      state: proxyTmdbState,
      set: setProxyTmdbState,
      changed: proxyTmdbChanged,
    },
    enableCarouselView: {
      state: enableCarouselViewState,
      set: setEnableCarouselViewState,
      changed: enableCarouselViewChanged,
    },
    forceCompactEpisodeView: {
      state: forceCompactEpisodeViewState,
      set: setForceCompactEpisodeViewState,
      changed: forceCompactEpisodeViewChanged,
    },
    enableLowPerformanceMode: {
      state: enableLowPerformanceModeState,
      set: setEnableLowPerformanceModeState,
      changed: enableLowPerformanceModeChanged,
    },
  };
}
