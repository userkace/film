export interface NotificationItem {
  guid: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category: string;
  source?: string;
}

export interface NotificationModalProps {
  id: string;
}

export type ModalView = "list" | "detail" | "settings";

export interface DetailViewProps {
  selectedNotification: NotificationItem;
  goBackToList: () => void;
  getCategoryColor: (category: string) => string;
  getCategoryLabel: (category: string) => string;
  formatDate: (dateString: string) => string;
  isRead: boolean;
  toggleReadStatus: () => void;
}

export interface SettingsViewProps {
  autoReadDays: number;
  setAutoReadDays: (days: number) => void;
  customFeeds: string[];
  setCustomFeeds: (feeds: string[]) => void;
  markAllAsUnread: () => void;
  onClose: () => void;
}

export interface ListViewProps {
  notifications: NotificationItem[];
  readNotifications: Set<string>;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  containerRef: React.RefObject<HTMLDivElement>;
  markAllAsRead: () => void;
  markAllAsUnread: () => void;
  isShiftHeld: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  openNotificationDetail: (notification: NotificationItem) => void;
  getCategoryColor: (category: string) => string;
  getCategoryLabel: (category: string) => string;
  formatDate: (dateString: string) => string;
}
