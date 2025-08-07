import { useMemo } from "react";

import {
  captionIsVisible,
  makeQueId,
  parseSubtitles,
  sanitize,
} from "@/components/player/utils/captions";
import { Transition } from "@/components/utils/Transition";
import { usePlayerStore } from "@/stores/player/store";
import { SubtitleStyling, useSubtitleStore } from "@/stores/subtitles";

const wordOverrides: Record<string, string> = {
  i: "I",
};

export function CaptionCue({
  text,
  styling,
  overrideCasing,
}: {
  text?: string;
  styling: SubtitleStyling;
  overrideCasing: boolean;
}) {
  const parsedHtml = useMemo(() => {
    let textToUse = text;
    if (overrideCasing && text) {
      textToUse = text.slice(0, 1) + text.slice(1).toLowerCase();
    }

    const textWithNewlines = (textToUse || "")
      .split(" ")
      .map((word) => wordOverrides[word] ?? word)
      .join(" ")
      .replaceAll(/ i'/g, " I'")
      .replaceAll(/\r?\n/g, "<br />");

    // https://www.w3.org/TR/webvtt1/#dom-construction-rules
    // added a <br /> for newlines
    const html = sanitize(textWithNewlines, {
      ALLOWED_TAGS: ["c", "b", "i", "u", "span", "ruby", "rt", "br"],
      ADD_TAGS: ["v", "lang"],
      ALLOWED_ATTR: ["title", "lang"],
    });

    return html;
  }, [text, overrideCasing]);

  const getTextEffectStyles = () => {
    switch (styling.fontStyle) {
      case "raised":
        return {
          textShadow: "0 2px 0 rgba(0,0,0,0.8), 0 1.5px 1.5px rgba(0,0,0,0.9)",
        };
      case "depressed":
        return {
          textShadow:
            "0 -2px 0 rgba(0,0,0,0.8), 0 -1.5px 1.5px rgba(0,0,0,0.9)",
        };
      case "uniform":
        return {
          textShadow:
            "1.5px 1.5px 1.5px rgba(0,0,0,0.8), -1.5px -1.5px 1.5px rgba(0,0,0,0.8), 1.5px -1.5px 1.5px rgba(0,0,0,0.8), -1.5px 1.5px 1.5px rgba(0,0,0,0.8)",
        };
      case "dropShadow":
        return { textShadow: "2.5px 2.5px 4.5px rgba(0,0,0,0.9)" };
      case "default":
      default:
        return { textShadow: "0 2px 4px rgba(0,0,0,0.5)" }; // Default is a light drop shadow
    }
  };

  const textEffectStyles = getTextEffectStyles();

  return (
    <p
      className="mb-1 rounded px-4 py-1 text-center leading-normal"
      style={{
        color: styling.color,
        fontSize: `${(1.5 * styling.size).toFixed(2)}em`,
        backgroundColor: `rgba(0,0,0,${styling.backgroundOpacity.toFixed(2)})`,
        backdropFilter:
          styling.backgroundBlur !== 0
            ? `blur(${Math.floor(styling.backgroundBlur * 64)}px)`
            : "none",
        fontWeight: styling.bold ? "bold" : "normal",
        ...textEffectStyles,
      }}
    >
      <span
        // its sanitised a few lines up
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: parsedHtml,
        }}
        dir="ltr"
      />
    </p>
  );
}

export function SubtitleRenderer() {
  const videoTime = usePlayerStore((s) => s.progress.time);
  const srtData = usePlayerStore((s) => s.caption.selected?.srtData);
  const language = usePlayerStore((s) => s.caption.selected?.language);
  const styling = useSubtitleStore((s) => s.styling);
  const overrideCasing = useSubtitleStore((s) => s.overrideCasing);
  const delay = useSubtitleStore((s) => s.delay);

  const parsedCaptions = useMemo(
    () => (srtData ? parseSubtitles(srtData, language) : []),
    [srtData, language],
  );

  const visibileCaptions = useMemo(
    () =>
      parsedCaptions.filter(({ start, end }) =>
        captionIsVisible(start, end, delay, videoTime),
      ),
    [parsedCaptions, videoTime, delay],
  );

  return (
    <div>
      {visibileCaptions.map(({ start, end, content }, i) => (
        <CaptionCue
          key={makeQueId(i, start, end)}
          text={content}
          styling={styling}
          overrideCasing={overrideCasing}
        />
      ))}
    </div>
  );
}

export function SubtitleView(props: { controlsShown: boolean }) {
  const caption = usePlayerStore((s) => s.caption.selected);
  const captionAsTrack = usePlayerStore((s) => s.caption.asTrack);
  const display = usePlayerStore((s) => s.display);
  const isCasting = display?.getType() === "casting";
  const styling = useSubtitleStore((s) => s.styling);

  if (captionAsTrack || !caption || isCasting) return null;

  return (
    <Transition animation="slide-up" show>
      <div
        className="text-white absolute w-full flex flex-col items-center transition-[bottom]"
        style={{
          bottom: props.controlsShown
            ? "6rem"
            : `${styling.verticalPosition}rem`,
        }}
      >
        <SubtitleRenderer />
      </div>
    </Transition>
  );
}
