/**
 * Response Artifact Management
 *
 * This module handles large response bodies as file-backed artifacts rather than
 * keeping them in JS memory. This prevents UI freezes when dealing with 20-30MB
 * JSON responses.
 *
 * Core Rules:
 * - Response bodies are NEVER stored in rxdb, Svelte stores, or reactive state
 * - Large responses are written to temp files immediately
 * - Formatting (Pretty JSON/HTML/XML) happens once and writes to a separate temp file
 * - Tab switching must NOT read files, parse JSON, or reinitialize editors
 */

import { invoke } from "@tauri-apps/api/core";

/**
 * Size threshold in bytes above which responses are stored as files (1MB)
 */
export const LARGE_RESPONSE_THRESHOLD = 1_000_000;

/**
 * Supported format types for formatted responses
 */
export type ResponseFormat = "json" | "html" | "xml" | "raw";

/**
 * Response artifact containing file paths only (no content in memory)
 */
export interface ResponseArtifact {
  tabId: string;
  rawPath: string;
  prettyPaths: Map<ResponseFormat, string>;
  sizeBytes: number;
  /** Whether formatting is in progress for a specific format */
  formattingInProgress: Set<ResponseFormat>;
}

/**
 * Non-reactive Map storing response artifacts per tab.
 * This is explicitly NOT a Svelte store to avoid reactivity overhead.
 */
const responseArtifacts = new Map<string, ResponseArtifact>();

/**
 * Cache for formatted content that has been read from files.
 * Key: `${tabId}:${format}`
 * Value: formatted content string
 *
 * This is only populated on first read and never cleared until tab close.
 */
const formattedContentCache = new Map<string, string>();

/**
 * In-memory cache for small responses (no file backing).
 * Key: `${tabId}:${format}`
 * Value: formatted content string
 *
 * Used for responses below LARGE_RESPONSE_THRESHOLD to avoid
 * re-formatting on every tab switch.
 */
const inMemoryFormattedCache = new Map<string, string>();

/**
 * Write raw response body to a temp file and create an artifact.
 * Called immediately after receiving HTTP response.
 *
 * @param tabId - Unique tab identifier
 * @param body - Raw response body string
 * @returns ResponseArtifact with file path
 */
export async function writeResponseArtifact(
  tabId: string,
  body: string,
): Promise<ResponseArtifact> {
  // Clean up any existing artifact for this tab
  await cleanupArtifact(tabId);

  const rawPath = await invoke<string>("write_response_to_temp", {
    tabId,
    body,
  });

  const artifact: ResponseArtifact = {
    tabId,
    rawPath,
    prettyPaths: new Map(),
    sizeBytes: body.length,
    formattingInProgress: new Set(),
  };

  responseArtifacts.set(tabId, artifact);
  return artifact;
}

/**
 * Check if a response is large enough to warrant file storage.
 *
 * @param bodySize - Size of response body in bytes
 */
export function isLargeResponse(bodySize: number): boolean {
  return bodySize >= LARGE_RESPONSE_THRESHOLD;
}

/**
 * Get an existing artifact for a tab.
 * Returns undefined if no artifact exists.
 *
 * @param tabId - Unique tab identifier
 */
export function getArtifact(tabId: string): ResponseArtifact | undefined {
  const artifact = responseArtifacts.get(tabId);
  return artifact;
}

/**
 * Check if a formatted file exists for a tab.
 *
 * @param tabId - Unique tab identifier
 * @param format - Format type (json, html, xml, raw)
 */
export function hasFormattedFile(
  tabId: string,
  format: ResponseFormat,
): boolean {
  const artifact = responseArtifacts.get(tabId);
  if (!artifact) return false;
  return artifact.prettyPaths.has(format);
}

/**
 * Get the file path for a formatted response.
 *
 * @param tabId - Unique tab identifier
 * @param format - Format type
 */
export function getFormattedFilePath(
  tabId: string,
  format: ResponseFormat,
): string | undefined {
  const artifact = responseArtifacts.get(tabId);
  if (!artifact) return undefined;
  return artifact.prettyPaths.get(format);
}

/**
 * Store formatted content path after beautification.
 * Called after Worker or Rust completes formatting.
 *
 * @param tabId - Unique tab identifier
 * @param format - Format type
 * @param content - Formatted content string
 */
export async function storeFormattedResponse(
  tabId: string,
  format: ResponseFormat,
  content: string,
): Promise<string> {
  const artifact = responseArtifacts.get(tabId);
  if (!artifact) {
    throw new Error(`No artifact exists for tab ${tabId}`);
  }

  // Write formatted content to temp file
  const path = await invoke<string>("write_formatted_response", {
    tabId,
    format,
    content,
  });

  artifact.prettyPaths.set(format, path);
  artifact.formattingInProgress.delete(format);

  // Cache the content for instant retrieval
  const cacheKey = `${tabId}:${format}`;
  formattedContentCache.set(cacheKey, content);

  return path;
}

/**
 * Get or create formatted content for a tab.
 * This is the main entry point for getting formatted responses.
 *
 * - If formatted file exists, return cached content or read from file
 * - If not, format the raw content and store it
 *
 * @param tabId - Unique tab identifier
 * @param format - Desired format
 * @param formatFn - Function to format raw content (uses Worker)
 */
