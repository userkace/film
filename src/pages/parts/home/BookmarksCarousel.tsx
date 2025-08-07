import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { EditButton } from "@/components/buttons/EditButton";
import { EditButtonWithText } from "@/components/buttons/EditButtonWithText";
import { Item } from "@/components/form/SortableList";
import { Icon, Icons } from "@/components/Icon";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { WatchedMediaCard } from "@/components/media/WatchedMediaCard";
import { EditGroupOrderModal } from "@/components/overlays/EditGroupOrderModal";
import { useModal } from "@/components/overlays/Modal";
import { UserIcon, UserIcons } from "@/components/UserIcon";
import { Flare } from "@/components/utils/Flare";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CarouselNavButtons } from "@/pages/discover/components/CarouselNavButtons";
import { useAuthStore } from "@/stores/auth";
import { useBookmarkStore } from "@/stores/bookmarks";
import { useGroupOrderStore } from "@/stores/groupOrder";
import { useProgressStore } from "@/stores/progress";
import { MediaItem } from "@/utils/mediaTypes";

function parseGroupString(group: string): { icon: UserIcons; name: string } {
  const match = group.match(/^\[([a-zA-Z0-9_]+)\](.*)$/);
  if (match) {
    const iconKey = match[1].toUpperCase() as keyof typeof UserIcons;
    const icon = UserIcons[iconKey] || UserIcons.BOOKMARK;
    const name = match[2].trim();
    return { icon, name };
  }
  return { icon: UserIcons.BOOKMARK, name: group };
}

interface BookmarksCarouselProps {
  carouselRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null;
  }>;
  onShowDetails?: (media: MediaItem) => void;
}

const LONG_PRESS_DURATION = 500; // 0.5 seconds
const MAX_ITEMS_PER_SECTION = 20; // Limit items per section

function MediaCardSkeleton() {
  return (
    <div className="relative mt-4 group cursor-default user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto">
      <div className="animate-pulse">
        <div className="w-full aspect-[2/3] bg-mediaCard-hoverBackground rounded-lg" />
        <div className="mt-2 h-4 bg-mediaCard-hoverBackground rounded w-3/4" />
      </div>
    </div>
  );
}

function MoreBookmarksCard() {
  const { t } = useTranslation();

  return (
    <div className="relative mt-4 group cursor-pointer user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto">
      <Link to="/bookmarks" className="block">
        <Flare.Base className="group -m-[0.705em] h-[20rem] hover:scale-95 transition-all rounded-xl bg-background-main duration-300 hover:bg-mediaCard-hoverBackground tabbable">
          <Flare.Light
            flareSize={300}
            cssColorVar="--colors-mediaCard-hoverAccent"
            backgroundClass="bg-mediaCard-hoverBackground duration-100"
            className="rounded-xl bg-background-main group-hover:opacity-100"
          />
          <Flare.Child className="pointer-events-auto h-[20rem] relative mb-2 p-[0.4em] transition-transform duration-300">
            <div className="flex absolute inset-0 flex-col items-center justify-center">
              <Icon
                icon={Icons.ARROW_RIGHT}
                className="text-4xl mb-2 transition-transform duration-300"
              />
              <span className="text-sm text-center px-2">
                {t("home.bookmarks.showAll")}
              </span>
            </div>
          </Flare.Child>
        </Flare.Base>
      </Link>
    </div>
  );
}

