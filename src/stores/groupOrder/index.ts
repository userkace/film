import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { getGroupOrder, updateGroupOrder } from "@/backend/accounts/groupOrder";
import { AccountWithToken } from "@/stores/auth";

export interface GroupOrderStore {
  groupOrder: string[];
  setGroupOrder(order: string[]): void;
  saveGroupOrderToBackend(
    backendUrl: string,
    account: AccountWithToken,
  ): Promise<void>;
  loadGroupOrderFromBackend(
    backendUrl: string,
    account: AccountWithToken,
  ): Promise<void>;
  clear(): void;
}

export const useGroupOrderStore = create(
  persist(
    immer<GroupOrderStore>((set) => ({
      groupOrder: [],
      setGroupOrder(order: string[]) {
        set((s) => {
          s.groupOrder = order;
        });
      },
      async saveGroupOrderToBackend(
        backendUrl: string,
        account: AccountWithToken,
      ) {
        if (!account || !backendUrl) {
          throw new Error("No authenticated account or backend URL");
        }

        const currentState = useGroupOrderStore.getState();
        await updateGroupOrder(backendUrl, account, currentState.groupOrder);
      },
      async loadGroupOrderFromBackend(
        backendUrl: string,
        account: AccountWithToken,
      ) {
        if (!account || !backendUrl) {
          throw new Error("No authenticated account or backend URL");
        }

        const response = await getGroupOrder(backendUrl, account);
        set((s) => {
          s.groupOrder = response.groupOrder;
        });
      },
      clear() {
        set((s) => {
          s.groupOrder = [];
        });
      },
    })),
    {
      name: "__MW::groupOrder",
    },
  ),
);
