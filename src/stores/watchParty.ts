import { create } from "zustand";
import { persist } from "zustand/middleware";

import { usePlayerStore } from "@/stores/player/store";

interface WatchPartyStore {
  // Whether the watch party feature is enabled
  enabled: boolean;
  // The room code for the watch party (4 digits)
  roomCode: string | null;
  // If the user is hosting (true) or joining (false)
  isHost: boolean;
  // Whether to show the status overlay on the player
  showStatusOverlay: boolean;
  // Enable watch party with a new room code
  enableAsHost(): void;
  // Enable watch party by joining an existing room
  enableAsGuest(code: string): void;
  // Update the room code
  updateRoomCode(code: string): void;
  // Disable watch party
  disable(): void;
  // Set status overlay visibility
  setShowStatusOverlay(show: boolean): void;
}

// Generate a random 4-digit code
const generateRoomCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Helper function to reset playback rate to 1x
const resetPlaybackRate = () => {
  const display = usePlayerStore.getState().display;
  if (display) {
    display.setPlaybackRate(1);
  }
};

export const useWatchPartyStore = create<WatchPartyStore>()(
  persist(
    (set) => ({
      enabled: false,
      roomCode: null,
      isHost: false,
      showStatusOverlay: false,

      enableAsHost: () => {
        resetPlaybackRate();
        set(() => ({
          enabled: true,
          roomCode: generateRoomCode(),
          isHost: true,
        }));
      },

      enableAsGuest: (code: string) => {
        resetPlaybackRate();
        set(() => ({
          enabled: true,
          roomCode: code,
          isHost: false,
        }));
      },

      updateRoomCode: (code: string) =>
        set((state) => ({
          ...state,
          roomCode: code,
        })),

      disable: () =>
        set(() => ({
          enabled: false,
          roomCode: null,
        })),

      setShowStatusOverlay: (show: boolean) =>
        set(() => ({
          showStatusOverlay: show,
        })),
    }),
    {
      name: "watch-party-storage",
    },
  ),
);
