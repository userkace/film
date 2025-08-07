import { create } from "zustand";
import { persist } from "zustand/middleware";

type Category = "movies" | "tvshows" | "editorpicks";

interface DiscoverView {
  url: string;
  scrollPosition: number;
}

interface DiscoverState {
  selectedCategory: Category;
  lastView: DiscoverView | null;
  setSelectedCategory: (category: Category) => void;
  setLastView: (view: DiscoverView) => void;
  clearLastView: () => void;
}

export const useDiscoverStore = create<DiscoverState>()(
  persist(
    (set) => ({
      selectedCategory: "movies",
      lastView: null,
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setLastView: (view) => set({ lastView: view }),
      clearLastView: () => set({ lastView: null }),
    }),
    {
      name: "__MW::discover",
    },
  ),
);