export async function getOrCreateFormattedContent(
  tabId: string,
  format: ResponseFormat,
  formatFn: (raw: string) => Promise<string>,
): Promise<string> {
  const artifact = responseArtifacts.get(tabId);
  if (!artifact) {
    throw new Error(`No artifact exists for tab ${tabId}`);
  }

  // Check cache first (instant return)
  const cacheKey = `${tabId}:${format}`;
  const cached = formattedContentCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Check if formatted file already exists
  if (artifact.prettyPaths.has(format)) {
    const path = artifact.prettyPaths.get(format)!;
    const content = await invoke<string>("read_response_file", {
      filePath: path,
    });
    formattedContentCache.set(cacheKey, content);
    return content;
  }

  // Check if formatting is already in progress
  if (artifact.formattingInProgress.has(format)) {
    // Wait for formatting to complete by polling
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        if (!artifact.formattingInProgress.has(format)) {
          clearInterval(checkInterval);
          const cachedContent = formattedContentCache.get(cacheKey);
          if (cachedContent) {
            resolve(cachedContent);
          } else {
            reject(new Error("Formatting completed but no content available"));
          }
        }
      }, 100);

      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Formatting timeout"));
      }, 60000);
    });
  }

  // Mark formatting as in progress
  artifact.formattingInProgress.add(format);

  try {
    // Read raw content
    const raw = await invoke<string>("read_response_file", {
      filePath: artifact.rawPath,
    });

    // Format using provided function (Worker-based)
    const formatted = await formatFn(raw);

    // Store formatted content
    await storeFormattedResponse(tabId, format, formatted);

    return formatted;
  } catch (error) {
    artifact.formattingInProgress.delete(format);
    throw error;
  }
}

/**
 * Read raw response content from file.
 * Only call this when you need the raw content (rare).
 *
 * @param tabId - Unique tab identifier
 */
export async function readRawContent(tabId: string): Promise<string> {
  const artifact = responseArtifacts.get(tabId);
  if (!artifact) {
    throw new Error(`No artifact exists for tab ${tabId}`);
  }

  return await invoke<string>("read_response_file", {
    filePath: artifact.rawPath,
  });
}

/**
 * Clean up artifact and associated files for a tab.
 * Called when tab is closed.
 *
 * @param tabId - Unique tab identifier
 */
export async function cleanupArtifact(tabId: string): Promise<void> {
  const artifact = responseArtifacts.get(tabId);
  if (!artifact) return;

  // Clean up all cached content for this tab (both file-backed and in-memory)
  for (const format of ["json", "html", "xml", "raw"] as ResponseFormat[]) {
    formattedContentCache.delete(`${tabId}:${format}`);
    inMemoryFormattedCache.delete(`${tabId}:${format}`);
  }

  // Remove from local map
  responseArtifacts.delete(tabId);

  // Clean up files on Rust side
  try {
    await invoke("cleanup_response_files", { tabId });
  } catch (e) {
    console.warn("Failed to cleanup response files:", e);
  }
}

/**
 * Clean up all artifacts (called on app shutdown).
 */
export async function cleanupAllArtifacts(): Promise<void> {
  responseArtifacts.clear();
  formattedContentCache.clear();
  inMemoryFormattedCache.clear();

  try {
    await invoke("cleanup_all_response_files");
  } catch (e) {
    console.warn("Failed to cleanup all response files:", e);
  }
}

/**
 * Check if an artifact exists for a tab.
 *
 * @param tabId - Unique tab identifier
 */
export function hasArtifact(tabId: string): boolean {
  return responseArtifacts.has(tabId);
}

/**
 * Get cached formatted content directly without file read.
 * Returns undefined if not cached.
 * Works for both file-backed and in-memory responses.
 *
 * @param tabId - Unique tab identifier
 * @param format - Format type
 */
export function getCachedContent(
  tabId: string,
  format: ResponseFormat,
): string | undefined {
  const cacheKey = `${tabId}:${format}`;
  // Check file-backed cache first
  const cached = formattedContentCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Check in-memory cache for small responses
  const inMemoryCached = inMemoryFormattedCache.get(cacheKey);
  if (inMemoryCached !== undefined) {
    return inMemoryCached;
  }

  return undefined;
}

/**
 * Cache formatted content for small in-memory responses.
 * This avoids re-formatting on every tab switch.
 *
 * @param tabId - Unique tab identifier
 * @param format - Format type
 * @param content - Formatted content to cache
 */
export function cacheInMemoryContent(
  tabId: string,
  format: ResponseFormat,
  content: string,
): void {
  const cacheKey = `${tabId}:${format}`;
  inMemoryFormattedCache.set(cacheKey, content);
}

/**
 * Clear in-memory cache for a specific tab.
 * Called when tab is closed or response changes.
 *
 * @param tabId - Unique tab identifier
 */
export function clearInMemoryCache(tabId: string): void {
  for (const format of ["json", "html", "xml", "raw"] as ResponseFormat[]) {
    const cacheKey = `${tabId}:${format}`;
    inMemoryFormattedCache.delete(cacheKey);
  }
}

/**
 * Get all tab IDs that have artifacts.
 */
export function getAllArtifactTabIds(): string[] {
  return Array.from(responseArtifacts.keys());
}
