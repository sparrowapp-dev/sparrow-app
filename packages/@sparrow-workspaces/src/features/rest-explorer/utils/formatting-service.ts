/**
 * Response Formatting Service
 *
 * Manages the formatting pipeline for large responses:
 * 1. Read raw content from file
 * 2. Format content (yields to main thread periodically)
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
} from "./response-artifact";

/**
 * Yield to the main thread to keep UI responsive.
 * Uses requestIdleCallback if available, otherwise setTimeout.
 */
function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => resolve(), { timeout: 50 });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

/**
 * Format JSON content with periodic yielding for large files.
 * Uses native JSON.stringify which is much faster than js_beautify.
 */
async function formatJson(value: string): Promise<string> {
  console.log(`[FormattingService] formatJson - length: ${value.length}`);
  try {
    // Parse JSON
    const parsed = JSON.parse(value);
    console.log(`[FormattingService] JSON parsed successfully`);

    // Yield before stringify (parsing can be slow)
    await yieldToMain();

    // Use native JSON.stringify for formatting
    const formatted = JSON.stringify(parsed, null, 2);
    console.log(
      `[FormattingService] JSON formatted - output length: ${formatted.length}`,
    );

    return formatted;
  } catch (parseError) {
    // If JSON parsing fails, return original
    console.warn(
      "[FormattingService] JSON parse error during formatting:",
      parseError,
    );
    return value;
  }
}

/**
 * Format HTML/XML content.
 * For simplicity, we do basic indentation without heavy libraries.
 */
async function formatHtml(value: string): Promise<string> {
  // For large HTML, just return as-is to avoid blocking
  // Users can still read it, just not perfectly formatted
  if (value.length > 5_000_000) {
    return value;
  }

  await yieldToMain();

  // Basic HTML formatting - add newlines after tags
  let formatted = value;
  try {
    // Add newlines after closing tags for readability
    formatted = value.replace(/></g, ">\n<").replace(/>\s+</g, ">\n<");
  } catch (e) {
    // If any error, return original
    return value;
  }

  return formatted;
}

/**
 * Format XML content (same as HTML for now).
 */
async function formatXml(value: string): Promise<string> {
  return formatHtml(value);
}

/**
 * Format content based on type.
 */
async function formatContent(
  type: "json" | "javascript" | "html" | "xml",
  value: string,
): Promise<string> {
  switch (type) {
    case "json":
    case "javascript":
      return formatJson(value);
    case "html":
      return formatHtml(value);
    case "xml":
      return formatXml(value);
    default:
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
  /** Desired format */
  format: ResponseFormat;
  /** Callback for progress updates */
  onProgress?: (stage: "reading" | "formatting" | "writing" | "done") => void;
}

/**
 * Get or create formatted content for a response.
 * This is the main entry point for the formatting pipeline.
 *
 * Returns instantly if content is cached, otherwise triggers formatting.
 *
 * @param options - Format options
 * @returns Formatted content string
 */
export async function getFormattedResponse(
  options: FormatOptions,
): Promise<string> {
  const { tabId, format, onProgress } = options;
  console.log(
    `[FormattingService] getFormattedResponse - tabId: ${tabId}, format: ${format}`,
  );

  // Check if we have an artifact
  const artifact = getArtifact(tabId);
  if (!artifact) {
    console.error(`[FormattingService] No response artifact for tab ${tabId}`);
    throw new Error(`No response artifact for tab ${tabId}`);
  }

  // For raw format, no formatting needed - just return as-is
  if (format === "raw") {
    console.log(
      `[FormattingService] Raw format requested, no formatting needed`,
    );
    onProgress?.("done");
    return getOrCreateFormattedContent(tabId, format, async (raw) => raw);
  }

  // Get or create formatted content using inline formatting
  const contentType = formatToContentType(format);
  console.log(`[FormattingService] Content type: ${contentType}`);

  return getOrCreateFormattedContent(tabId, format, async (raw) => {
    console.log(
      `[FormattingService] Formatting content - length: ${raw.length}`,
    );
    onProgress?.("formatting");
    const formatted = await formatContent(contentType, raw);
    onProgress?.("writing");
    console.log(
      `[FormattingService] Formatting complete - output length: ${formatted.length}`,
    );
    return formatted;
  });
}

/**
 * Check if formatted content is immediately available (cached).
 *
 * @param tabId - Tab ID
 * @param format - Format type
 */
export function isFormattedContentReady(
  tabId: string,
  format: ResponseFormat,
): boolean {
  // Check in-memory cache first (instant)
  if (getCachedContent(tabId, format)) {
    return true;
  }
  // Check if file exists (also fast)
  return hasFormattedFile(tabId, format);
}

/**
 * Preemptively format content in the background.
 * Call this after receiving a response to warm the cache.
 *
 * @param tabId - Tab ID
 * @param defaultFormat - Default format to preemptively generate
 */
export async function preformatResponse(
  tabId: string,
  defaultFormat: ResponseFormat = "json",
): Promise<void> {
  const artifact = getArtifact(tabId);
  if (!artifact) return;

  // Only preformat if not already formatted
  if (!isFormattedContentReady(tabId, defaultFormat)) {
    try {
      await getFormattedResponse({ tabId, format: defaultFormat });
    } catch (e) {
      console.warn("Preformat failed:", e);
    }
  }
}
