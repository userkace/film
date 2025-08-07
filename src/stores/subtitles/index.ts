import merge from "lodash.merge";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface SubtitleStyling {
  /**
   * Text color of subtitles, hex string
   */
  color: string;

  /**
   * size percentage, ranges between 0.01 and 2
   */
  size: number;

  /**
   * background opacity, ranges between 0 and 1
   */
  backgroundOpacity: number;

  /**
   * background blur, ranges between 0 and 1
   */
  backgroundBlur: number;

  /**
   * bold, boolean
   */
  bold: boolean;

  /**
   * vertical position percentage, ranges between 1 and 3 (rem)
   */
  verticalPosition: number;

  /**
   * font style for text rendering
   * "default" | "raised" | "depressed" | "uniform" | "dropShadow"
   */
  fontStyle: string;
}

export interface SubtitleStore {
  lastSync: {
    lastSelectedLanguage: string | null;
  };
  enabled: boolean;
  lastSelectedLanguage: string | null;
  isOpenSubtitles: boolean;
  styling: SubtitleStyling;
  overrideCasing: boolean;
  delay: number;
  showDelayIndicator: boolean;
  updateStyling(newStyling: Partial<SubtitleStyling>): void;
  resetStyling(): void;
  setLanguage(language: string | null): void;
  setIsOpenSubtitles(isOpenSubtitles: boolean): void;
  setCustomSubs(): void;
  setOverrideCasing(enabled: boolean): void;
  setDelay(delay: number): void;
  importSubtitleLanguage(lang: string | null): void;
  resetSubtitleSpecificSettings(): void;
  setShowDelayIndicator: (show: boolean) => void;
}

export const useSubtitleStore = create(
  persist(
    immer<SubtitleStore>((set) => ({
      enabled: false,
      lastSync: {
        lastSelectedLanguage: null,
      },
      lastSelectedLanguage: null,
      isOpenSubtitles: false,
      overrideCasing: false,
      delay: 0,
      styling: {
        color: "#ffffff",
        backgroundOpacity: 0.5,
        size: 1,
        backgroundBlur: 0.5,
        bold: false,
        verticalPosition: 3,
        fontStyle: "default",
      },
      showDelayIndicator: false,
      resetSubtitleSpecificSettings() {
        set((s) => {
          s.delay = 0;
          s.overrideCasing = false;
        });
      },
      updateStyling(newStyling) {
        set((s) => {
          if (newStyling.backgroundOpacity !== undefined)
            s.styling.backgroundOpacity = Math.min(
              1,
              Math.max(0, newStyling.backgroundOpacity),
            );
          if (newStyling.backgroundBlur !== undefined)
            s.styling.backgroundBlur = Math.min(
              1,
              Math.max(0, newStyling.backgroundBlur),
            );
          if (newStyling.color !== undefined)
            s.styling.color = newStyling.color.toLowerCase();
          if (newStyling.size !== undefined)
            s.styling.size = Math.min(10, Math.max(0.01, newStyling.size));
          if (newStyling.bold !== undefined) s.styling.bold = newStyling.bold;
          if (newStyling.verticalPosition !== undefined)
            s.styling.verticalPosition = Math.min(
              100,
              Math.max(0, newStyling.verticalPosition),
            );
          if (newStyling.fontStyle !== undefined)
            s.styling.fontStyle = newStyling.fontStyle;
        });
      },
      resetStyling() {
        set((s) => {
          s.styling = {
            color: "#ffffff",
            backgroundOpacity: 0.5,
            size: 1,
            backgroundBlur: 0.5,
            bold: false,
            verticalPosition: 3,
            fontStyle: "default",
          };
        });
      },
      setLanguage(lang) {
        set((s) => {
          s.enabled = !!lang;
          if (lang) s.lastSelectedLanguage = lang;
        });
      },
      setIsOpenSubtitles(isOpenSubtitles) {
        set((s) => {
          s.isOpenSubtitles = isOpenSubtitles;
        });
      },
      setCustomSubs() {
        set((s) => {
          s.enabled = true;
          s.lastSelectedLanguage = null;
        });
      },
      setOverrideCasing(enabled) {
        set((s) => {
          s.overrideCasing = enabled;
        });
      },
      setDelay(delay) {
        set((s) => {
          s.delay = Math.max(Math.min(500, delay), -500);
        });
      },
      importSubtitleLanguage(lang) {
        set((s) => {
          s.lastSelectedLanguage = lang;
          s.lastSync.lastSelectedLanguage = lang;
        });
      },
      setShowDelayIndicator(show: boolean) {
        set((s) => {
          s.showDelayIndicator = show;
        });
      },
    })),
    {
      name: "__MW::subtitles",
      merge: (persisted, current) => merge({}, current, persisted),
    },
  ),
);
