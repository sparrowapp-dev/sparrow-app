<script lang="ts">
  // ****************************** Imports ******************************
  import { EditorView } from "codemirror";
  import { unifiedMergeView } from "@codemirror/merge";
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { Compartment } from "@codemirror/state";
  import { Button, notifications } from "@sparrow/library/ui";
  import { createEventDispatcher } from "svelte";
  import MergeViewNavigation from "./MergeViewNavigation.svelte";

  // ****************************** Props ******************************
  // For merge view
  export let mergeConf: Compartment;
  export let codeMirrorView: EditorView;
  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string; // New content to compare while in mergeView
  export let value: string;
  export let originalContent = value; // Store the original content for comparison
  let hasChanges = false;
  const dispatch = createEventDispatcher();

  // ****************************** Reactives ******************************

  // Call this function whenever content might change
  $: if (codeMirrorView && isMergeViewEnabled) checkForChanges();

  // Handle changes to newModifiedContent when in merge view
  $: if (codeMirrorView && isMergeViewEnabled && newModifiedContent) {
    isMergeViewLoading = true;
    codeMirrorView.dispatch({
      changes: {
        from: 0,
        to: codeMirrorView.state.doc.length,
        insert: newModifiedContent,
      },
      annotations: [{ autoChange: true }],
    });
    updateMergeView();

    // Use setTimeout to allow the merge view to be rendered
    // This is a workaround since the operation isn't really async
    setTimeout(() => (isMergeViewLoading = false), 2000);
  }

  // ****************************** Lifecycle Callbacks ******************************
  onMount(() => {
    // Initialize the editor view with the merge extension if needed
    // if (isMergeViewEnabled) {
    //   codeMirrorView.dispatch({
    //     effects: mergeConf.reconfigure([createMergeExtension(originalContent)]),
    //   });
    // }
  });
  afterUpdate(() => {});
  onDestroy(() => {});

  // ****************************** Methods ******************************
  // Create merge extension
  function createMergeExtension(original: string) {
    return unifiedMergeView({
      original: original,
      highlightChanges: true,
      gutter: false,
      mergeControls: true,
    });
  }

  // Update the merge view with current original content
  function updateMergeView() {
    if (codeMirrorView) {
      codeMirrorView.dispatch({
        effects: mergeConf.reconfigure(
          isMergeViewEnabled ? [createMergeExtension(originalContent)] : [],
        ),
      });
    }
  }

  /**
   * Apply changes from the modified content
   * This function accepts the changes and updates the original value
   */
  const applyChanges = async () => {
    if (!isMergeViewEnabled || !codeMirrorView) return;
    isMergeViewLoading = true;

    const modifiedContent = codeMirrorView.state.doc.toString();
    dispatch("change", modifiedContent);
    value = modifiedContent; // Update the original value with the modified content
    originalContent = modifiedContent; // Update internal state

    isMergeViewEnabled = false;
    newModifiedContent = ""; // reset the content
    hasChanges = false;
    updateMergeView(); // Update the editor view

    await sleep(1000);
    isMergeViewLoading = false;
  };

  /**
   * Undo changes and revert to the original content
   * This function declines the changes and keeps the original value
   */
  const undoChanges = async () => {
    if (!isMergeViewEnabled || !codeMirrorView) return;
    isMergeViewLoading = true;

    // Restore original content
    codeMirrorView.dispatch({
      changes: {
        from: 0,
        to: codeMirrorView.state.doc.length,
        insert: originalContent,
      },
      annotations: [{ autoChange: true }],
    });
    // dispatch("onUndoChanges", originalContent); // Notify parent that changes were declined

    isMergeViewEnabled = false;
    newModifiedContent = "";
    hasChanges = false;
    updateMergeView(); // Update the editor view

    await sleep(1000);
    isMergeViewLoading = false;
  };

  // Function to check if there are actual changes between original and current content
  function checkForChanges() {
    if (!codeMirrorView || !isMergeViewEnabled) {
      hasChanges = false;
      return;
    }
    const currentContent = codeMirrorView.state.doc.toString();
    hasChanges = newModifiedContent !== currentContent;

    if (!hasChanges) {
      undoChanges(); // resetting the mergeview states and props
      notifications.success("You already have updated changes.");
    }

    return hasChanges;
  }

  // Utility function to create a delay
  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
</script>

{#if !isMergeViewLoading && hasChanges}
  <div class="d-flex justify-content-end mt-3 me-0 gap-2 merge-view-act-btns">
    <Button
      title={"Keep the Changes"}
      size={"small"}
      type={"primary"}
      onClick={() => {
        applyChanges();
      }}
    ></Button>

    <Button
      title={"Undo"}
      size={"small"}
      type={"secondary"}
      onClick={() => {
        undoChanges();
      }}
    ></Button>

    <MergeViewNavigation
      editorView={codeMirrorView}
      bind:isMergeViewEnabled
      onApplyChanges={applyChanges}
    />
  </div>
{/if}

<style>
  .merge-view-act-btns {
    position: sticky;
    bottom: 10px;
    z-index: 10;
  }

  /* Add any additional styles needed for merge view navigation */
  :global(.cm-merge-highlighted-change) {
    /* outline: 2px solid #3b82f6; */
    position: relative;
    z-index: 1;
  }
</style>
