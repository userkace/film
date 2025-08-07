import { Icon, Icons } from "@/components/Icon";
import { Flare } from "@/components/utils/Flare";
import { Transition } from "@/components/utils/Transition";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { useSubtitleStore } from "@/stores/subtitles";

export function SubtitleDelayPopout() {
  const showDelayIndicator = useSubtitleStore((s) => s.showDelayIndicator);
  const currentOverlay = useOverlayStack((s) => s.currentOverlay);
  const delay = useSubtitleStore((s) => s.delay);

  return (
    <Transition
      animation="slide-down"
      show={showDelayIndicator && currentOverlay === "subtitle"}
      className="absolute inset-x-0 top-4 flex justify-center pointer-events-none"
    >
      <Flare.Base className="hover:flare-enabled pointer-events-auto bg-video-context-background pl-4 pr-6 py-3 group w-72 h-full rounded-lg transition-colors text-video-context-type-main">
        <Flare.Light
          enabled
          flareSize={200}
          cssColorVar="--colors-video-context-light"
          backgroundClass="bg-video-context-background duration-100"
          className="rounded-lg"
        />
        <Flare.Child className="grid grid-cols-[auto,1fr] gap-3 pointer-events-auto relative transition-transform">
          <Icon className="text-2xl" icon={Icons.CAPTIONS} />
          <div className="w-full flex items-center justify-between">
            <span className="text-sm">
              Subtitle delay: {delay > 0 ? "+" : ""}
              {delay.toFixed(1)}s
            </span>
          </div>
        </Flare.Child>
      </Flare.Base>
    </Transition>
  );
}
