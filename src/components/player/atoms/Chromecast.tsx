import { useCallback, useEffect, useRef, useState } from "react";

import { Icons } from "@/components/Icon";
import { VideoPlayerButton } from "@/components/player/internals/Button";
import { usePlayerStore } from "@/stores/player/store";

// Allow the custom element in TSX without adding a global d.ts file
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "google-cast-launcher": any;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export interface ChromecastProps {
  className?: string;
}

export function Chromecast(props: ChromecastProps) {
  const [hidden, setHidden] = useState(false);
  const [castHidden, setCastHidden] = useState(false);
  const isCasting = usePlayerStore((s) => s.interface.isCasting);
  const ref = useRef<HTMLButtonElement>(null);

  const setButtonVisibility = useCallback(
    (tag: HTMLElement) => {
      const isVisible = (tag.getAttribute("style") ?? "").includes("inline");
      setHidden(!isVisible);
    },
    [setHidden],
  );

  useEffect(() => {
    const tag = ref.current?.querySelector<HTMLElement>("google-cast-launcher");
    if (!tag) return;

    const observer = new MutationObserver(() => {
      setButtonVisibility(tag);
    });

    observer.observe(tag, { attributes: true, attributeFilter: ["style"] });
    setButtonVisibility(tag);

    return () => {
      observer.disconnect();
    };
  }, [setButtonVisibility]);

  // Hide the button when there are no cast devices available according to CAF
  useEffect(() => {
    const w = window as any;
    const cast = w?.cast;
    if (!cast?.framework) return;

    const context = cast.framework.CastContext.getInstance();
    const update = () => {
      const state = context.getCastState();
      setCastHidden(state === cast.framework.CastState.NO_DEVICES_AVAILABLE);
    };
    const handler = () => update();

    context.addEventListener(
      cast.framework.CastContextEventType.CAST_STATE_CHANGED,
      handler,
    );
    update();

    return () => {
      context.removeEventListener(
        cast.framework.CastContextEventType.CAST_STATE_CHANGED,
        handler,
      );
    };
  }, []);

  return (
    <VideoPlayerButton
      ref={ref}
      className={[
        props.className ?? "",
        "google-cast-button",
        isCasting ? "casting" : "",
        hidden || castHidden ? "hidden" : "",
      ].join(" ")}
      icon={Icons.CASTING}
      onClick={(el) => {
        const castButton = el.querySelector("google-cast-launcher");
        if (castButton) (castButton as HTMLDivElement).click();
      }}
    >
      {/* Render a hidden launcher so programmatic click always works */}
      <google-cast-launcher
        style={{
          width: 0,
          height: 0,
          opacity: 0,
          position: "absolute",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
    </VideoPlayerButton>
  );
}
