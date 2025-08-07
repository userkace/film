import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface PreferencesStore {
  enableThumbnails: boolean;
  enableAutoplay: boolean;
  enableSkipCredits: boolean;
  enableDiscover: boolean;
  enableFeatured: boolean;
  enableDetailsModal: boolean;
  enableImageLogos: boolean;
  enableCarouselView: boolean;
  forceCompactEpisodeView: boolean;
  sourceOrder: string[];
  enableSourceOrder: boolean;
  proxyTmdb: boolean;
  febboxKey: string | null;
  realDebridKey: string | null;
  enableLowPerformanceMode: boolean;
  enableNativeSubtitles: boolean;

  setEnableThumbnails(v: boolean): void;
  setEnableAutoplay(v: boolean): void;
  setEnableSkipCredits(v: boolean): void;
  setEnableDiscover(v: boolean): void;
  setEnableFeatured(v: boolean): void;
  setEnableDetailsModal(v: boolean): void;
  setEnableImageLogos(v: boolean): void;
  setEnableCarouselView(v: boolean): void;
  setForceCompactEpisodeView(v: boolean): void;
  setSourceOrder(v: string[]): void;
  setEnableSourceOrder(v: boolean): void;
  setProxyTmdb(v: boolean): void;
  setFebboxKey(v: string | null): void;
  setRealDebridKey(v: string | null): void;
  setEnableLowPerformanceMode(v: boolean): void;
  setEnableNativeSubtitles(v: boolean): void;
}

export const usePreferencesStore = create(
  persist(
    immer<PreferencesStore>((set) => ({
      enableThumbnails: false,
      enableAutoplay: true,
      enableSkipCredits: true,
      enableDiscover: true,
      enableFeatured: false,
      enableDetailsModal: false,
      enableImageLogos: true,
      enableCarouselView: false,
      forceCompactEpisodeView: false,
      sourceOrder: [],
      enableSourceOrder: false,
      proxyTmdb: false,
      febboxKey: null,
      realDebridKey: null,
      enableLowPerformanceMode: false,
      enableNativeSubtitles: false,
      setEnableThumbnails(v) {
        set((s) => {
          s.enableThumbnails = v;
        });
      },
      setEnableAutoplay(v) {
        set((s) => {
          s.enableAutoplay = v;
        });
      },
      setEnableSkipCredits(v) {
        set((s) => {
          s.enableSkipCredits = v;
        });
      },
      setEnableDiscover(v) {
        set((s) => {
          s.enableDiscover = v;
        });
      },
      setEnableFeatured(v) {
        set((s) => {
          s.enableFeatured = v;
        });
      },
      setEnableDetailsModal(v) {
        set((s) => {
          s.enableDetailsModal = v;
        });
      },
      setEnableImageLogos(v) {
        set((s) => {
          s.enableImageLogos = v;
        });
      },
      setEnableCarouselView(v) {
        set((s) => {
          s.enableCarouselView = v;
        });
      },
      setForceCompactEpisodeView(v) {
        set((s) => {
          s.forceCompactEpisodeView = v;
        });
      },
      setSourceOrder(v) {
        set((s) => {
          s.sourceOrder = v;
        });
      },
      setEnableSourceOrder(v) {
        set((s) => {
          s.enableSourceOrder = v;
        });
      },
      setProxyTmdb(v) {
        set((s) => {
          s.proxyTmdb = v;
        });
      },
      setFebboxKey(v) {
        set((s) => {
          s.febboxKey = v;
        });
      },
      setRealDebridKey(v) {
        set((s) => {
          s.realDebridKey = v;
        });
      },
      setEnableLowPerformanceMode(v) {
        set((s) => {
          s.enableLowPerformanceMode = v;
        });
      },
      setEnableNativeSubtitles(v) {
        set((s) => {
          s.enableNativeSubtitles = v;
        });
      },
    })),
    {
      name: "__MW::preferences",
    },
  ),
);
