import { useCallback, useEffect, useRef, useState } from "react";

import { Icon, Icons } from "@/components/Icon";

import { DetailView } from "./DetailView";
import { ListView } from "./ListView";
import { SettingsView } from "./SettingsView";
import { FancyModal } from "../../Modal";
import { ModalView, NotificationItem, NotificationModalProps } from "../types";
import {
  fetchRssFeed,
  formatDate,
  getAllFeeds,
  getCategoryColor,
  getCategoryLabel,
  getSourceName,
} from "../utils";

export function NotificationModal({ id }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(
    new Set(),
  );
  const [currentView, setCurrentView] = useState<ModalView>("list");
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Settings state
  const [autoReadDays, setAutoReadDays] = useState<number>(14);
  const [customFeeds, setCustomFeeds] = useState<string[]>([]);

  // Load read notifications and settings from localStorage
  useEffect(() => {
    const savedRead = localStorage.getItem("read-notifications");
    if (savedRead) {
      try {
        const readArray = JSON.parse(savedRead);
        setReadNotifications(new Set(readArray));
      } catch (e) {
        console.error("Failed to parse read notifications:", e);
      }
    }

    // Load settings
    const savedAutoReadDays = localStorage.getItem(
      "notification-auto-read-days",
    );
    if (savedAutoReadDays) {
      try {
        setAutoReadDays(parseInt(savedAutoReadDays, 10));
      } catch (e) {
        console.error("Failed to parse auto read days:", e);
      }
    }

    const savedCustomFeeds = localStorage.getItem("notification-custom-feeds");
    if (savedCustomFeeds) {
      try {
        setCustomFeeds(JSON.parse(savedCustomFeeds));
      } catch (e) {
        console.error("Failed to parse custom feeds:", e);
      }
    }
  }, []);

  // Handle shift key for mark all as unread button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftHeld(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Fetch RSS feed function
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allNotifications: NotificationItem[] = [];
      const autoReadGuids: string[] = [];

      // Mark notifications older than autoReadDays as read
      const autoReadDate = new Date();
      autoReadDate.setDate(autoReadDate.getDate() - autoReadDays);

      // Get all feeds (default + custom)
      const feeds = getAllFeeds();

      // Fetch from all feeds
      for (const feedUrl of feeds) {
        if (!feedUrl.trim()) continue;

        try {
          const xmlText = await fetchRssFeed(feedUrl);

          // Basic validation that we got XML content
          if (
            xmlText &&
            (xmlText.includes("<rss") || xmlText.includes("<feed"))
          ) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            // Check for parsing errors
            const parserError = xmlDoc.querySelector("parsererror");
            if (!parserError && xmlDoc && xmlDoc.documentElement) {
              // Handle both RSS (item) and Atom (entry) feeds
              const items = xmlDoc.querySelectorAll("item, entry");
              if (items && items.length > 0) {
                items.forEach((item) => {
                  try {
                    // Handle both RSS and Atom formats
                    const guid =
                      item.querySelector("guid")?.textContent ||
                      item.querySelector("id")?.textContent ||
                      "";
                    const title =
                      item.querySelector("title")?.textContent || "";
                    const link =
                      item.querySelector("link")?.textContent ||
                      item.querySelector("link")?.getAttribute("href") ||
                      "";
                    const description =
                      item.querySelector("description")?.textContent ||
                      item.querySelector("content")?.textContent ||
                      item.querySelector("summary")?.textContent ||
                      "";
                    const pubDate =
                      item.querySelector("pubDate")?.textContent ||
                      item.querySelector("published")?.textContent ||
                      item.querySelector("updated")?.textContent ||
                      "";
                    const category =
                      item.querySelector("category")?.textContent || "";

                    // Skip items without essential data
                    // Use link as fallback for guid if guid is missing
                    const itemGuid = guid || link;
                    if (!itemGuid || !title) {
                      return;
                    }

                    // Parse the publication date
                    const notificationDate = new Date(pubDate);

                    allNotifications.push({
                      guid: itemGuid,
                      title,
                      link,
                      description,
                      pubDate,
                      category,
                      source: getSourceName(feedUrl),
                    });

                    // Collect GUIDs of notifications older than autoReadDays
                    if (notificationDate <= autoReadDate) {
                      autoReadGuids.push(itemGuid);
                    }
                  } catch (itemError) {
                    // Skip malformed items
                    console.warn(
                      "Skipping malformed RSS/Atom item:",
                      itemError,
                    );
                  }
                });
              }
            }
          }
        } catch (customFeedError) {
          // Silently fail for individual feed errors
        }
      }

      setNotifications(allNotifications);

      // Update read notifications after setting notifications
      if (autoReadGuids.length > 0) {
        setReadNotifications((prevReadSet) => {
          const newReadSet = new Set(prevReadSet);
          autoReadGuids.forEach((guid) => newReadSet.add(guid));

          // Update localStorage
          localStorage.setItem(
            "read-notifications",
            JSON.stringify(Array.from(newReadSet)),
          );

          return newReadSet;
        });
      }
    } catch (err) {
      console.error("RSS fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load notifications",
      );
      // Set empty notifications to prevent crashes
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [autoReadDays]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refresh function
  const handleRefresh = () => {
    fetchNotifications();
  };

  // Save read notifications to cookie
  const markAsRead = (guid: string) => {
    const newReadSet = new Set(readNotifications);
    newReadSet.add(guid);
    setReadNotifications(newReadSet);

    // Save to localStorage
    localStorage.setItem(
      "read-notifications",
      JSON.stringify(Array.from(newReadSet)),
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    const allGuids = notifications.map((n) => n.guid);
    const newReadSet = new Set(allGuids);
    setReadNotifications(newReadSet);
    localStorage.setItem(
      "read-notifications",
      JSON.stringify(Array.from(newReadSet)),
    );
  };

  // Mark all as unread
  const markAllAsUnread = () => {
    setReadNotifications(new Set());
    localStorage.setItem("read-notifications", JSON.stringify([]));
  };

  // Navigate to detail view
  const openNotificationDetail = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setCurrentView("detail");
    markAsRead(notification.guid);
  };

  // Navigate back to list
  const goBackToList = () => {
    setCurrentView("list");
    setSelectedNotification(null);
  };

  // Settings functions
  const openSettings = () => {
    setCurrentView("settings");
  };

  const closeSettings = () => {
    setCurrentView("list");
  };

  // Save settings functions
  const saveAutoReadDays = (days: number) => {
    setAutoReadDays(days);
    localStorage.setItem("notification-auto-read-days", days.toString());
  };

  const saveCustomFeeds = (feeds: string[]) => {
    setCustomFeeds(feeds);
    localStorage.setItem("notification-custom-feeds", JSON.stringify(feeds));
  };

  // Scroll to last read notification
  useEffect(() => {
    if (
      notifications.length > 0 &&
      containerRef.current &&
      currentView === "list"
    ) {
      const lastReadIndex = notifications.findIndex(
        (n) => !readNotifications.has(n.guid),
      );
      if (lastReadIndex > 0) {
        const element = containerRef.current.children[
          lastReadIndex
        ] as HTMLElement;
        if (element) {
          // Use scrollTop instead of scrollIntoView to avoid scrolling the modal container
          const container = containerRef.current;
          const elementTop = element.offsetTop;
          const containerHeight = container.clientHeight;
          const elementHeight = element.clientHeight;

          // Calculate the scroll position to center the element
          const scrollTop =
            elementTop - containerHeight / 2 + elementHeight / 2;

          container.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: "smooth",
          });
        }
      }
    }
  }, [notifications, readNotifications, currentView]);

  const unreadCount = notifications.filter(
    (n) => !readNotifications.has(n.guid),
  ).length;

  // Don't render if there's a critical error
  if (error && !loading) {
    return (
      <FancyModal id={id} title="Notifications" size="lg">
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Icon icon={Icons.WARNING} className="text-[2rem] text-red-400" />
          <p className="text-red-400 mb-2">Failed to load notifications</p>
          <p className="text-sm text-type-secondary">{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 text-sm text-type-link hover:text-type-linkHover transition-colors"
          >
            Try again
          </button>
        </div>
      </FancyModal>
    );
  }

  return (
    <FancyModal
      id={id}
      title={
        currentView === "list"
          ? "Notifications"
          : currentView === "detail" && selectedNotification
            ? selectedNotification.title
            : currentView === "settings"
              ? "Settings"
              : "Notifications"
      }
      size="lg"
    >
      {currentView === "list" ? (
        <ListView
          notifications={notifications}
          readNotifications={readNotifications}
          unreadCount={unreadCount}
          loading={loading}
          error={error}
          containerRef={containerRef}
          markAllAsRead={markAllAsRead}
          markAllAsUnread={markAllAsUnread}
          isShiftHeld={isShiftHeld}
          onRefresh={handleRefresh}
          onOpenSettings={openSettings}
          openNotificationDetail={openNotificationDetail}
          getCategoryColor={getCategoryColor}
          getCategoryLabel={getCategoryLabel}
          formatDate={formatDate}
        />
      ) : currentView === "detail" && selectedNotification ? (
        <DetailView
          selectedNotification={selectedNotification}
          goBackToList={goBackToList}
          getCategoryColor={getCategoryColor}
          getCategoryLabel={getCategoryLabel}
          formatDate={formatDate}
          isRead={readNotifications.has(selectedNotification.guid)}
          toggleReadStatus={() => {
            if (readNotifications.has(selectedNotification.guid)) {
              // Mark as unread
              const newReadSet = new Set(readNotifications);
              newReadSet.delete(selectedNotification.guid);
              setReadNotifications(newReadSet);
              localStorage.setItem(
                "read-notifications",
                JSON.stringify(Array.from(newReadSet)),
              );
            } else {
              // Mark as read
              markAsRead(selectedNotification.guid);
            }
          }}
        />
      ) : currentView === "settings" ? (
        <SettingsView
          autoReadDays={autoReadDays}
          setAutoReadDays={saveAutoReadDays}
          customFeeds={customFeeds}
          setCustomFeeds={saveCustomFeeds}
          markAllAsUnread={markAllAsUnread}
          onClose={closeSettings}
        />
      ) : null}
    </FancyModal>
  );
}
