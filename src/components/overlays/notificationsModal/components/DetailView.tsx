import { Icon, Icons } from "@/components/Icon";
import { Link } from "@/pages/migration/utils";

import { DetailViewProps } from "../types";
import { formatNotificationDescription } from "../utils";

export function DetailView({
  selectedNotification,
  goBackToList,
  getCategoryColor,
  getCategoryLabel,
  formatDate,
  isRead,
  toggleReadStatus,
}: DetailViewProps) {
  return (
    <div className="space-y-4">
      {/* Header with back button and toggle read status */}
      <div className="flex md:flex-row flex-col items-start md:items-center justify-between gap-4 pb-4 border-b border-utils-divider">
        <button
          type="button"
          onClick={goBackToList}
          className="text-type-link hover:text-type-linkHover transition-colors flex items-center gap-1 text-sm"
        >
          <Icon icon={Icons.CHEVRON_LEFT} />
          <span>Back to notifications</span>
        </button>
        <div>
          <button
            type="button"
            onClick={toggleReadStatus}
            className={`text-sm transition-colors flex items-center gap-2 px-3 py-1 rounded-md ${
              isRead
                ? "text-type-link hover:text-type-linkHover bg-background-main/50 hover:bg-background-main/70"
                : "text-type-secondary hover:text-white bg-background-main/30 hover:bg-background-main/50"
            }`}
          >
            <Icon icon={isRead ? Icons.EYE_SLASH : Icons.EYE} />
            <span>{isRead ? "Mark as unread" : "Mark as read"}</span>
          </button>
        </div>
      </div>

      {/* Notification content */}
      <div className="space-y-4 overflow-y-auto max-h-[70vh] md:max-h-[60vh]">
        <div className="flex items-center gap-2">
          {getCategoryColor(selectedNotification.category) && (
            <span
              className={`inline-block w-3 h-3 rounded-full ${getCategoryColor(
                selectedNotification.category,
              )}`}
            />
          )}
          {getCategoryLabel(selectedNotification.category) && (
            <>
              <span className="text-sm text-type-secondary">
                {getCategoryLabel(selectedNotification.category)}
              </span>
              {selectedNotification.source && (
                <>
                  <span className="text-sm text-type-secondary">•</span>
                  <span className="text-sm text-type-secondary text-nowrap">
                    {selectedNotification.source}
                  </span>
                </>
              )}
              <span className="text-sm text-type-secondary">•</span>
              <span className="text-sm text-type-secondary">
                {formatDate(selectedNotification.pubDate)}
              </span>
            </>
          )}
          {!getCategoryLabel(selectedNotification.category) && (
            <>
              {selectedNotification.source && (
                <>
                  <span className="text-sm text-type-secondary">
                    {selectedNotification.source}
                  </span>
                  <span className="text-sm text-type-secondary">•</span>
                </>
              )}
              <span className="text-sm text-type-secondary">
                {formatDate(selectedNotification.pubDate)}
              </span>
            </>
          )}
        </div>

        <div className="prose prose-invert max-w-none">
          <div
            className="text-type-secondary leading-relaxed"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: formatNotificationDescription(
                selectedNotification.description,
              ),
            }}
          />
        </div>

        {selectedNotification.link && (
          <div className="pt-4 border-t border-utils-divider">
            <Link href={selectedNotification.link} target="_blank">
              <Icon icon={Icons.LINK} />
              <span>Go to page</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
