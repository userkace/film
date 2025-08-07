import classNames from "classnames";
import FocusTrap from "focus-trap-react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { Transition } from "@/components/utils/Transition";
import {
  useInternalOverlayRouter,
  useRouterAnchorUpdate,
} from "@/hooks/useOverlayRouter";
import { TurnstileProvider, getTurnstile } from "@/stores/turnstile";

export interface OverlayProps {
  id: string;
  children?: ReactNode;
  darken?: boolean;
}

function TurnstileInteractive() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    getTurnstile();
  }, []);

  // this may not rerender with different dom structure, must be exactly the same always
  return (
    <div
      className={classNames(
        "absolute w-full max-w-[43em] max-h-full p-5 md:p-10 rounded-lg bg-dropdown-altBackground select-none z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform overflow-auto",
        show ? "" : "hidden",
      )}
    >
      <div className="w-full h-full grid lg:grid-cols-[1fr,auto] gap-6 md:gap-7 items-center">
        <div className="text-left">
          <h2 className="text-type-emphasis font-bold text-lg md:text-xl mb-4 md:mb-6">
            {t("player.turnstile.title")}
          </h2>
          <p className="text-type-emphasis">
            {t("player.turnstile.description")}
          </p>
        </div>
        <TurnstileProvider
          isInPopout
          onUpdateShow={(shouldShow) => setShow(shouldShow)}
        />
      </div>
    </div>
  );
}

export function OverlayDisplay(props: { children: ReactNode }) {
  const router = useInternalOverlayRouter("hello world :)");
  const refRouter = useRef(router);

  // close router on first mount, we dont want persist routes for overlays
  useEffect(() => {
    const r = refRouter.current;
    r.close();
    return () => {
      r.close();
    };
  }, []);
  return (
    <div className="popout-location">
      <TurnstileInteractive />
      {props.children}
    </div>
  );
}

export function OverlayPortal(props: {
  children?: ReactNode;
  darken?: boolean;
  show?: boolean;
  close?: () => void;
  durationClass?: string;
  zIndex?: number;
}) {
  const [portalElement, setPortalElement] = useState<Element | null>(null);
  const [isReady, setIsReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = props.close;
  const zIndex = props.zIndex ?? 999;

  useEffect(() => {
    const element = ref.current?.closest(".popout-location");
    setPortalElement(element ?? document.body);

    // Ensure DOM is ready before enabling focus trap
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100); // Increased delay to ensure DOM is fully rendered

    return () => clearTimeout(timer);
  }, []);

  // Add global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        typeof event.reason === "object" &&
        "message" in event.reason
      ) {
        const message = event.reason.message;
        if (
          message &&
          typeof message === "string" &&
          message.includes("matches.call")
        ) {
          console.warn(
            "Caught focus-trap matches.call error, preventing crash:",
            event.reason,
          );
          event.preventDefault();
        }
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () =>
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
  }, []);

  return (
    <div ref={ref}>
      {portalElement
        ? createPortal(
            <Transition show={props.show} animation="none">
              <FocusTrap
                active={isReady && !!props.show}
                focusTrapOptions={{
                  allowOutsideClick: true,
                  clickOutsideDeactivates: true,
                  fallbackFocus: () => document.body,
                  returnFocusOnDeactivate: true,
                  escapeDeactivates: true,
                  preventScroll: true,
                  // Disable the problematic check that causes the matches.call error
                  checkCanFocusTrap: () => Promise.resolve(),
                }}
              >
                <div
                  className="popout-wrapper fixed overflow-hidden pointer-events-auto inset-0 select-none"
                  style={{ zIndex }}
                >
                  <Transition animation="fade" isChild>
                    <div
                      onClick={close}
                      className={classNames({
                        "absolute inset-0": true,
                        "bg-black opacity-90": props.darken,
                      })}
                    />
                  </Transition>
                  <Transition
                    animation="slide-up"
                    className="absolute inset-0 pointer-events-none"
                    isChild
                    durationClass={props.durationClass ?? "duration-200"}
                  >
                    {/* a tabable index that does nothing - used so focus trap doesn't error when nothing is rendered yet */}
                    <div
                      tabIndex={1}
                      className="focus:ring-0 focus:outline-none opacity-0"
                    />
                    {props.children}
                  </Transition>
                </div>
              </FocusTrap>
            </Transition>,
            portalElement,
          )
        : null}
    </div>
  );
}

export function Overlay(props: OverlayProps) {
  const router = useInternalOverlayRouter(props.id);
  const realClose = router.close;

  // listen for anchor updates
  useRouterAnchorUpdate(props.id);

  const close = useCallback(() => {
    realClose();
  }, [realClose]);

  return (
    <OverlayPortal
      close={close}
      show={router.isOverlayActive()}
      darken={props.darken}
    >
      {props.children}
    </OverlayPortal>
  );
}
