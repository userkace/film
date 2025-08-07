import { list } from "subsrt-ts";

import { proxiedFetch } from "@/backend/helpers/fetch";
import {
  convertSubtitlesToSrt,
  fixUTF8Encoding,
} from "@/components/player/utils/captions";
import { CaptionListItem } from "@/stores/player/slices/source";
import { SimpleCache } from "@/utils/cache";

import {
  isExtensionActiveCached,
  sendExtensionRequest,
} from "../extension/messaging";

export const subtitleTypeList = list().map((type) => `.${type}`);
const downloadCache = new SimpleCache<string, string>();
downloadCache.setCompare((a, b) => a === b);
const expirySeconds = 24 * 60 * 60;

/**
 * Always returns SRT
 */
export async function downloadCaption(
  caption: CaptionListItem,
): Promise<string> {
  const cached = downloadCache.get(caption.url);
  if (cached) return cached;

  let data: string | undefined;
  if (caption.needsProxy) {
    if (isExtensionActiveCached()) {
      const extensionResponse = await sendExtensionRequest({
        url: caption.url,
        method: "GET",
      });
      if (
        !extensionResponse?.success ||
        typeof extensionResponse.response.body !== "string"
      ) {
        throw new Error("failed to get caption data from extension");
      }

      data = extensionResponse.response.body;
    } else {
      data = await proxiedFetch<string>(caption.url, {
        responseType: "text",
        headers: {
          "Accept-Charset": "utf-8",
        },
      });
    }
  } else {
    const response = await fetch(caption.url);
    const contentType = response.headers.get("content-type") || "";
    const charset = contentType.includes("charset=")
      ? contentType.split("charset=")[1].toLowerCase()
      : "utf-8";

    // Get the raw bytes
    const buffer = await response.arrayBuffer();
    // Decode using the detected charset, defaulting to UTF-8
    const decoder = new TextDecoder(charset);
    data = decoder.decode(buffer);
  }
  if (!data) throw new Error("failed to get caption data");

  // Ensure the data is in UTF-8 and fix any encoding issues
  const encoder = new TextEncoder();
  const decoder = new TextDecoder("utf-8");
  const utf8Bytes = encoder.encode(data);
  const utf8Data = decoder.decode(utf8Bytes);
  const fixedData = fixUTF8Encoding(utf8Data);

  const output = convertSubtitlesToSrt(fixedData);
  downloadCache.set(caption.url, output, expirySeconds);
  return output;
}

/**
 * Downloads the WebVTT content. No different than a simple
 * get request with a cache.
 */
export async function downloadWebVTT(url: string): Promise<string> {
  const cached = downloadCache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  const contentType = response.headers.get("content-type") || "";
  const charset = contentType.includes("charset=")
    ? contentType.split("charset=")[1].toLowerCase()
    : "utf-8";

  // Get the raw bytes
  const buffer = await response.arrayBuffer();
  // Decode using the detected charset, defaulting to UTF-8
  const decoder = new TextDecoder(charset);
  const data = decoder.decode(buffer);

  // Ensure the data is in UTF-8 and fix any encoding issues
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(data);
  const utf8Data = decoder.decode(utf8Bytes);
  const fixedData = fixUTF8Encoding(utf8Data);

  downloadCache.set(url, fixedData, expirySeconds);
  return fixedData;
}
