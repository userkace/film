import { Icon, Icons } from "@/components/Icon";

import { ListViewProps } from "../types";
import { formatNotificationDescription } from "../utils";

export function ListView({
  notifications,
  readNotifications,
  unreadCount,
  loading,
  error,
  containerRef,
  markAllAsRead,
  markAllAsUnread,
  isShiftHeld,
  onRefresh,
  onOpenSettings,
  openNotificationDetail,
  getCategoryColor,
  getCategoryLabel,
  formatDate,
}: ListViewProps) {
  return (
    <div className="space-y-4">
      {/* Header with refresh and mark all buttons */}
      <div className="flex gap-4 items-center pb-4 border-b border-utils-divider">
        <div className="flex flex-col md:flex-row justify-start md:gap-2">
          <span className="text-sm text-type-secondary">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            {isShiftHeld ? (
              <button
                type="button"
                onClick={markAllAsUnread}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Mark all as unread
              </button>
            ) : (
              unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-sm text-type-link hover:text-type-linkHover transition-colors"
                >
                  Mark all as read
                </button>
              )
            )}
          </div>
        </div>
        <div className="flex-1 flex justify-end gap-2 md:mr-4">
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-sm text-type-secondary hover:text-white transition-colors"
          >
            <Icon icon={Icons.SETTINGS} />
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="text-sm text-type-secondary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              icon={Icons.RELOAD}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Icon
            icon={Icons.RELOAD}
            className="animate-spin rounded-full text-type-secondary text-[2rem]"
          />
          <span className="ml-3 text-type-secondary">Loading...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Icon icon={Icons.WARNING} className="text-[2rem] text-red-400" />
          <p className="text-red-400 mb-2">Failed to load notifications</p>
          <p className="text-sm text-type-secondary">{error}</p>
        </div>
      )}

      {/* Notifications list */}
      {!loading && !error && (
        <div
          ref={containerRef}
          className="space-y-4 overflow-y-auto max-h-[70vh] md:max-h-[60vh]"
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Icon
                icon={Icons.BELL}
                className="text-type-secondary text-[2rem]"
              />
              <p className="text-type-secondary">No notifications available</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const isRead = readNotifications.has(notification.guid);
              return (
                <div
                  key={notification.guid}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:bg-background-main/50 md:mr-2 ${
                    isRead
                      ? "bg-background-main border-utils-divider opacity-75"
                      : "bg-background-main border-type-link/70 shadow-sm"
                  }`}
                  onClick={() => openNotificationDetail(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap order-2 sm:order-1">
                          <h3
                            className={`font-medium ${
                              isRead ? "text-type-secondary" : "text-white"
                            }`}
                          >
                            {notification.title}
                          </h3>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 order-1 sm:order-2">
                          {/* Mobile: Source & Category */}
                          <div className="flex items-center gap-1 sm:hidden">
                            {getCategoryColor(notification.category) && (
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${getCategoryColor(
                                  notification.category,
                                )}`}
                              />
                            )}
                            <span className="text-xs text-type-secondary">
                              {getCategoryLabel(notification.category)}
                            </span>
                            {notification.source && (
                              <>
                                <span className="text-xs text-type-secondary">
                                  •
                                </span>
                                <span className="text-xs text-type-secondary">
                                  {notification.source}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Desktop: Source above Category */}
                          <div className="hidden sm:flex sm:flex-col sm:items-end sm:gap-1">
                            {notification.source && (
                              <span className="text-xs text-type-secondary font-medium">
                                {notification.source}
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              {getCategoryColor(notification.category) && (
                                <span
                                  className={`inline-block w-2 h-2 rounded-full ${getCategoryColor(
                                    notification.category,
                                  )}`}
                                />
                              )}
                              <span className="text-xs text-type-secondary">
                                {getCategoryLabel(notification.category)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="text-sm text-type-secondary mb-2 line-clamp-2 max-w-[12rem] md:max-w-[30rem] md:pr-8"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{
                          __html:
                            formatNotificationDescription(
                              notification.description,
                            ).substring(0, 150) +
                            (notification.description.length > 150
                              ? "..."
                              : ""),
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-type-secondary">
                      {formatDate(notification.pubDate)}
                    </span>
                    <Icon
                      icon={Icons.CHEVRON_RIGHT}
                      className="text-type-link"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
