import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { EditButton } from "@/components/buttons/EditButton";
import { EditButtonWithText } from "@/components/buttons/EditButtonWithText";
import { Item } from "@/components/form/SortableList";
import { Icons } from "@/components/Icon";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { MediaGrid } from "@/components/media/MediaGrid";
import { WatchedMediaCard } from "@/components/media/WatchedMediaCard";
import { EditGroupOrderModal } from "@/components/overlays/EditGroupOrderModal";
import { useModal } from "@/components/overlays/Modal";
import { UserIcon, UserIcons } from "@/components/UserIcon";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
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

const LONG_PRESS_DURATION = 700; // 0.7 seconds

export function BookmarksPart({
  onItemsChange,
  onShowDetails,
}: {
  onItemsChange: (hasItems: boolean) => void;
  onShowDetails?: (media: MediaItem) => void;
}) {
  const { t } = useTranslation();
  const progressItems = useProgressStore((s) => s.items);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const groupOrder = useGroupOrderStore((s) => s.groupOrder);
  const setGroupOrder = useGroupOrderStore((s) => s.setGroupOrder);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const [editing, setEditing] = useState(false);
  const [gridRef] = useAutoAnimate<HTMLDivElement>();
  const editOrderModal = useModal("bookmark-edit-order");
  const [tempGroupOrder, setTempGroupOrder] = useState<string[]>([]);
  const backendUrl = useBackendUrl();
  const account = useAuthStore((s) => s.account);

  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const sortedSections = useMemo(() => {
    const sections: Array<{
      type: "grouped" | "regular";
      group?: string;
      items: MediaItem[];
    }> = [];

    const allSections = new Map<string, MediaItem[]>();

    Object.entries(groupedItems).forEach(([group, groupItems]) => {
      allSections.set(group, groupItems);
    });

    if (regularItems.length > 0) {
      allSections.set("bookmarks", regularItems);
    }

    if (groupOrder.length === 0) {
      allSections.forEach((sectionItems, group) => {
        if (group === "bookmarks") {
          sections.push({ type: "regular", items: sectionItems });
        } else {
          sections.push({ type: "grouped", group, items: sectionItems });
        }
      });
    } else {
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

  useEffect(() => {
    onItemsChange(items.length > 0);
  }, [items, onItemsChange]);

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
    e.preventDefault(); // Prevent default mouse action
    pressTimerRef.current = setTimeout(handleLongPress, LONG_PRESS_DURATION);
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

  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* Grouped Bookmarks */}
      {sortedSections.map((section) => {
        if (section.type === "grouped") {
          const { icon, name } = parseGroupString(section.group || "");
          return (
            <div key={section.group || "bookmarks"} className="mb-6">
              <SectionHeading
                title={name}
                customIcon={
                  <span className="w-6 h-6 flex items-center justify-center">
                    <UserIcon icon={icon} className="w-full h-full" />
                  </span>
                }
              >
                <div className="flex items-center gap-2">
                  {editing && allGroups.length > 1 && (
                    <EditButtonWithText
                      editing={editing}
                      onEdit={handleReorderClick}
                      id="edit-group-order-button"
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
              <MediaGrid>
                {section.items.map((v) => (
                  <div
                    key={v.id}
                    style={{ userSelect: "none" }}
                    onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                      e.preventDefault()
                    }
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                  >
                    <WatchedMediaCard
                      media={v}
                      closable={editing}
                      onClose={() => removeBookmark(v.id)}
                      onShowDetails={onShowDetails}
                    />
                  </div>
                ))}
              </MediaGrid>
            </div>
          );
        } // regular items
        return (
          <div key="regular-bookmarks" className="mb-6">
            <SectionHeading
              title={t("home.bookmarks.sectionTitle")}
              icon={Icons.BOOKMARK}
            >
              <div className="flex items-center gap-2">
                {editing && allGroups.length > 1 && (
                  <EditButtonWithText
                    editing={editing}
                    onEdit={handleReorderClick}
                    id="edit-group-order-button"
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
            <MediaGrid ref={gridRef}>
              {section.items.map((v) => (
                <div
                  key={v.id}
                  style={{ userSelect: "none" }}
                  onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
                    e.preventDefault()
                  }
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                >
                  <WatchedMediaCard
                    media={v}
                    closable={editing}
                    onClose={() => removeBookmark(v.id)}
                    onShowDetails={onShowDetails}
                  />
                </div>
              ))}
            </MediaGrid>
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
    </div>
  );
}
