import classNames from "classnames";
import { type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { convert } from "subsrt-ts";

import { subtitleTypeList } from "@/backend/helpers/subs";
import { FileDropHandler } from "@/components/DropFile";
import { FlagIcon } from "@/components/FlagIcon";
import { Icon, Icons } from "@/components/Icon";
import { useCaptions } from "@/components/player/hooks/useCaptions";
import { Menu } from "@/components/player/internals/ContextMenu";
import { SelectableLink } from "@/components/player/internals/ContextMenu/Links";
import { fixUTF8Encoding } from "@/components/player/utils/captions";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { usePlayerStore } from "@/stores/player/store";
import { useSubtitleStore } from "@/stores/subtitles";
import { getPrettyLanguageNameFromLocale } from "@/utils/language";

export function CaptionOption(props: {
  countryCode?: string;
  children: React.ReactNode;
  selected?: boolean;
  loading?: boolean;
  onClick?: () => void;
  error?: React.ReactNode;
  flag?: boolean;
  subtitleUrl?: string;
  subtitleType?: string;
  // subtitle details from wyzie
  subtitleSource?: string;
  subtitleEncoding?: string;
  isHearingImpaired?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tooltipContent = useMemo(() => {
    if (!props.subtitleUrl && !props.subtitleSource) return null;

    const parts = [];

    if (props.subtitleSource) {
      parts.push(`Source: ${props.subtitleSource}`);
    }

    if (props.subtitleEncoding) {
      parts.push(`Encoding: ${props.subtitleEncoding}`);
    }

    if (props.isHearingImpaired) {
      parts.push(`Hearing Impaired: Yes`);
    }

    if (props.subtitleUrl) {
      parts.push(`URL: ${props.subtitleUrl}`);
    }

    return parts.join("\n");
  }, [
    props.subtitleUrl,
    props.subtitleSource,
    props.subtitleEncoding,
    props.isHearingImpaired,
  ]);

  const handleMouseEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 500);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SelectableLink
        selected={props.selected}
        loading={props.loading}
        error={props.error}
        onClick={props.onClick}
      >
        <span
          data-active-link={props.selected ? true : undefined}
          className="flex items-center"
        >
          {props.flag ? (
            <span data-code={props.countryCode} className="mr-3 inline-flex">
              <FlagIcon langCode={props.countryCode} />
            </span>
          ) : null}
          <span>{props.children}</span>
          {props.subtitleType && (
            <span className="ml-2 px-2 py-0.5 rounded bg-video-context-hoverColor bg-opacity-80 text-video-context-type-main text-xs font-semibold">
              {props.subtitleType.toUpperCase()}
            </span>
          )}
          {props.subtitleSource && (
            <span
              className={classNames(
                "ml-2 px-2 py-0.5 rounded text-white text-xs font-semibold overflow-hidden text-ellipsis whitespace-nowrap",
                {
                  "bg-blue-500": props.subtitleSource.includes("wyzie"),
                  "bg-orange-500": props.subtitleSource === "opensubs",
                  "bg-purple-500": props.subtitleSource === "febbox",
                },
              )}
            >
              {props.subtitleSource.toUpperCase()}
            </span>
          )}
          {props.isHearingImpaired && (
            <Icon icon={Icons.EAR} className="ml-2" />
          )}
        </span>
      </SelectableLink>
      {tooltipContent && showTooltip && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-black/80 text-white/80 text-xs rounded-lg backdrop-blur-sm w-60 break-all whitespace-pre-line">
          {tooltipContent}
        </div>
      )}
    </div>
  );
}

export function CustomCaptionOption() {
  const { t } = useTranslation();
  const lang = usePlayerStore((s) => s.caption.selected?.language);
  const setCaption = usePlayerStore((s) => s.setCaption);
  const setCustomSubs = useSubtitleStore((s) => s.setCustomSubs);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <CaptionOption
      selected={lang === "custom"}
      onClick={() => fileInput.current?.click()}
    >
      {t("player.menus.subtitles.customChoice")}
      <input
        className="hidden"
        ref={fileInput}
        accept={subtitleTypeList.join(",")}
        type="file"
        onChange={(e) => {
          if (!e.target.files) return;
          const reader = new FileReader();
          reader.addEventListener("load", (event) => {
            if (!event.target || typeof event.target.result !== "string")
              return;

            // Ensure the data is in UTF-8 and fix any encoding issues
            const encoder = new TextEncoder();
            const decoder = new TextDecoder("utf-8");
            const utf8Bytes = encoder.encode(event.target.result);
            const utf8Data = decoder.decode(utf8Bytes);
            const fixedData = fixUTF8Encoding(utf8Data);

            const converted = convert(fixedData, "srt");
            setCaption({
              language: "custom",
              srtData: converted,
              id: "custom-caption",
            });
            setCustomSubs();
          });
          reader.readAsText(e.target.files[0], "utf-8");
        }}
      />
    </CaptionOption>
  );
}

