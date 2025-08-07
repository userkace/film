import { useEffect, useRef } from "react";

import { updateGroupOrder } from "@/backend/accounts/groupOrder";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { useAuthStore } from "@/stores/auth";
import { useGroupOrderStore } from "@/stores/groupOrder";

const syncIntervalMs = 5 * 1000;

export function GroupSyncer() {
  const url = useBackendUrl();
  const groupOrder = useGroupOrderStore((s) => s.groupOrder);
  const lastSyncedOrder = useRef<string[]>([]);
  const isInitialized = useRef(false);

  // Initialize lastSyncedOrder on first render
  useEffect(() => {
    if (!isInitialized.current) {
      lastSyncedOrder.current = [...groupOrder];
      isInitialized.current = true;
    }
  }, [groupOrder]);

  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        if (!url) return;

        const user = useAuthStore.getState();
        if (!user.account) return; // not logged in, dont sync to server

        // Check if group order has changed since last sync
        const currentOrder = useGroupOrderStore.getState().groupOrder;
        const hasChanged =
          JSON.stringify(currentOrder) !==
          JSON.stringify(lastSyncedOrder.current);

        if (hasChanged) {
          try {
            await updateGroupOrder(url, user.account, currentOrder);
            lastSyncedOrder.current = [...currentOrder];
          } catch (err) {
            console.error("Failed to sync group order:", err);
          }
        }
      })();
    }, syncIntervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [url]);

  return null;
}
