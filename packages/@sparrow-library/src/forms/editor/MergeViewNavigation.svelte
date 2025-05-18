<script lang="ts">
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { EditorView } from "@codemirror/view";
  // import ChevronUp from "./icons/ChevronUp.svelte";
  // import ChevronDown from "./icons/ChevronDown.svelte";
  import {
    CloudArrowUpRegular,
    ArrowSortRegular,
    ArrowUpFilled,
    ArrowDownRegular,
  } from "@sparrow/library/icons";

  import {
    findMergeViewChanges,
    scrollToChange,
    groupChanges,
  } from "./mergeViewUtils";

  import { type MergeChange } from "@sparrow/common/interfaces/editorMergeView.interface";

  export let editorView: EditorView | null = null;
  export let isMergeViewEnabled = false;
  export let onApplyChanges: () => void = () => {}; // Callback to apply changes

  let totalChanges = 0;
  let currentChangeIndex = 0;
  let changes: MergeChange[] = [];

  // Function to detect and process all changes in the merge view
  function detectChanges() {
    if (!editorView || !isMergeViewEnabled) {
      console.log("Merge view is not enabled or editorView is null.");
      changes = [];
      totalChanges = 0;
      currentChangeIndex = 0;
      return;
    }
    const rawChanges = findMergeViewChanges(editorView); // Find all changes in the document using our utility
    changes = groupChanges(rawChanges, editorView); // Group nearby changes to avoid navigating through small segments
    totalChanges = changes.length;

    // Reset the current index if needed
    if (currentChangeIndex >= totalChanges) {
      currentChangeIndex = totalChanges > 0 ? 0 : 0;
    }

    if (changes.length > 0) {
      scrollToCurrentChange();
    } else onApplyChanges(); // Finally apply the changes done by user selection (accept/reject)
  }

  // Navigate to the next change
  function goToNextChange() {
    if (changes.length === 0) return;
    currentChangeIndex = (currentChangeIndex + 1) % totalChanges;
    scrollToCurrentChange();
  }

  // Navigate to the previous change
  function goToPreviousChange() {
    if (changes.length === 0) return;
    currentChangeIndex = (currentChangeIndex - 1 + totalChanges) % totalChanges;
    scrollToCurrentChange();
  }

  // Scroll the editor to show the current change
  function scrollToCurrentChange() {
    if (!editorView || changes.length === 0) return;
    const change = changes[currentChangeIndex];
    scrollToChange(editorView, change);
  }

  // Refresh change detection when the merge view updates
  afterUpdate(() => {
    if (isMergeViewEnabled && editorView) {
      // Wait a moment for DOM to update
      setTimeout(() => {
        detectChanges();
      }, 300); // Increased timeout to ensure DOM is fully updated
    }
  });

  // Setup editor and keyboard shortcuts
  onMount(() => {
    // Observe DOM changes to detect when merge view content is updated
    const observer = new MutationObserver(() => {
      if (isMergeViewEnabled && editorView) {
        detectChanges();
      }
    });

    if (editorView?.dom) {
      observer.observe(editorView.dom, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  });

  // Clean up keyboard handlers
  onDestroy(() => {});
</script>

{#if isMergeViewEnabled}
  <div class="merge-view-navigation">
    <div class="merge-navigation-counter-wrapper">
      <div class="merge-navigation-controls">
        <span class="merge-nav-counter">
          {currentChangeIndex + 1} of {totalChanges}
        </span>

        <button
          class="merge-nav-button"
          on:click={goToPreviousChange}
          disabled={totalChanges === 0}
          title="Previous change (Alt+Up)"
        >
          <!-- <ChevronUp size={14} /> -->
          <ArrowUpFilled size={"16px"} color={"var(--bg-ds-neutral-100)"} />
        </button>

        <button
          class="merge-nav-button"
          on:click={goToNextChange}
          disabled={totalChanges === 0}
          title="Next change (Alt+Down)"
        >
          <!-- <ChevronDown size={14} /> -->
          <ArrowDownRegular size={"16px"} color={"var(--bg-ds-neutral-100)"} />
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .merge-view-navigation {
    display: inline-flex;
    align-items: center;
    margin-right: 12px;
  }

  .merge-navigation-counter-wrapper {
    display: flex;
    align-items: center;
  }

  .merge-navigation-controls {
    display: flex;
    align-items: center;
    height: 28px;
    border: 1px solid var(--bg-ds-surface-400);
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .merge-nav-button {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 100%;
    color: var(--bg-ds-surface-400);
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .merge-nav-button:hover:not(:disabled) {
    background-color: var(--bg-ds-surface-200);
  }

  .merge-nav-button:active:not(:disabled) {
    background-color: var(--bg-ds-surface-200);
  }

  /* .merge-nav-button:disabled {
    color: #9ca3af;
    cursor: not-allowed;
  } */

  .merge-nav-counter {
    /* padding: 0 10px; */
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
    min-width: 60px;
    text-align: center;
    user-select: none;
  }
</style>
