import { Icon, Icons } from "@/components/Icon";

import { SettingsViewProps } from "../types";

export function SettingsView({
  autoReadDays,
  setAutoReadDays,
  customFeeds,
  setCustomFeeds,
  markAllAsUnread,
  onClose,
}: SettingsViewProps) {
  const addCustomFeed = () => {
    setCustomFeeds([...customFeeds, ""]);
  };

  const changeCustomFeed = (index: number, val: string) => {
    setCustomFeeds(
      customFeeds.map((v, i) => {
        if (i !== index) return v;
        return val;
      }),
    );
  };

  const removeCustomFeed = (index: number) => {
    setCustomFeeds(customFeeds.filter((v, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3 pb-4 border-b border-utils-divider">
        <button
          type="button"
          onClick={onClose}
          className="text-type-link hover:text-type-linkHover transition-colors flex items-center gap-1 text-sm"
        >
          <Icon icon={Icons.CHEVRON_LEFT} />
          <span>Back to notifications</span>
        </button>
      </div>

      {/* Settings content */}
      <div className="space-y-6 overflow-y-auto max-h-[70vh] md:max-h-[60vh] md:pr-2">
        {/* Mark all as unread section */}
        <div className="bg-background-main/30 rounded-lg p-4 border border-utils-divider">
          <h3 className="text-white font-bold mb-3">Mark All as Unread</h3>
          <p className="text-sm text-type-secondary mb-4">
            Permanently mark all notifications as unread. This action cannot be
            undone.
          </p>
          <button
            type="button"
            onClick={markAllAsUnread}
            className="text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded-md border border-red-400/30 hover:border-red-400/50"
          >
            Mark All as Unread
          </button>
        </div>

        {/* Auto-read days section */}
        <div className="bg-background-main/30 rounded-lg p-4 border border-utils-divider">
          <h3 className="text-white font-bold mb-3">Auto-Mark as Read</h3>
          <p className="text-sm text-type-secondary mb-4">
            Automatically mark notifications as read after this many days.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="365"
              value={autoReadDays}
              onChange={(e) =>
                setAutoReadDays(parseInt(e.target.value, 10) || 14)
              }
              className="bg-background-secondary border border-type-secondary rounded px-3 py-2 text-white w-20"
            />
            <span className="text-sm text-type-secondary">days</span>
          </div>
        </div>

        {/* Custom feeds section */}
        <div className="bg-background-main/30 rounded-lg p-4 border border-utils-divider">
          <h3 className="text-white font-bold mb-3">Custom RSS Feeds</h3>
          <p className="text-sm text-type-secondary mb-4">
            Add custom RSS feeds to receive notifications from other sources.
            <br />
            <span className="text-sm text-type-danger">
              Note: This feature is experimental and may not work for all feeds.
            </span>
          </p>

          <div className="space-y-2 max-w-md">
            {customFeeds.length === 0 ? (
              <p className="text-sm text-type-secondary">
                No custom feeds added
              </p>
            ) : null}
            {customFeeds.map((feed, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="grid grid-cols-[1fr,auto] items-center gap-2"
              >
                <input
                  type="url"
                  value={feed}
                  onChange={(e) => changeCustomFeed(i, e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="bg-background-secondary border border-type-secondary rounded px-3 py-2 text-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeCustomFeed(i)}
                  className="h-full scale-90 hover:scale-100 rounded-full aspect-square bg-authentication-inputBg hover:bg-authentication-inputBgHover flex justify-center items-center transition-transform duration-200 hover:text-white cursor-pointer"
                >
                  <Icon className="text-xl" icon={Icons.X} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCustomFeed}
            className="mt-3 text-sm text-type-link hover:text-type-linkHover transition-colors px-3 py-1 rounded-md border border-type-link/30 hover:border-type-link/50"
          >
            Add Custom Feed
          </button>
        </div>

        {/* Recommended feeds section */}
        <div className="bg-background-main/30 rounded-lg p-4 border border-utils-divider">
          <h3 className="text-white font-bold mb-3">Recommended Feeds</h3>
          <code className="text-type-secondary text-xs md:text-sm">
            https://www.moviefone.com/feeds/movie-news.rss
            <br />
            https://www.moviefone.com/feeds/tv-news.rss
            <br />
            https://www.filmjabber.com/rss/rss-dvd-reviews.php
            <br />
            https://screenrant.com/feed/
            <br />
            https://www.darkhorizons.com/feed/
          </code>
        </div>
      </div>
    </div>
  );
}
