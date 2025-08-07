import classNames from "classnames";
import { useCallback } from "react";

import { Icon, Icons } from "@/components/Icon";
import { Transition } from "@/components/utils/Transition";
import { usePlayerStore } from "@/stores/player/store";

function shouldShowSkipButton(
  currentTime: number,
  skipTime?: number | null,
): "always" | "hover" | "none" {
  if (typeof skipTime !== "number") return "none";

  // Only show during the first 10 seconds of the intro section
  if (currentTime >= 0 && currentTime < skipTime) {
    if (currentTime <= 10) return "always";
    return "hover";
  }

  return "none";
}

function Button(props: {
  className: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={classNames(
        "font-bold rounded h-10 w-40 scale-95 hover:scale-100 transition-all duration-200",
        props.className,
      )}
      type="button"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export function SkipIntroButton(props: {
  controlsShowing: boolean;
  skipTime?: number | null;
  inControl: boolean;
}) {
  const time = usePlayerStore((s) => s.progress.time);
  const status = usePlayerStore((s) => s.status);
  const display = usePlayerStore((s) => s.display);
  const showingState = shouldShowSkipButton(time, props.skipTime);
  const animation = showingState === "hover" ? "slide-up" : "fade";
  let bottom = "bottom-[calc(6rem+env(safe-area-inset-bottom))]";
  if (showingState === "always") {
    bottom = props.controlsShowing
      ? bottom
      : "bottom-[calc(3rem+env(safe-area-inset-bottom))]";
  }
  const handleSkip = useCallback(() => {
    if (typeof props.skipTime === "number" && display) {
      display.setTime(props.skipTime);
    }
  }, [props.skipTime, display]);
  if (!props.inControl) return null;

  let show = false;
  if (showingState === "always") show = true;
  else if (showingState === "hover" && props.controlsShowing) show = true;
  if (status !== "playing") show = false;

  return (
    <Transition
      animation={animation}
      show={show}
      className="absolute right-[calc(3rem+env(safe-area-inset-right))] bottom-0"
    >
      <div
        className={classNames([
          "absolute bottom-0 right-0 transition-[bottom] duration-200 flex items-center space-x-3",
          bottom,
        ])}
      >
        <Button
          onClick={handleSkip}
          className="bg-buttons-primary hover:bg-buttons-primaryHover text-buttons-primaryText flex justify-center items-center"
        >
          <Icon className="text-xl mr-1" icon={Icons.SKIP_EPISODE} />
          Skip Intro
        </Button>
      </div>
    </Transition>
  );
}
