/**
 * CodeMirror Editor Cache
 *
 * This module manages a cache of CodeMirror EditorView instances per tab per format.
 * Editors are created once and never recreated. Tab switching only toggles DOM visibility.
 *
 * Core Rules:
 * - Create one CodeMirror EditorView per tab per format
 * - On first render: read formatted file once, set doc, never update again
 * - Never reassign CodeMirror doc, state, or extensions
 * - Tab switching must NOT touch CodeMirror state
 */

import { EditorView } from "codemirror";
import { EditorState, type Extension } from "@codemirror/state";
import type { ResponseFormat } from "./response-artifact";

/**
 * Editor cache entry containing the EditorView and its container
 */
interface CachedEditor {
  view: EditorView;
  container: HTMLDivElement;
  format: ResponseFormat;
  /** Whether the editor has been initialized with content */
  initialized: boolean;
  /** Content hash to detect if re-initialization is needed (new response) */
  contentHash: string;
}

/**
 * Non-reactive Map storing editors per tab per format.
 * Key: tabId
 * Value: Map<format, CachedEditor>
 */
const editorCache = new Map<string, Map<ResponseFormat, CachedEditor>>();

/**
 * Simple hash function for content comparison
 */
function hashContent(content: string): string {
  let hash = 0;
  const len = Math.min(content.length, 10000); // Only hash first 10KB for performance
  for (let i = 0; i < len; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Get or create a CodeMirror editor for a tab and format.
 *
 * @param tabId - Unique tab identifier
 * @param format - Response format (json, html, xml, raw)
 * @param extensions - CodeMirror extensions to apply
 * @param parentElement - DOM element to attach editor to
 */
export function getOrCreateEditor(
  tabId: string,
  format: ResponseFormat,
  extensions: Extension[],
  parentElement: HTMLElement,
): CachedEditor {
  let tabEditors = editorCache.get(tabId);
  if (!tabEditors) {
    tabEditors = new Map();
    editorCache.set(tabId, tabEditors);
  }

  let cached = tabEditors.get(format);
  if (cached) {
    // Ensure the container is in the correct parent
    if (cached.container.parentElement !== parentElement) {
      parentElement.appendChild(cached.container);
    }
    // Show the container
    cached.container.style.display = "block";
    return cached;
  }
  // Create new editor container
  const container = document.createElement("div");
  container.className = "cm-cached-editor";
  container.style.width = "100%";
  container.style.height = "100%";
  parentElement.appendChild(container);

  // Create editor state with empty content initially
  const state = EditorState.create({
    doc: "",
    extensions: [
      ...extensions,
      EditorState.readOnly.of(true), // Response editors are always read-only
      EditorView.lineWrapping,
    ],
  });

  // Create editor view
  const view = new EditorView({
    state,
    parent: container,
  });

  cached = {
    view,
    container,
    format,
    initialized: false,
    contentHash: "",
  };

  tabEditors.set(format, cached);
  return cached;
}

/**
 * Initialize editor with content (called once after formatting completes).
 * If content hash matches, this is a no-op.
 *
 * @param tabId - Unique tab identifier
 * @param format - Response format
 * @param content - Formatted content to display
 */
export function initializeEditorContent(
  tabId: string,
  format: ResponseFormat,
  content: string,
): void {
  const tabEditors = editorCache.get(tabId);
  if (!tabEditors) {
    return;
  }

  const cached = tabEditors.get(format);
  if (!cached) {
    return;
  }

  const newHash = hashContent(content);

  // If already initialized with same content, skip
  if (cached.initialized && cached.contentHash === newHash) {
    return;
  }

  // Set the document content (only time we modify the doc)
  cached.view.dispatch({
    changes: {
      from: 0,
      to: cached.view.state.doc.length,
      insert: content,
    },
  });

  cached.initialized = true;
  cached.contentHash = newHash;
}

/**
 * Reset editor for new response (when user sends a new request).
 * This marks the editor as needing re-initialization.
 *
 * @param tabId - Unique tab identifier
 */
export function resetEditorForNewResponse(tabId: string): void {
  destroyTabEditors(tabId);
}

/**
 * Hide all editors for a tab (called on tab switch away).
 *
 * @param tabId - Unique tab identifier
 */
export function hideTabEditors(tabId: string): void {
  const tabEditors = editorCache.get(tabId);
  if (!tabEditors) {
    return;
  }

  let hiddenCount = 0;
  for (const cached of tabEditors.values()) {
    cached.container.style.display = "none";
    hiddenCount++;
  }
}

/**
 * Show specific editor for a tab (called on tab switch to, format selection).
 *
 * @param tabId - Unique tab identifier
 * @param format - Format to show
 */
export function showTabEditor(tabId: string, format: ResponseFormat): void {
  const tabEditors = editorCache.get(tabId);
  if (!tabEditors) {
    return;
  }

  // Hide all editors for this tab first
  for (const [fmt, cached] of tabEditors.entries()) {
    if (fmt !== format) {
      cached.container.style.display = "none";
    }
  }

  // Show the requested format
  const cached = tabEditors.get(format);
  if (cached) {
    cached.container.style.display = "block";
  }
}

/**
 * Check if an editor exists and is initialized for a tab and format.
 *
 * @param tabId - Unique tab identifier
 * @param format - Response format
 */
export function hasInitializedEditor(
  tabId: string,
  format: ResponseFormat,
): boolean {
  const tabEditors = editorCache.get(tabId);
  if (!tabEditors) return false;

  const cached = tabEditors.get(format);
  return cached?.initialized ?? false;
}

/**
 * Get the editor view for a tab and format (if exists).
 *
 * @param tabId - Unique tab identifier
 * @param format - Response format
 */
export function getEditor(
  tabId: string,
  format: ResponseFormat,
): EditorView | undefined {
  const tabEditors = editorCache.get(tabId);
  if (!tabEditors) return undefined;

  const cached = tabEditors.get(format);
  return cached?.view;
}

/**
 * Destroy all editors for a tab (called on tab close).
 *
 * @param tabId - Unique tab identifier
 */
export function destroyTabEditors(tabId: string): void {
  const tabEditors = editorCache.get(tabId);
  if (!tabEditors) return;

  for (const cached of tabEditors.values()) {
    cached.view.destroy();
    cached.container.remove();
  }

  editorCache.delete(tabId);
}

/**
 * Destroy all cached editors (called on app shutdown).
 */
export function destroyAllEditors(): void {
  for (const [tabId] of editorCache) {
    destroyTabEditors(tabId);
  }
  editorCache.clear();
}

/**
 * Get count of cached editors (for debugging).
 */
export function getCachedEditorCount(): number {
  let count = 0;
  for (const tabEditors of editorCache.values()) {
    count += tabEditors.size;
  }
  return count;
}

/**
 * Get all tab IDs with cached editors.
 */
export function getTabIdsWithEditors(): string[] {
  return Array.from(editorCache.keys());
}
