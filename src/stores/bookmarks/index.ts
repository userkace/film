import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { PlayerMeta } from "@/stores/player/slices/source";

export interface BookmarkMediaItem {
  title: string;
  year?: number;
  poster?: string;
  type: "show" | "movie";
  updatedAt: number;
  group?: string[];
  favoriteEpisodes?: string[];
}

export interface BookmarkUpdateItem {
  tmdbId: string;
  title?: string;
  year?: number;
  id: string;
  poster?: string;
  type?: "show" | "movie";
  group?: string[];
  favoriteEpisodes?: string[];
  action: "delete" | "add";
}

export interface BookmarkStore {
  bookmarks: Record<string, BookmarkMediaItem>;
  updateQueue: BookmarkUpdateItem[];
  addBookmark(meta: PlayerMeta): void;
  addBookmarkWithGroups(meta: PlayerMeta, groups?: string[]): void;
  removeBookmark(id: string): void;
  replaceBookmarks(items: Record<string, BookmarkMediaItem>): void;
  toggleFavoriteEpisode(
    showId: string,
    episodeId: string,
    showMeta?: { title: string; poster?: string; year?: number },
  ): void;
  isEpisodeFavorited(showId: string, episodeId: string): boolean;
  getFavoriteEpisodes(showId: string): string[];
  clear(): void;
  clearUpdateQueue(): void;
  removeUpdateItem(id: string): void;
}

let updateId = 0;

export const useBookmarkStore = create(
  persist(
    immer<BookmarkStore>((set) => ({
      bookmarks: {},
      updateQueue: [],
      removeBookmark(id) {
        set((s) => {
          updateId += 1;
          s.updateQueue.push({
            id: updateId.toString(),
            action: "delete",
            tmdbId: id,
          });

          delete s.bookmarks[id];
        });
      },
      addBookmark(meta) {
        set((s) => {
          updateId += 1;
          s.updateQueue.push({
            id: updateId.toString(),
            action: "add",
            tmdbId: meta.tmdbId,
            type: meta.type,
            title: meta.title,
            year: meta.releaseYear,
            poster: meta.poster,
          });

          s.bookmarks[meta.tmdbId] = {
            type: meta.type,
            title: meta.title,
            year: meta.releaseYear,
            poster: meta.poster,
            updatedAt: Date.now(),
          };
        });
      },
      addBookmarkWithGroups(meta, groups) {
        set((s) => {
          updateId += 1;
          s.updateQueue.push({
            id: updateId.toString(),
            action: "add",
            tmdbId: meta.tmdbId,
            type: meta.type,
            title: meta.title,
            year: meta.releaseYear,
            poster: meta.poster,
            group: groups,
          });

          s.bookmarks[meta.tmdbId] = {
            type: meta.type,
            title: meta.title,
            year: meta.releaseYear,
            poster: meta.poster,
            updatedAt: Date.now(),
            group: groups,
          };
        });
      },
      replaceBookmarks(items: Record<string, BookmarkMediaItem>) {
        set((s) => {
          s.bookmarks = items;
        });
      },
      clear() {
        set((s) => {
          s.bookmarks = {};
        });
      },
      clearUpdateQueue() {
        set((s) => {
          s.updateQueue = [];
        });
      },
      removeUpdateItem(id: string) {
        set((s) => {
          s.updateQueue = [...s.updateQueue.filter((v) => v.id !== id)];
        });
      },
      toggleFavoriteEpisode(
        showId: string,
        episodeId: string,
        showMeta?: { title: string; poster?: string; year?: number },
      ) {
        set((s) => {
          if (!s.bookmarks[showId]) {
            // If the show is not bookmarked, create a basic bookmark first
            // We'll need to get the show metadata from the player store or pass it in
            s.bookmarks[showId] = {
              title: showMeta?.title || "Unknown Show",
              type: "show",
              poster: showMeta?.poster,
              year: showMeta?.year,
              updatedAt: Date.now(),
              favoriteEpisodes: [],
            };
          }

          const bookmark = s.bookmarks[showId];
          if (!bookmark.favoriteEpisodes) {
            bookmark.favoriteEpisodes = [];
          }

          const episodeIndex = bookmark.favoriteEpisodes.indexOf(episodeId);
          if (episodeIndex > -1) {
            // Remove from favorites
            bookmark.favoriteEpisodes.splice(episodeIndex, 1);
          } else {
            // Add to favorites
            bookmark.favoriteEpisodes.push(episodeId);
          }

          bookmark.updatedAt = Date.now();

          // Add to update queue for syncing
          updateId += 1;
          s.updateQueue.push({
            id: updateId.toString(),
            action: "add",
            tmdbId: showId,
            favoriteEpisodes: bookmark.favoriteEpisodes,
          });
        });
      },
      isEpisodeFavorited(showId: string, episodeId: string): boolean {
        const state = useBookmarkStore.getState();
        const bookmark = state.bookmarks[showId];
        const isFavorited =
          bookmark?.favoriteEpisodes?.includes(episodeId) ?? false;
        return isFavorited;
      },
      getFavoriteEpisodes(showId: string): string[] {
        const bookmark = useBookmarkStore.getState().bookmarks[showId];
        return bookmark?.favoriteEpisodes ?? [];
      },
    })),
    {
      name: "__MW::bookmarks",
    },
  ),
);
