/* eslint-disable no-alert */
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useAsync } from "react-use";

import { getBackendMeta } from "@/backend/accounts/meta";
import { getRoomStatuses } from "@/backend/player/status";
import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { Spinner } from "@/components/layout/Spinner";
import { Menu } from "@/components/player/internals/ContextMenu";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { useWatchPartySync } from "@/hooks/useWatchPartySync";
import { useAuthStore } from "@/stores/auth";
import { useWatchPartyStore } from "@/stores/watchParty";

import { useDownloadLink } from "./Downloads";

export function WatchPartyView({ id }: { id: string }) {
  const router = useOverlayRouter(id);
  const { t } = useTranslation();
  const downloadUrl = useDownloadLink();
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [backendName, setBackendName] = useState("");
  const [editingCode, setEditingCode] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [hasCopiedShare, setHasCopiedShare] = useState(false);
  const backendUrl = useBackendUrl();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const account = useAuthStore((s) => s.account);

  const backendMeta = useAsync(async () => {
    if (!backendUrl) return;
    return getBackendMeta(backendUrl);
  }, [backendUrl]);

  const backendSupportsWatchParty = backendMeta?.value?.version
    ? backendMeta.value.version >= "2.0.1"
    : false;

  // Watch party store access
  const {
    enabled,
    roomCode,
    isHost,
    enableAsHost,
    enableAsGuest,
    updateRoomCode,
    disable,
    showStatusOverlay,
    setShowStatusOverlay,
  } = useWatchPartyStore();

  // Watch party sync data
  const { roomUsers } = useWatchPartySync();

  // Auto-host timer
  useEffect(() => {
    if (!enabled || isHost || roomUsers.length > 1) return;

    const timer = setTimeout(() => {
      if (roomUsers.length <= 1) {
        enableAsHost();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [enabled, isHost, roomUsers.length, enableAsHost]);

  // Fetch backend name
  useEffect(() => {
    if (backendUrl && enabled) {
      getBackendMeta(backendUrl)
        .then((meta) => {
          setBackendName(meta.name);
        })
        .catch(() => {
          setBackendName("Unknown Server");
        });
    }
  }, [backendUrl, enabled]);

  // Listen for validation status events
  useEffect(() => {
    const handleValidation = () => {
      setIsJoining(false);
    };

    window.addEventListener(
      "watchparty:validation",
      handleValidation as EventListener,
    );

    return () => {
      window.removeEventListener(
        "watchparty:validation",
        handleValidation as EventListener,
      );
    };
  }, []);

  // Reset joining state when watch party is disabled
  useEffect(() => {
    if (!enabled) {
      setIsJoining(false);
    }
  }, [enabled]);

  const handlelegacyWatchPartyClick = () => {
    if (downloadUrl) {
      const watchPartyUrl = `https://www.watchparty.me/create?video=${encodeURIComponent(
        downloadUrl,
      )}`;
      window.open(watchPartyUrl);
    }
  };

  const handleHostParty = () => {
    enableAsHost();
    setShowJoinInput(false);
  };

  const handleJoinParty = async () => {
    if (joinCode.length > 0) {
      setIsValidating(true);
      setValidationError(null);

      try {
        const response = await getRoomStatuses(backendUrl, account, joinCode);
        const hasUsers = Object.keys(response.users).length > 0;

        if (!hasUsers) {
          setValidationError(t("watchParty.emptyRoom"));
          setIsValidating(false);
          return;
        }

        setIsJoining(true);
        enableAsGuest(joinCode);
        setShowJoinInput(false);
      } catch (error) {
        console.error("Failed to validate room:", error);
        setValidationError(t("watchParty.invalidRoom"));
      } finally {
        setIsValidating(false);
      }
    }
  };

  const handleDisableParty = () => {
    disable();
    setShowJoinInput(false);
    setJoinCode("");
  };

  const handleCopyCode = () => {
    if (roomCode) {
      // Create URL with watchparty parameter
      const url = new URL(window.location.href);
      url.searchParams.set("watchparty", roomCode);
      navigator.clipboard.writeText(url.toString());
      setHasCopiedShare(true);
      setTimeout(() => setHasCopiedShare(false), 2000);
    }
  };

  const handleEditCode = () => {
    if (isHost && roomCode) {
      setCustomCode(roomCode);
      setEditingCode(true);
    }
  };

  const handleSaveCode = () => {
    if (customCode.length > 0) {
      updateRoomCode(customCode);
      if (roomCode) {
        const url = new URL(window.location.href);
        url.searchParams.set("watchparty", customCode);
        window.history.replaceState({}, "", url.toString());
      }
      setEditingCode(false);
    }
  };

  const toggleStatusOverlay = () => {
    setShowStatusOverlay(!showStatusOverlay);
  };

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate("/")}>
        {t("player.menus.watchparty.watchpartyItem")}
      </Menu.BackLink>
      <Menu.Section>
        <div className="pb-4">
          {backendSupportsWatchParty &&
            (enabled ? (
              <div className="space-y-4">
                {isJoining ? (
                  <div className="text-center py-4">
                    <Spinner />
                    <p className="text-sm text-type-secondary">
                      {t("watchParty.validating")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <div className="text-center">
                        <Trans
                          i18nKey={
                            isHost ? "watchParty.isHost" : "watchParty.isGuest"
                          }
                          values={{ backendName }}
                          className="text-sm text-type-secondary"
                        >
                          <span className="text-type-logo" />
                        </Trans>
                      </div>
                      <div
                        className="relative flex items-center justify-center p-3 bg-mediaCard-hoverBackground rounded-lg border border-mediaCard-hoverAccent border-opacity-20 cursor-pointer transition-all duration-300 hover:bg-mediaCard-hoverShadow group"
                        onClick={editingCode ? undefined : handleCopyCode}
                        title={
                          editingCode ? undefined : t("watchParty.copyCode")
                        }
                      >
                        {isHost && !editingCode && (
                          <div
                            className="absolute top-2 right-2 p-1 hover:bg-mediaCard-hoverShadow rounded-full transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCode();
                            }}
                          >
                            <Icon
                              icon={Icons.EDIT}
                              className="w-3 h-3 text-type-secondary hover:text-type-logo"
                            />
                          </div>
                        )}
                        {editingCode ? (
                          <div className="flex w-full gap-2">
                            <input
                              type="text"
                              value={customCode}
                              maxLength={10}
                              className="bg-transparent border-none text-center font-mono tracking-widest w-full outline-none text-type-logo text-[min(2rem,4vw)]"
                              onChange={(e) =>
                                setCustomCode(e.target.value.toUpperCase())
                              }
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                            <Button
                              theme="purple"
                              className="px-2 py-1  text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveCode();
                              }}
                            >
                              {t("watchParty.save")}
                            </Button>
                          </div>
                        ) : (
                          <input
                            type="text"
                            readOnly
                            value={
                              hasCopiedShare
                                ? t("watchParty.linkCopied")
                                : roomCode || ""
                            }
                            className="bg-transparent border-none text-center font-mono tracking-widest w-full outline-none cursor-pointer text-type-logo text-[min(2rem,4vw)]"
                            onClick={(e) => {
                              if (e.target instanceof HTMLInputElement) {
                                e.target.select();
                              }
                            }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-center text-type-secondary">
                        {isHost
                          ? t("watchParty.shareCode")
                          : t("watchParty.connectedAsGuest")}
                      </p>
                    </div>

                    {roomUsers.length > 1 && (
                      <div className="bg-mediaCard-hoverBackground rounded-lg p-3 border border-mediaCard-hoverAccent border-opacity-20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-white">
                            {t("watchParty.viewers", {
                              count: roomUsers.length,
                            })}
                          </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {roomUsers.map((user) => (
                            <div
                              key={user.userId}
                              className="flex items-center justify-between text-xs py-1"
                            >
                              <span className="flex items-center gap-1">
                                <Icon
                                  icon={
                                    user.isHost ? Icons.RISING_STAR : Icons.USER
                                  }
                                  className={`w-3 h-3 ${user.isHost ? "text-onboarding-best" : "text-type-secondary"}`}
                                />
                                <span
                                  className={
                                    user.isHost
                                      ? "text-onboarding-best"
                                      : "text-type-secondary"
                                  }
                                >
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

                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between bg-mediaCard-hoverBackground rounded-lg p-3 border border-mediaCard-hoverAccent border-opacity-20">
                        <span className="text-white">
                          {t("watchParty.showStatusOverlay")}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={showStatusOverlay}
                            onChange={toggleStatusOverlay}
                          />
                          <div className="w-9 h-5 bg-mediaCard-hoverBackground rounded-full peer peer-checked:bg-buttons-purple peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-mediaCard-hoverAccent after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
                        </label>
                      </div>

                      <Button
                        className="w-full"
                        theme="danger"
                        onClick={handleDisableParty}
                      >
                        {t("watchParty.leaveWatchParty")}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {showJoinInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      maxLength={10}
                      className="w-full p-2 text-center text-2xl tracking-widest bg-mediaCard-hoverBackground border border-mediaCard-hoverAccent border-opacity-20 rounded-lg text-type-logo"
                      placeholder="ABCD123456"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase());
                        setValidationError(null);
                      }}
                    />
                    {validationError && (
                      <p className="text-xs text-center text-red-500 mt-1">
                        {validationError}
                      </p>
                    )}
                    {isValidating && (
                      <div className="flex items-center justify-center">
                        <Spinner className="w-5 h-5 mr-2" />
                        {t("watchParty.validating")}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        className="w-full"
                        theme="secondary"
                        onClick={() => {
                          setShowJoinInput(false);
                          setValidationError(null);
                        }}
                      >
                        {t("watchParty.cancel")}
                      </Button>
                      <Button
                        className="w-full"
                        theme="purple"
                        onClick={handleJoinParty}
                        disabled={joinCode.length === 0 || isValidating}
                      >
                        {t("watchParty.join")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      className="w-full"
                      theme="purple"
                      onClick={handleHostParty}
                    >
                      {t("watchParty.hostParty")}
                    </Button>
                    <Button
                      className="w-full"
                      theme="secondary"
                      onClick={() => setShowJoinInput(true)}
                    >
                      {t("watchParty.joinParty")}
                    </Button>
                  </div>
                )}
              </div>
            ))}

          {backendSupportsWatchParty && <Menu.Divider />}

          <Menu.Link
            clickable
            onClick={handlelegacyWatchPartyClick}
            rightSide={<Icon className="text-xl" icon={Icons.WATCH_PARTY} />}
          >
            {t("player.menus.watchparty.legacyWatchparty")}
          </Menu.Link>
          <Menu.Paragraph marginClass="text-xs text-type-secondary mt-2">
            {t("player.menus.watchparty.notice")}
          </Menu.Paragraph>
        </div>
      </Menu.Section>
    </>
  );
}
