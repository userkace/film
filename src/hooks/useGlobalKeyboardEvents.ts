import { useEffect } from "react";

import { useOverlayStack } from "@/stores/interface/overlayStack";

/**
 * Global keyboard event handler that works across the entire application.
 * Handles Escape key to close modals and other global shortcuts.
 */
export function useGlobalKeyboardEvents() {
  const { getTopModal, hideModal } = useOverlayStack();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard events if user is typing in an input
      if (
        event.target &&
        (event.target as HTMLInputElement).nodeName === "INPUT"
      ) {
        return;
      }

      // Handle Escape key to close modals
      if (event.key === "Escape") {
        const topModal = getTopModal();
        if (topModal) {
          hideModal(topModal);
        }
      }
    };

    // Add event listener to document for global coverage
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [getTopModal, hideModal]);
}
