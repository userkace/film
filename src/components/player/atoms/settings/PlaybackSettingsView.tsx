import classNames from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Toggle } from "@/components/buttons/Toggle";
import { Icon, Icons } from "@/components/Icon";
import { Menu } from "@/components/player/internals/ContextMenu";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { usePlayerStore } from "@/stores/player/store";
import { usePreferencesStore } from "@/stores/preferences";
import { useWatchPartyStore } from "@/stores/watchParty";
import { isAutoplayAllowed } from "@/utils/autoplay";

function ButtonList(props: {
  options: number[];
  selected: number;
  onClick: (v: any) => void;
  disabled?: boolean;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState<string>("");
  const [isCustomSpeed, setIsCustomSpeed] = useState(false);

  // Check if current speed is a custom value (not in preset options)
  useEffect(() => {
    if (!props.options.includes(props.selected)) {
      setIsCustomSpeed(true);
    } else {
      setIsCustomSpeed(false);
    }
  }, [props.selected, props.options]);

  const handleButtonClick = useCallback(
    (option: number, index: number) => {
      if (editingIndex === index) {
        // Already in edit mode, do nothing
        return;
      }

      // If clicking the custom speed button, enter edit mode
      if (isCustomSpeed && option === props.selected) {
        setEditingIndex(0);
        setCustomValue(option.toString());
        return;
      }

      props.onClick(option);
      setIsCustomSpeed(false);
    },
    [editingIndex, props, isCustomSpeed],
  );

  const handleDoubleClick = useCallback(
    (option: number, index: number) => {
      if (props.disabled) return;

      setEditingIndex(index);
      setCustomValue(option.toString());
    },
    [props.disabled],
  );

  const handleCustomValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomValue(e.target.value);
    },
    [],
  );

  const handleCustomValueKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const value = parseFloat(customValue);
        if (!Number.isNaN(value) && value > 0 && value <= 5) {
          props.onClick(value);
          setEditingIndex(null);
          setIsCustomSpeed(true);
        }
      } else if (e.key === "Escape") {
        setEditingIndex(null);
      }
    },
    [customValue, props],
  );

  const handleInputBlur = useCallback(() => {
    setEditingIndex(null);
  }, []);

  const handleResetCustomSpeed = useCallback(() => {
    setIsCustomSpeed(false);
    props.onClick(1); // Reset to default speed (1x)
  }, [props]);

  return (
    <div className="flex items-center bg-video-context-light/10 p-1 rounded-lg">
      {isCustomSpeed ? (
        // Show only the custom speed button when a custom speed is set
        <button
          type="button"
          disabled={props.disabled}
          className={classNames(
            "w-full px-2 py-1 rounded-md tabbable relative",
            "bg-video-context-light/20 text-white",
            props.disabled ? "opacity-50 cursor-not-allowed" : null,
          )}
          onClick={() => handleButtonClick(props.selected, 0)}
          onDoubleClick={() => handleDoubleClick(props.selected, 0)}
          key="custom"
        >
          {editingIndex === 0 ? (
            <input
              type="text"
              value={customValue}
              onChange={handleCustomValueChange}
              onKeyDown={handleCustomValueKeyDown}
              onBlur={handleInputBlur}
              className="w-full bg-transparent text-center focus:outline-none"
              autoFocus
              aria-label="Custom playback speed"
            />
          ) : (
            <>
              {`${props.selected}x`}
              <button
                type="button"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-video-context-light/70 hover:text-white"
                onClick={handleResetCustomSpeed}
                title="Reset to presets"
              >
                <Icon icon={Icons.X} className="text-sm" />
              </button>
            </>
          )}
        </button>
      ) : (
        // Show all preset options when no custom speed is set
        props.options.map((option, index) => {
          const isEditing = editingIndex === index;
          return (
            <button
              type="button"
              disabled={props.disabled}
              className={classNames(
                "w-full px-2 py-1 rounded-md tabbable relative",
                props.selected === option
                  ? "bg-video-context-light/20 text-white"
                  : null,
                props.disabled ? "opacity-50 cursor-not-allowed" : null,
              )}
              onClick={() => handleButtonClick(option, index)}
              onDoubleClick={() => handleDoubleClick(option, index)}
              key={option}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={customValue}
                  onChange={handleCustomValueChange}
                  onKeyDown={handleCustomValueKeyDown}
                  onBlur={handleInputBlur}
                  className="w-full bg-transparent text-center focus:outline-none"
                  autoFocus
                  aria-label="Custom playback speed"
                />
              ) : (
                `${option}x`
              )}
            </button>
          );
        })
      )}
    </div>
  );
}

export function PlaybackSettingsView({ id }: { id: string }) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const playbackRate = usePlayerStore((s) => s.mediaPlaying.playbackRate);
  const display = usePlayerStore((s) => s.display);
  const enableThumbnails = usePreferencesStore((s) => s.enableThumbnails);
  const setEnableThumbnails = usePreferencesStore((s) => s.setEnableThumbnails);
  const enableAutoplay = usePreferencesStore((s) => s.enableAutoplay);
  const setEnableAutoplay = usePreferencesStore((s) => s.setEnableAutoplay);
  const enableLowPerformanceMode = usePreferencesStore(
    (s) => s.enableLowPerformanceMode,
  );
  const isInWatchParty = useWatchPartyStore((s) => s.enabled);

  const allowAutoplay = useMemo(() => isAutoplayAllowed(), []);
  const canShowAutoplay =
    !isInWatchParty && allowAutoplay && !enableLowPerformanceMode;

  const setPlaybackRate = useCallback(
    (v: number) => {
      if (isInWatchParty) return; // Don't allow changes in watch party
      display?.setPlaybackRate(v);
    },
    [display, isInWatchParty],
  );

  // Force 1x speed in watch party
  useEffect(() => {
    if (isInWatchParty && display && playbackRate !== 1) {
      display.setPlaybackRate(1);
    }
  }, [isInWatchParty, display, playbackRate]);

  const options = [0.25, 0.5, 1, 1.5, 2];

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate("/")}>
        {t("player.menus.playback.title")}
      </Menu.BackLink>
      <Menu.Section>
        <div className="space-y-4 mt-3">
          <Menu.FieldTitle>
            {t("player.menus.playback.speedLabel")}
            {isInWatchParty && (
              <span className="text-sm text-type-secondary ml-2">
                {t("player.menus.playback.disabled")}
              </span>
            )}
          </Menu.FieldTitle>
          <ButtonList
            options={options}
            selected={isInWatchParty ? 1 : playbackRate}
            onClick={setPlaybackRate}
            disabled={isInWatchParty}
          />
        </div>
      </Menu.Section>
      <Menu.Section>
        <div className="space-y-4 mt-3">
          {canShowAutoplay && (
            <Menu.Link
              rightSide={
                <Toggle
                  enabled={enableAutoplay}
                  onClick={() => setEnableAutoplay(!enableAutoplay)}
                />
              }
            >
              {t("settings.preferences.autoplayLabel")}
            </Menu.Link>
          )}
          <Menu.Link
            rightSide={
              <Toggle
                enabled={enableThumbnails}
                onClick={() => setEnableThumbnails(!enableThumbnails)}
              />
            }
          >
            {t("settings.preferences.thumbnailLabel")}
          </Menu.Link>
        </div>
      </Menu.Section>
    </>
  );
}
