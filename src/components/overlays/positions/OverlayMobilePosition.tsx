import classNames from "classnames";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { Icon, Icons } from "@/components/Icon";
import { useInternalOverlayRouter } from "@/hooks/useOverlayRouter";

interface MobilePositionProps {
  children?: ReactNode;
  className?: string;
}

export function OverlayMobilePosition(props: MobilePositionProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const router = useInternalOverlayRouter("hello world :)");
  const { t } = useTranslation();

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const isCaptionsSettings = window.location.href.endsWith(
    "settings%2Fcaptions%2Fsettings",
  );

  return (
    <>
      {isCaptionsSettings ? (
        <button
          className="fixed top-1 right-4 w-12 h-12 text-video-context-type-main bg-video-context-background z-10 hover:bg-video-context-closeHover active:scale-95 rounded-2xl pointer-events-auto transition-all duration-100 flex justify-center items-center py-3 mt-3 font-bold border border-video-context-border hover:text-white"
          type="button"
          onClick={togglePreview}
        >
          {isPreviewMode ? (
            <Icon icon={Icons.EYE} className="w-4" />
          ) : (
            <Icon icon={Icons.EYE_SLASH} className="w-4" />
          )}
        </button>
      ) : null}

      {/* Main Overlay */}
      <div
        className={classNames([
          "pointer-events-auto px-4 pb-6 z-10 ml-[env(safe-area-inset-left)] mr-[env(safe-area-inset-right)] bottom-0 origin-top-left inset-x-0 absolute overflow-hidden max-h-[calc(100vh-1.5rem)] grid grid-rows-[minmax(0,1fr),auto]",
          props.className,
          "transition-all duration-300",
          isPreviewMode ? "opacity-50" : "opacity-100",
        ])}
      >
        {props.children}

        {/* Close button */}
        <button
          className="w-full text-video-context-type-main bg-video-context-background z-10 relative hover:bg-video-context-closeHover active:scale-95 rounded-2xl pointer-events-auto transition-all duration-100 flex justify-center items-center py-3 mt-3 font-bold border border-video-context-border hover:text-white"
          type="button"
          onClick={() => router.close()}
        >
          {t("overlays.close")}
        </button>
        {/* Gradient to hide the progress */}
        <div className="pointer-events-none absolute z-0 bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
      </div>
    </>
  );
}
