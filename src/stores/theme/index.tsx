import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface ThemeStore {
  theme: string | null;
  setTheme(v: string | null): void;
}

const currentDate = new Date();
const is420 = currentDate.getMonth() + 1 === 4 && currentDate.getDate() === 20;
const isHalloween =
  currentDate.getMonth() + 1 === 10 && currentDate.getDate() === 31;
// Make default theme green if its 4/20 (bc the marijauna plant is green :3)
// Make default theme autumn if its Halloween (spooky autumn vibes 🎃)
export const useThemeStore = create(
  persist(
    immer<ThemeStore>((set) => ({
      theme: is420 ? "green" : isHalloween ? "autumn" : null,
      setTheme(v) {
        set((s) => {
          s.theme = v;
        });
      },
    })),
    {
      name: "__MW::theme",
    },
  ),
);

export interface PreviewThemeStore {
  previewTheme: string | null;
  setPreviewTheme(v: string | null): void;
}

export const usePreviewThemeStore = create(
  immer<PreviewThemeStore>((set) => ({
    previewTheme: null,
    setPreviewTheme(v) {
      set((s) => {
        s.previewTheme = v;
      });
    },
  })),
);

export function ThemeProvider(props: {
  children?: ReactNode;
  applyGlobal?: boolean;
}) {
  const previewTheme = usePreviewThemeStore((s) => s.previewTheme);
  const theme = useThemeStore((s) => s.theme);

  const themeToDisplay = previewTheme ?? theme;
  const themeSelector = themeToDisplay ? `theme-${themeToDisplay}` : undefined;

  return (
    <div className={themeSelector}>
      {props.applyGlobal ? (
        <Helmet>
          <body className={themeSelector} />
        </Helmet>
      ) : null}
      {props.children}
    </div>
  );
}
