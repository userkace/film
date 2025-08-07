import { ofetch } from "ofetch";

import { getAuthHeaders } from "@/backend/accounts/auth";
import { AccountWithToken } from "@/stores/auth";

export interface GroupOrderResponse {
  groupOrder: string[];
}

export function updateGroupOrder(
  url: string,
  account: AccountWithToken,
  groupOrder: string[],
) {
  return ofetch<GroupOrderResponse>(`/users/${account.userId}/group-order`, {
    method: "PUT",
    body: groupOrder,
    baseURL: url,
    headers: getAuthHeaders(account.token),
  });
}

export function getGroupOrder(url: string, account: AccountWithToken) {
  return ofetch<GroupOrderResponse>(`/users/${account.userId}/group-order`, {
    method: "GET",
    baseURL: url,
    headers: getAuthHeaders(account.token),
  }).catch((err) => {
    if (err?.response?.status === 404) {
      return { groupOrder: [] };
    }
    throw err;
  });
}
