import classNames from "classnames";
import { ReactNode, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { IconPatch } from "@/components/buttons/IconPatch";
import { Icons } from "@/components/Icon";
import { OverlayPortal } from "@/components/overlays/OverlayDisplay";
import { Flare } from "@/components/utils/Flare";
import { Heading2 } from "@/components/utils/Text";
import { useOverlayStack } from "@/stores/interface/overlayStack";

export function useModal(id: string) {
  const { showModal, hideModal, isModalVisible } = useOverlayStack();
  const show = useCallback(() => showModal(id), [id, showModal]);
  const hide = useCallback(() => hideModal(id), [id, hideModal]);
  return {
    id,
    isShown: isModalVisible(id),
    show,
    hide,
  };
}

export function ModalCard(props: { children?: ReactNode }) {
  return (
    <div className="w-full max-w-[30rem] m-4">
      <div className="w-full bg-modal-background rounded-xl p-8 pointer-events-auto">
        {props.children}
      </div>
    </div>
  );
}

export function Modal(props: { id: string; children?: ReactNode }) {
  const modal = useModal(props.id);
  const { modalStack } = useOverlayStack();
  const modalIndex = modalStack.indexOf(props.id);
  const zIndex = modalIndex >= 0 ? 1000 + modalIndex : 999;

  return (
    <OverlayPortal
      darken
      close={modal.hide}
      show={modal.isShown}
      zIndex={zIndex}
    >
      <Helmet>
        <html data-no-scroll />
      </Helmet>
      <div className="flex absolute inset-0 items-center justify-center flex-col">
        {props.children}
      </div>
    </OverlayPortal>
  );
}

export function FancyModal(props: {
  id: string;
  children?: ReactNode;
  title?: string;
  size?: "md" | "lg" | "xl";
  oneTime?: boolean;
}) {
  const modal = useModal(props.id);

  useEffect(() => {
    if (props.oneTime) {
      const isDismissed = localStorage.getItem(`modal-${props.id}-dismissed`);
      if (!isDismissed) {
        modal.show();
      }
    }
  }, [modal, props.id, props.oneTime]);

  const handleClose = () => {
    if (props.oneTime) {
      localStorage.setItem(`modal-${props.id}-dismissed`, "true");
    }
    modal.hide();
  };

  return (
    <OverlayPortal darken close={handleClose} show={modal.isShown}>
      <Helmet>
        <html data-no-scroll />
      </Helmet>
      <div className="flex absolute inset-0 items-center justify-center">
        <Flare.Base
          className={classNames(
            "group -m-[0.705em] rounded-3xl bg-background-main transition-colors duration-300 focus:relative focus:z-10",
            "w-full mx-4 p-6 bg-mediaCard-hoverBackground bg-opacity-60 backdrop-filter backdrop-blur-lg shadow-lg",
            props.size === "md" ? "max-w-md" : "max-w-2xl",
            props.size === "xl" ? "max-w-7xl" : "max-w-2xl",
          )}
        >
          <div className="transition-transform duration-300 overflow-y-scroll max-h-[90dvh] scrollbar-none">
            <Flare.Light
              flareSize={300}
              cssColorVar="--colors-mediaCard-hoverAccent"
              backgroundClass="bg-mediaCard-hoverBackground duration-100"
              className="rounded-3xl bg-background-main group-hover:opacity-100"
            />
            <Flare.Child className="pointer-events-auto relative mb-2p-[0.4em] transition-transform duration-300">
              <div className="flex justify-between items-center mb-4">
                {props.title && (
                  <Heading2 className="!mt-0 !mb-0 pr-6">
                    {props.title}
                  </Heading2>
                )}
                <button
                  type="button"
                  className="text-s font-semibold text-type-secondary hover:text-white transition-transform hover:scale-95"
                  onClick={handleClose}
                >
                  <IconPatch icon={Icons.X} />
                </button>
              </div>
              <div className="text-lg text-type-secondary">
                {props.children}
              </div>
            </Flare.Child>
          </div>
        </Flare.Base>
      </div>
    </OverlayPortal>
  );
}
