/**
 * Response Formatting Service
 *
 * Manages the formatting pipeline for large responses:
 * 1. Read raw content from file
 * 2. Format content using Web Worker (non-blocking)
 * 3. Write formatted content to temp file
 * 4. Cache for instant retrieval
 *
 * Formatting happens ONCE per tab per format and is never repeated.
 */

import type { ResponseFormat } from "./response-artifact";
import {
  getArtifact,
  getOrCreateFormattedContent,
  hasFormattedFile,
  getCachedContent,
  cacheInMemoryContent,
} from "./response-artifact";

// Import the beautify worker
// @ts-ignore - Worker import
import BeautifyWorker from "@sparrow/library/src/forms/editor/beautify.worker?worker";

/**
 * Web Worker instance for background beautification
 */
let beautifyWorker: Worker | null = null;
let workerRequestId = 0;
const pendingWorkerRequests = new Map<
  number,
  { resolve: (result: string) => void; reject: (error: Error) => void }
>();

/**
 * Initialize the beautify worker and set up message handlers (only once)
 */
function getBeautifyWorker(): Worker {
  if (!beautifyWorker) {
    const worker = new BeautifyWorker();
    beautifyWorker = worker;

    // Set up message handlers only once when worker is created
    worker.onmessage = (event: MessageEvent) => {
      const { id, result, error } = event.data;
      const pending = pendingWorkerRequests.get(id);
      if (pending) {
        pendingWorkerRequests.delete(id);
        if (error) {
          pending.reject(new Error(error));
        } else {
          pending.resolve(result);
        }
      }
    };

    worker.onerror = (error: ErrorEvent) => {
      console.error("[FormattingService] Worker error:", error);
    };

    return worker;
  }

  return beautifyWorker;
}

/**
 * Run beautification in a Web Worker (non-blocking)
 */
function beautifyInWorker(
  type: "json" | "javascript" | "html" | "xml",
  value: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = getBeautifyWorker();
    const id = ++workerRequestId;
    pendingWorkerRequests.set(id, { resolve, reject });
    worker.postMessage({ id, type, value });
  });
}

/**
 * Format content based on type using Web Worker (non-blocking).
 */
async function formatContent(
  type: "json" | "javascript" | "html" | "xml",
  value: string,
): Promise<string> {
  // Use Web Worker for all formatting - keeps UI responsive
  try {
    return await beautifyInWorker(type, value);
  } catch (error) {
    console.error("[FormattingService] Formatting error:", error);
    // Return original content if formatting fails
    return value;
  }
}

/**
 * Map response format to content type
 */
function formatToContentType(
  format: ResponseFormat,
): "json" | "javascript" | "html" | "xml" {
  switch (format) {
    case "json":
      return "json";
    case "html":
      return "html";
    case "xml":
      return "xml";
    case "raw":
      return "json"; // Raw doesn't need formatting, but fallback
    default:
      return "json";
  }
}

/**
 * Format options for different content types
 */
export interface FormatOptions {
  /** Tab ID */
  tabId: string;
  /** Response ID */
  responseId: string;
  /** Desired format */
  format: ResponseFormat;
  /** Callback for progress updates */
  onProgress?: (stage: "reading" | "formatting" | "writing" | "done") => void;
  /** Raw content for small in-memory responses (optional) */
  rawContent?: string;
}

/**
 * Get or create formatted content for a response.
 * This is the main entry point for the formatting pipeline.
 *
 * Returns instantly if content is cached, otherwise triggers formatting.
 * Supports both file-backed (large) and in-memory (small) responses.
 *
 * @param options - Format options
 * @returns Formatted content string
 */
export async function getFormattedResponse(
  options: FormatOptions,
): Promise<string> {
  const { tabId, responseId, format, onProgress, rawContent } = options;

  // Check cache first (works for both file-backed and in-memory)
  const cachedContent = getCachedContent(tabId, responseId, format);
  if (cachedContent) {
    onProgress?.("done");
    return cachedContent;
  }

  // For raw format, no formatting needed - just return as-is
  if (format === "raw") {
    onProgress?.("done");
    if (rawContent !== undefined) {
      cacheInMemoryContent(tabId, responseId, format, rawContent);
      return rawContent;
    }
    return getOrCreateFormattedContent(
      tabId,
      responseId,
      format,
      async (raw) => raw,
    );
  }

  // Check if this is a file-backed response
  const artifact = getArtifact(tabId, responseId);

  if (artifact) {
    // File-backed response - use artifact system
    const contentType = formatToContentType(format);
    return getOrCreateFormattedContent(
      tabId,
      responseId,
      format,
      async (raw) => {
        onProgress?.("formatting");
        const formatted = await formatContent(contentType, raw);
        onProgress?.("writing");
        return formatted;
      },
    );
  } else if (rawContent !== undefined) {
    // In-memory response - format and cache
    onProgress?.("formatting");
    const contentType = formatToContentType(format);
    const formatted = await formatContent(contentType, rawContent);

    // Cache the formatted result
    cacheInMemoryContent(tabId, responseId, format, formatted);

    onProgress?.("done");
    return formatted;
  } else {
    console.error(
      `[FormattingService] No response data available for tab ${tabId} response ${responseId}`,
    );
    throw new Error(
      `No response data available for tab ${tabId} response ${responseId}`,
    );
  }
}

/**
 * Pre-warm formatted outputs so that UI interactions are instant when users
 * switch tabs or view the response for the first time.
 *
 * Formats are processed serially to avoid overwhelming the main thread.
 */
export async function prewarmFormattedResponses(
  tabId: string,
  responseId: string,
  formats: ResponseFormat[],
): Promise<void> {
  const uniqueFormats = Array.from(new Set(formats));
  if (!uniqueFormats.length) return;

  for (const format of uniqueFormats) {
    try {
      await getFormattedResponse({ tabId, responseId, format });
    } catch (error) {
      console.warn(
        `[FormattingService] Failed to prewarm format ${format} for tab ${tabId}:`,
        error,
      );
    }
  }
}

/**
 * Check if formatted content is immediately available (cached).
 *
 * @param tabId - Tab ID
 * @param responseId - Response ID
 * @param format - Format type
 */
export function isFormattedContentReady(
  tabId: string,
  responseId: string,
  format: ResponseFormat,
): boolean {
  // Check in-memory cache first (instant)
  if (getCachedContent(tabId, responseId, format)) {
    return true;
  }
  // Check if file exists (also fast)
  return hasFormattedFile(tabId, responseId, format);
}

/**
 * Preemptively format content in the background.
 * Call this after receiving a response to warm the cache.
 *
 * @param tabId - Tab ID
 * @param responseId - Response ID
 * @param defaultFormat - Default format to preemptively generate
 */
export async function preformatResponse(
  tabId: string,
  responseId: string,
  defaultFormat: ResponseFormat = "json",
): Promise<void> {
  const artifact = getArtifact(tabId, responseId);
  if (!artifact) return;

  // Only preformat if not already formatted
  if (!isFormattedContentReady(tabId, responseId, defaultFormat)) {
    try {
      await getFormattedResponse({ tabId, responseId, format: defaultFormat });
    } catch (e) {
      console.warn("Preformat failed:", e);
    }
  }
}
