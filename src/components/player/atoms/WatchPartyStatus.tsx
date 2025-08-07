import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { useWatchPartySync } from "@/hooks/useWatchPartySync";
import { useWatchPartyStore } from "@/stores/watchParty";

export function WatchPartyStatus() {
  const { t } = useTranslation();
  const { enabled, roomCode, isHost, showStatusOverlay } = useWatchPartyStore();
  const [expanded, setExpanded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastUserCount, setLastUserCount] = useState(1);

  const {
    roomUsers,
    hostUser,
    isBehindHost,
    isAheadOfHost,
    timeDifferenceFromHost,
    syncWithHost,
    isSyncing,
    userCount,
  } = useWatchPartySync();

  // Show notification when users join
  useEffect(() => {
    if (userCount > lastUserCount) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
    setLastUserCount(userCount);
  }, [userCount, lastUserCount]);

  // If watch party is not enabled or overlay is hidden, don't show anything
  if (!enabled || !roomCode || !showStatusOverlay) return null;

  // Toggle expanded state
  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      className={`absolute top-4 right-4 z-50 p-2 bg-mediaCard-shadow bg-opacity-70 backdrop-blur-sm rounded-md text-white text-xs 
        flex flex-col items-end gap-1 max-w-[260px] transition-all duration-300
        ${showNotification ? "ring-1 ring-buttons-purple shadow-lg shadow-buttons-purple" : ""}`}
    >
      <div className="flex gap-2 w-full justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon icon={Icons.WATCH_PARTY} className="w-4 h-4" />
          <span className="font-bold pr-1">
            {isHost ? t("watchParty.hosting") : t("watchParty.watching")}
          </span>
        </div>
        <span className="text-type-logo font-mono tracking-wider">
          {roomCode}
        </span>
      </div>

      <div className="w-full text-type-secondary flex justify-between items-center space-x-2">
        <div className="cursor-pointer" onClick={handleToggleExpanded}>
          <Icon
            icon={expanded ? Icons.CHEVRON_DOWN : Icons.CHEVRON_RIGHT}
            className="w-3 h-3"
          />
        </div>
        <span>
          {roomUsers.length <= 1
            ? t("watchParty.alone")
            : t("watchParty.withCount", { count: roomUsers.length - 1 })}
        </span>

        {/* Sync status indicator */}
        {!isHost && hostUser && (
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isBehindHost || isAheadOfHost ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span className="text-xs">
              {isBehindHost || isAheadOfHost
                ? t("watchParty.status.outOfSync")
                : t("watchParty.status.inSync")}
            </span>
          </div>
        )}
      </div>

      {expanded && roomUsers.length > 1 && (
        <div className="w-full mt-1 border-t border-mediaCard-hoverBackground pt-1">
          <div className="text-xs text-type-secondary mb-1">Viewers:</div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {roomUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-1">
                  <Icon
                    icon={user.isHost ? Icons.RISING_STAR : Icons.USER}
                    className={`w-3 h-3 ${user.isHost ? "text-onboarding-best" : ""}`}
                  />
                  <span className={user.isHost ? "text-onboarding-best" : ""}>
                    {user.userId.substring(0, 8)}...
                  </span>
                </span>
                <span className="text-type-secondary">
                  {user.player.duration > 0
                    ? `${Math.floor((user.player.time / user.player.duration) * 100)}%`
                    : `${Math.floor(user.player.time)}s`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isHost && hostUser && (isBehindHost || isAheadOfHost) && (
        <div className="mt-1 w-full">
          <Button
            theme="secondary"
            className="text-xs py-1 px-2 bg-buttons-purple bg-opacity-50 hover:bg-buttons-purpleHover hover:bg-opacity-80 w-full flex items-center justify-center gap-1"
            onClick={syncWithHost}
            disabled={isSyncing}
          >
            <Icon icon={Icons.CLOCK} className="w-3 h-3" />
            <span className="whitespace-nowrap">
              {isSyncing
                ? t("watchParty.syncing")
                : isBehindHost
                  ? t("watchParty.behindHost", {
                      seconds: Math.abs(Math.round(timeDifferenceFromHost)),
                    })
                  : t("watchParty.aheadOfHost", {
                      seconds: Math.round(timeDifferenceFromHost),
                    })}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