export function BookmarksCarousel({
  carouselRefs,
  onShowDetails,
}: BookmarksCarouselProps) {
  const { t } = useTranslation();
  const browser = !!window.chrome;
  let isScrolling = false;
  const [editing, setEditing] = useState(false);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backendUrl = useBackendUrl();
  const account = useAuthStore((s) => s.account);

  // Create refs for overflow detection
  const groupedCarouselRefs = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});
  const regularCarouselRef = useRef<HTMLDivElement | null>(null);

  // Track overflow state for each section
  const [overflowStates, setOverflowStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Group order editing state
  const groupOrder = useGroupOrderStore((s) => s.groupOrder);
  const setGroupOrder = useGroupOrderStore((s) => s.setGroupOrder);
  const editOrderModal = useModal("bookmark-edit-order-carousel");
  const [tempGroupOrder, setTempGroupOrder] = useState<string[]>([]);

  const { isMobile } = useIsMobile();

  const bookmarksLength = useBookmarkStore(
    (state) => Object.keys(state.bookmarks).length,
  );

  const progressItems = useProgressStore((state) => state.items);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);

  const items = useMemo(() => {
    let output: MediaItem[] = [];
    Object.entries(bookmarks).forEach((entry) => {
      output.push({
        id: entry[0],
        ...entry[1],
      });
    });
    output = output.sort((a, b) => {
      const bookmarkA = bookmarks[a.id];
      const bookmarkB = bookmarks[b.id];
      const progressA = progressItems[a.id];
      const progressB = progressItems[b.id];

      const dateA = Math.max(bookmarkA.updatedAt, progressA?.updatedAt ?? 0);
      const dateB = Math.max(bookmarkB.updatedAt, progressB?.updatedAt ?? 0);

      return dateB - dateA;
    });
    return output;
  }, [bookmarks, progressItems]);

  const { groupedItems, regularItems } = useMemo(() => {
    const grouped: Record<string, MediaItem[]> = {};
    const regular: MediaItem[] = [];

    items.forEach((item) => {
      const bookmark = bookmarks[item.id];
      if (Array.isArray(bookmark?.group)) {
        bookmark.group.forEach((groupName) => {
          if (!grouped[groupName]) {
            grouped[groupName] = [];
          }
          grouped[groupName].push(item);
        });
      } else {
        regular.push(item);
      }
    });

    // Sort items within each group by date
    Object.keys(grouped).forEach((group) => {
      grouped[group].sort((a, b) => {
        const bookmarkA = bookmarks[a.id];
        const bookmarkB = bookmarks[b.id];
        const progressA = progressItems[a.id];
        const progressB = progressItems[b.id];

        const dateA = Math.max(bookmarkA.updatedAt, progressA?.updatedAt ?? 0);
        const dateB = Math.max(bookmarkB.updatedAt, progressB?.updatedAt ?? 0);

        return dateB - dateA;
      });
    });

    return { groupedItems: grouped, regularItems: regular };
  }, [items, bookmarks, progressItems]);

  // group sorting
  const allGroups = useMemo(() => {
    const groups = new Set<string>();

    Object.values(bookmarks).forEach((bookmark) => {
      if (Array.isArray(bookmark.group)) {
        bookmark.group.forEach((group) => groups.add(group));
      }
    });

    groups.add("bookmarks");

    return Array.from(groups);
  }, [bookmarks]);

  const sortableItems = useMemo(() => {
    const currentOrder = editOrderModal.isShown ? tempGroupOrder : groupOrder;

    if (currentOrder.length === 0) {
      return allGroups.map((group) => {
        const { name } = parseGroupString(group);
        return {
          id: group,
          name: group === "bookmarks" ? t("home.bookmarks.sectionTitle") : name,
        } as Item;
      });
    }

    const orderMap = new Map(
      currentOrder.map((group, index) => [group, index]),
    );
    const sortedGroups = allGroups.sort((groupA, groupB) => {
      const orderA = orderMap.has(groupA)
        ? orderMap.get(groupA)!
        : Number.MAX_SAFE_INTEGER;
      const orderB = orderMap.has(groupB)
        ? orderMap.get(groupB)!
        : Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    return sortedGroups.map((group) => {
      const { name } = parseGroupString(group);
      return {
        id: group,
        name: group === "bookmarks" ? t("home.bookmarks.sectionTitle") : name,
      } as Item;
    });
  }, [allGroups, t, editOrderModal.isShown, tempGroupOrder, groupOrder]);

  // Create a unified list of sections including both grouped and regular bookmarks
  const sortedSections = useMemo(() => {
    const sections: Array<{
      type: "grouped" | "regular";
      group?: string;
      items: MediaItem[];
    }> = [];

    // Create a combined map of all sections (grouped + regular)
    const allSections = new Map<string, MediaItem[]>();

    // Add grouped sections
    Object.entries(groupedItems).forEach(([group, groupItems]) => {
      allSections.set(group, groupItems);
    });

    // Add regular bookmarks as "bookmarks" group
    if (regularItems.length > 0) {
      allSections.set("bookmarks", regularItems);
    }

    // Sort sections based on group order
    if (groupOrder.length === 0) {
      // No order set, use default order
      allSections.forEach((sectionItems, group) => {
        if (group === "bookmarks") {
          sections.push({ type: "regular", items: sectionItems });
        } else {
          sections.push({ type: "grouped", group, items: sectionItems });
        }
      });
    } else {
      // Use the saved order
      const orderMap = new Map(
        groupOrder.map((group, index) => [group, index]),
      );

      Array.from(allSections.entries())
        .sort(([groupA], [groupB]) => {
          const orderA = orderMap.has(groupA)
            ? orderMap.get(groupA)!
            : Number.MAX_SAFE_INTEGER;
          const orderB = orderMap.has(groupB)
            ? orderMap.get(groupB)!
            : Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        })
        .forEach(([group, sectionItems]) => {
          if (group === "bookmarks") {
            sections.push({ type: "regular", items: sectionItems });
          } else {
            sections.push({ type: "grouped", group, items: sectionItems });
          }
        });
    }

    return sections;
  }, [groupedItems, regularItems, groupOrder]);
  // kill me

  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling) return;
    isScrolling = true;

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (browser) {
      setTimeout(() => {
        isScrolling = false;
      }, 345);
    } else {
      isScrolling = false;
    }
  };

  const handleLongPress = () => {
    // Find the button by ID and simulate a click
    const editButton = document.getElementById("edit-button-bookmark");
    if (editButton) {
      (editButton as HTMLButtonElement).click();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default touch action
    pressTimerRef.current = setTimeout(handleLongPress, LONG_PRESS_DURATION);
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger long press for left mouse button (button 0)
    if (e.button === 0) {
      e.preventDefault(); // Prevent default mouse action
      pressTimerRef.current = setTimeout(handleLongPress, LONG_PRESS_DURATION);
    }
  };

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleEditGroupOrder = () => {
    // Initialize with current order or default order
    if (groupOrder.length === 0) {
      const defaultOrder = allGroups.map((group) => group);
      setTempGroupOrder(defaultOrder);
    } else {
      setTempGroupOrder([...groupOrder]);
    }
    editOrderModal.show();
  };

  const handleReorderClick = () => {
    handleEditGroupOrder();
    // Keep editing state active by setting it to true
    setEditing(true);
  };

  const handleCancelOrder = () => {
    editOrderModal.hide();
  };

  const handleSaveOrderClick = () => {
    setGroupOrder(tempGroupOrder);
    editOrderModal.hide();

    // Save to backend
    if (backendUrl && account) {
      useGroupOrderStore
        .getState()
        .saveGroupOrderToBackend(backendUrl, account);
    }
  };

  // Function to check overflow for a carousel
  const checkOverflow = (element: HTMLDivElement | null, key: string) => {
    if (!element) {
      setOverflowStates((prev) => ({ ...prev, [key]: false }));
      return;
    }

    const hasOverflow = element.scrollWidth > element.clientWidth;
    setOverflowStates((prev) => ({ ...prev, [key]: hasOverflow }));
  };

  // Function to set carousel ref and check overflow
  const setCarouselRef = (element: HTMLDivElement | null, key: string) => {
    // Set the ref for the main carousel refs
    carouselRefs.current[key] = element;

    // Set the ref for overflow detection
    if (key === "bookmarks") {
      regularCarouselRef.current = element;
    } else {
      groupedCarouselRefs.current[key] = element;
    }

    // Check overflow after a short delay to ensure content is rendered
    setTimeout(() => checkOverflow(element, key), 100);
  };

  // Effect to recheck overflow on window resize
  useEffect(() => {
    const handleResize = () => {
      // Recheck overflow for all carousels
      Object.keys(carouselRefs.current).forEach((key) => {
        const element = carouselRefs.current[key];
        if (element) {
          checkOverflow(element, key);
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [carouselRefs]);

  const categorySlug = "bookmarks";
  const SKELETON_COUNT = 10;

  if (bookmarksLength === 0) return null;

  return (
    <>
      {/* Grouped Bookmarks Carousels */}
      {sortedSections.map((section) => {
        if (section.type === "grouped") {
          const { icon, name } = parseGroupString(section.group || "");
          return (
            <div key={section.group}>
              <SectionHeading
                title={name}
                customIcon={
                  <span className="w-6 h-6 flex items-center justify-center">
                    <UserIcon icon={icon} className="w-full h-full" />
                  </span>
                }
                className="ml-4 md:ml-12 mt-2 -mb-5"
              >
                <div className="mr-4 md:mr-8 flex items-center gap-2">
                  {editing && allGroups.length > 1 && (
                    <EditButtonWithText
                      editing={editing}
                      onEdit={handleReorderClick}
                      id="edit-group-order-button-carousel"
                      text={t("home.bookmarks.groups.reorder.button")}
                      secondaryText={t("home.bookmarks.groups.reorder.done")}
                    />
                  )}
                  <EditButton
                    editing={editing}
                    onEdit={setEditing}
                    id={`edit-button-bookmark-${section.group}`}
                  />
                </div>
              </SectionHeading>
              <div className="relative overflow-hidden carousel-container md:pb-4">
                <div
                  id={`carousel-${section.group}`}
                  className="grid grid-flow-col auto-cols-max gap-4 pt-0 overflow-x-scroll scrollbar-none rounded-xl overflow-y-hidden md:pl-8 md:pr-8"
                  ref={(el) => setCarouselRef(el, section.group || "bookmarks")}
                  onWheel={handleWheel}
                >
                  <div className="md:w-12" />

                  {section.items
                    .slice(0, MAX_ITEMS_PER_SECTION)
                    .map((media) => (
                      <div
                        key={media.id}
                        style={{ userSelect: "none" }}
                        onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                          e.preventDefault()
                        }
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        className="relative mt-4 group cursor-pointer user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto"
                      >
                        <WatchedMediaCard
                          key={media.id}
                          media={media}
                          onShowDetails={onShowDetails}
                          closable={editing}
                          onClose={() => removeBookmark(media.id)}
                        />
                      </div>
                    ))}

                  {section.items.length > MAX_ITEMS_PER_SECTION && (
                    <MoreBookmarksCard />
                  )}

                  <div className="md:w-12" />
                </div>

                {!isMobile && (
                  <CarouselNavButtons
                    categorySlug={section.group || "bookmarks"}
                    carouselRefs={carouselRefs}
                    hasOverflow={overflowStates[section.group || "bookmarks"]}
                  />
                )}
              </div>
            </div>
          );
        } // regular items
        return (
          <div key="regular-bookmarks">
            <SectionHeading
              title={t("home.bookmarks.sectionTitle")}
              icon={Icons.BOOKMARK}
              className="ml-4 md:ml-12 mt-2 -mb-5"
            >
              <div className="mr-4 md:mr-8 flex items-center gap-2">
                {editing && allGroups.length > 1 && (
                  <EditButtonWithText
                    editing={editing}
                    onEdit={handleReorderClick}
                    id="edit-group-order-button-carousel"
                    text={t("home.bookmarks.groups.reorder.button")}
                    secondaryText={t("home.bookmarks.groups.reorder.done")}
                  />
                )}
                <EditButton
                  editing={editing}
                  onEdit={setEditing}
                  id="edit-button-bookmark"
                />
              </div>
            </SectionHeading>
            <div className="relative overflow-hidden carousel-container md:pb-4">
              <div
                id={`carousel-${categorySlug}`}
                className="grid grid-flow-col auto-cols-max gap-4 pt-0 overflow-x-scroll scrollbar-none rounded-xl overflow-y-hidden md:pl-8 md:pr-8"
                ref={(el) => setCarouselRef(el, categorySlug)}
                onWheel={handleWheel}
              >
                <div className="md:w-12" />

                {section.items.length > 0
                  ? section.items
                      .slice(0, MAX_ITEMS_PER_SECTION)
                      .map((media) => (
                        <div
                          key={media.id}
                          style={{ userSelect: "none" }}
                          onContextMenu={(
                            e: React.MouseEvent<HTMLDivElement>,
                          ) => e.preventDefault()}
                          onTouchStart={handleTouchStart}
                          onTouchEnd={handleTouchEnd}
                          onMouseDown={handleMouseDown}
                          onMouseUp={handleMouseUp}
                          className="relative mt-4 group cursor-pointer user-select-none rounded-xl p-2 bg-transparent transition-colors duration-300 w-[10rem] md:w-[11.5rem] h-auto"
                        >
                          <WatchedMediaCard
                            key={media.id}
                            media={media}
                            onShowDetails={onShowDetails}
                            closable={editing}
                            onClose={() => removeBookmark(media.id)}
                          />
                        </div>
                      ))
                  : Array.from({ length: SKELETON_COUNT }).map(() => (
                      <MediaCardSkeleton
                        key={`skeleton-${categorySlug}-${Math.random().toString(36).substring(7)}`}
                      />
                    ))}

                {section.items.length > MAX_ITEMS_PER_SECTION && (
                  <MoreBookmarksCard />
                )}

                <div className="md:w-12" />
              </div>

              {!isMobile && (
                <CarouselNavButtons
                  categorySlug={categorySlug}
                  carouselRefs={carouselRefs}
                  hasOverflow={overflowStates[categorySlug]}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Edit Order Modal */}
      <EditGroupOrderModal
        id={editOrderModal.id}
        isShown={editOrderModal.isShown}
        items={sortableItems}
        onCancel={handleCancelOrder}
        onSave={handleSaveOrderClick}
        onItemsChange={(newItems) => {
          const newOrder = newItems.map((item) => item.id);
          setTempGroupOrder(newOrder);
        }}
      />
    </>
  );
}