export function CaptionsView({
  id,
  backLink,
}: {
  id: string;
  backLink?: true;
}) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const selectedCaptionId = usePlayerStore((s) => s.caption.selected?.id);
  const { disable, toggleLastUsed } = useCaptions();
  const [dragging, setDragging] = useState(false);
  const setCaption = usePlayerStore((s) => s.setCaption);
  const selectedCaptionLanguage = usePlayerStore(
    (s) => s.caption.selected?.language,
  );

  function onDrop(event: DragEvent<HTMLDivElement>) {
    const files = event.dataTransfer.files;
    const firstFile = files[0];
    if (!files || !firstFile) return;

    const fileExtension = `.${firstFile.name.split(".").pop()}`;
    if (!fileExtension || !subtitleTypeList.includes(fileExtension)) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", (e) => {
      if (!e.target || typeof e.target.result !== "string") return;

      // Ensure the data is in UTF-8 and fix any encoding issues
      const encoder = new TextEncoder();
      const decoder = new TextDecoder("utf-8");
      const utf8Bytes = encoder.encode(e.target.result);
      const utf8Data = decoder.decode(utf8Bytes);
      const fixedData = fixUTF8Encoding(utf8Data);

      const converted = convert(fixedData, "srt");

      setCaption({
        language: "custom",
        srtData: converted,
        id: "custom-caption",
      });
    });

    reader.readAsText(firstFile, "utf-8");
  }

  const selectedLanguagePretty = selectedCaptionLanguage
    ? (getPrettyLanguageNameFromLocale(selectedCaptionLanguage) ??
      t("player.menus.subtitles.unknownLanguage"))
    : undefined;

  return (
    <>
      <div>
        <div
          className={classNames(
            "absolute inset-0 flex items-center justify-center text-white z-10 pointer-events-none transition-opacity duration-300",
            dragging ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="flex flex-col items-center">
            <Icon className="text-5xl mb-4" icon={Icons.UPLOAD} />
            <span className="text-xl weight font-medium">
              {t("player.menus.subtitles.dropSubtitleFile")}
            </span>
          </div>
        </div>

        {backLink ? (
          <Menu.BackLink
            onClick={() => router.navigate("/")}
            rightSide={
              <button
                type="button"
                onClick={() => router.navigate("/captions/settings")}
                className="-mr-2 -my-1 px-2 p-[0.4em] rounded tabbable hover:bg-video-context-light hover:bg-opacity-10"
              >
                {t("player.menus.subtitles.customizeLabel")}
              </button>
            }
          >
            {t("player.menus.subtitles.title")}
          </Menu.BackLink>
        ) : (
          <Menu.Title
            rightSide={
              <button
                type="button"
                onClick={() => router.navigate("/captions/settingsOverlay")}
                className="-mr-2 -my-1 px-2 p-[0.4em] rounded tabbable hover:bg-video-context-light hover:bg-opacity-10"
              >
                {t("player.menus.subtitles.customizeLabel")}
              </button>
            }
          >
            {t("player.menus.subtitles.title")}
          </Menu.Title>
        )}
      </div>
      <FileDropHandler
        className={`transition duration-300 ${dragging ? "opacity-20" : ""}`}
        onDraggingChange={(isDragging) => {
          setDragging(isDragging);
        }}
        onDrop={(event) => onDrop(event)}
      >
        <Menu.ScrollToActiveSection className="!pt-1 mt-2 pb-3">
          <CaptionOption
            onClick={() => disable()}
            selected={!selectedCaptionId}
          >
            {t("player.menus.subtitles.offChoice")}
          </CaptionOption>
          <CaptionOption
            onClick={() => toggleLastUsed().catch(() => {})}
            selected={!!selectedCaptionId}
          >
            {t("player.menus.subtitles.onChoice")}
          </CaptionOption>
          <CustomCaptionOption />
          <Menu.ChevronLink
            onClick={() =>
              router.navigate(
                backLink ? "/captions/source" : "/captions/sourceOverlay",
              )
            }
            rightText={
              useSubtitleStore((s) => s.isOpenSubtitles)
                ? ""
                : selectedLanguagePretty
            }
          >
            {t("player.menus.subtitles.SourceChoice")}
          </Menu.ChevronLink>
          <Menu.ChevronLink
            onClick={() =>
              router.navigate(
                backLink
                  ? "/captions/opensubtitles"
                  : "/captions/opensubtitlesOverlay",
              )
            }
            rightText={
              useSubtitleStore((s) => s.isOpenSubtitles)
                ? selectedLanguagePretty
                : ""
            }
          >
            {t("player.menus.subtitles.OpenSubtitlesChoice")}
          </Menu.ChevronLink>
        </Menu.ScrollToActiveSection>
      </FileDropHandler>
    </>
  );
}

export default CaptionsView;
