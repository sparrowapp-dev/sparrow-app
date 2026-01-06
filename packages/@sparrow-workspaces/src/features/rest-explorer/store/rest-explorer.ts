import { writable } from "svelte/store";

export type restExplorerData = {
  abortController: AbortController;
  response: {
    /**
     * For small responses (<1MB): contains the actual body string
     * For large responses (>=1MB): empty string, use artifact system instead
     */
    body: string;
    headers: any[];
    status: string;
    time: number;
    size: number;
    navigation: string;
    bodyLanguage: string;
    bodyFormatter: string;
    testResults?: any[];
    testMessage?: {
      error: string;
      initiator: "Pre-Request" | "Post-Request";
    }[];
    /**
     * Flag indicating if response body is file-backed (large response)
     * When true, use response artifact system to read content
     */
    isFileBacked?: boolean;
  };
  isSendRequestInProgress: boolean;
};

export const restExplorerDataStore = writable<Map<string, restExplorerData>>(
  new Map(),
);

/**
 * Clean up response data for a specific tab.
 * Called when a tab is closed to free memory and clean up temp files.
 *
 * @param tabId - Tab ID to clean up
 */
export function cleanupTabResponseData(tabId: string): void {
  restExplorerDataStore.update((map) => {
    map.delete(tabId);
    return map;
  });
}
