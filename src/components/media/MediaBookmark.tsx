import { useCallback, useMemo } from "react";

import { Icons } from "@/components/Icon";
import { useBookmarkStore } from "@/stores/bookmarks";
import { PlayerMeta } from "@/stores/player/slices/source";
import { MediaItem } from "@/utils/mediaTypes";

import { IconPatch } from "../buttons/IconPatch";

interface MediaBookmarkProps {
  media: MediaItem;
  group?: string[];
}

export function MediaBookmarkButton({ media, group }: MediaBookmarkProps) {
  const addBookmark = useBookmarkStore((s) => s.addBookmark);
  const addBookmarkWithGroups = useBookmarkStore(
    (s) => s.addBookmarkWithGroups,
  );
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const meta: PlayerMeta | undefined = useMemo(() => {
    return media.year !== undefined
      ? {
          type: media.type,
          title: media.title,
          tmdbId: media.id,
          releaseYear: media.year,
          poster: media.poster,
        }
      : undefined;
  }, [media]);
  const isBookmarked = !!bookmarks[meta?.tmdbId ?? ""];

  const toggleBookmark = useCallback(() => {
    if (!meta) return;
    if (isBookmarked) removeBookmark(meta.tmdbId);
    else if (group && group.length > 0) addBookmarkWithGroups(meta, group);
    else addBookmark(meta);
  }, [
    isBookmarked,
    meta,
    addBookmark,
    addBookmarkWithGroups,
    removeBookmark,
    group,
  ]);

  const buttonOpacityClass =
    media.year === undefined ? "hover:opacity-100" : "hover:opacity-95";

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
      }}
    >
      <IconPatch
        icon={isBookmarked ? Icons.BOOKMARK : Icons.BOOKMARK_OUTLINE}
        className={`${buttonOpacityClass} p-2 opacity-75 transition-opacity duration-300 hover:scale-110 hover:cursor-pointer`}
      />
    </div>
  );
}
