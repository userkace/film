import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type OverlayType = "volume" | "subtitle" | "speed" | null;

interface OverlayStackStore {
  currentOverlay: OverlayType;
  modalStack: string[];
  setCurrentOverlay: (overlay: OverlayType) => void;
  showModal: (id: string) => void;
  hideModal: (id: string) => void;
  isModalVisible: (id: string) => boolean;
  getTopModal: () => string | null;
}

export const useOverlayStack = create<OverlayStackStore>()(
  immer((set, get) => ({
    currentOverlay: null,
    modalStack: [],
    setCurrentOverlay: (overlay) =>
      set((state) => {
        state.currentOverlay = overlay;
      }),
    showModal: (id: string) =>
      set((state) => {
        if (!state.modalStack.includes(id)) {
          state.modalStack.push(id);
        }
      }),
    hideModal: (id: string) =>
      set((state) => {
        state.modalStack = state.modalStack.filter((modalId) => modalId !== id);
      }),
    isModalVisible: (id: string) => {
      return get().modalStack.includes(id);
    },
    getTopModal: () => {
      const stack = get().modalStack;
      return stack.length > 0 ? stack[stack.length - 1] : null;
    },
  })),
);
