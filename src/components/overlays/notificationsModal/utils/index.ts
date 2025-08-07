import { proxiedFetch } from "@/backend/helpers/fetch";

const DEFAULT_FEEDS = ["/notifications.xml"];

export const getAllFeeds = (): string[] => {
  try {
    const savedCustomFeeds = localStorage.getItem("notification-custom-feeds");
    if (savedCustomFeeds) {
      const customFeeds = JSON.parse(savedCustomFeeds);
      return [...DEFAULT_FEEDS, ...customFeeds];
    }
  } catch (e) {
    // Silently fail and return default feeds
  }
  return DEFAULT_FEEDS;
};

export const getFetchUrl = (feedUrl: string): string => {
  if (feedUrl.startsWith("/")) {
    return feedUrl;
  }
  return feedUrl;
};

// New function to fetch RSS feeds using proxiedFetch
export const fetchRssFeed = async (feedUrl: string): Promise<string> => {
  if (feedUrl.startsWith("/")) {
    // For local feeds, use regular fetch
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  }
  // For external feeds, use proxiedFetch
  const response = await proxiedFetch(feedUrl, {
    responseType: "text",
  });
  return response as string;
};

export const getSourceName = (feedUrl: string): string => {
  if (feedUrl === "/notifications.xml") {
    return "P-Stream";
  }

  try {
    const url = new URL(feedUrl);
    return url.hostname.replace("www.", "");
  } catch {
    return "Unknown";
  }
};

const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes === 0) {
        return "just now";
      }
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }
  if (diffInDays === 1) {
    return "1 day ago";
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months !== 1 ? "s" : ""} ago`;
  }
  const years = Math.floor(diffInDays / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const relativeTime = getRelativeTimeString(date);
    return `${formattedDate} • ${relativeTime}`;
  } catch {
    return dateString;
  }
};

export const getCategoryColor = (category: string) => {
  if (!category || category.trim() === "") {
    return "";
  }

  switch (category.toLowerCase()) {
    case "announcement":
      return "bg-blue-500";
    case "feature":
      return "bg-green-500";
    case "update":
      return "bg-yellow-500";
    case "bugfix":
      return "bg-red-500";
    default:
      return "";
  }
};

export const getCategoryLabel = (category: string) => {
  switch (category.toLowerCase()) {
    case "announcement":
      return "Announcement";
    case "feature":
      return "New Feature";
    case "update":
      return "Update";
    case "bugfix":
      return "Bug Fix";
    default:
      return category;
  }
};
export function formatNotificationDescription(description: string): string {
  return (
    description
      // First, normalize multiple consecutive line breaks to single line breaks
      .replace(/\n{3,}/g, "\n\n")
      // Handle bullet points before paragraph breaks
      .replace(/\n- /g, "</p><p>• ")
      // Handle bold text (headers)
      .replace(/\n\*\*([^*]+)\*\*/g, "</p><h4>$1</h4><p>")
      // Handle paragraph breaks (double line breaks)
      .replace(/\n\n/g, "</p><br /><p>")
      // Handle single line breaks within paragraphs
      .replace(/\n/g, "<br />")
      // Wrap in paragraph tags
      .replace(/^/, "<p>")
      .replace(/$/, "</p>")
      // Remove empty paragraphs
      .replace(/<p><\/p>/g, "")
      // Clean up consecutive paragraph tags
      .replace(/<\/p><p><\/p>/g, "</p>")
      .replace(/<p><\/p><p>/g, "<p>")
      // Style bullet points
      .replace(
        /<p>• /g,
        '<p class="flex items-start gap-2"><span class="text-type-link mt-1">•</span><span>',
      )
      .replace(/<\/p>/g, "</span></p>")
  );
}
