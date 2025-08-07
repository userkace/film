import { isExtensionActive } from "@/backend/extension/messaging";
import { useAuthStore } from "@/stores/auth";

let hasExtension: boolean | null = null;

export async function hasProxyCheck(): Promise<boolean> {
  if (hasExtension === null) {
    hasExtension = await isExtensionActive();
  }
  const hasProxy = Boolean(useAuthStore.getState().proxySet);
  return hasExtension || hasProxy;
}
