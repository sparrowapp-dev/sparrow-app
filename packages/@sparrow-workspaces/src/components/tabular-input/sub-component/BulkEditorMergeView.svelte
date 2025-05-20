<script lang="ts">
  // ****************************** Imports ******************************
  import {
    onMount,
    afterUpdate,
    onDestroy,
    createEventDispatcher,
  } from "svelte";
  import { EditorView } from "codemirror";
  import { Compartment } from "@codemirror/state";
  import { unifiedMergeView } from "@codemirror/merge";
  import { Button } from "@sparrow/library/ui";
  import BulkEditorMergeViewNavigation from "./BulkEditorMergeViewNavigation.svelte";
  import {
    handleEventOnClickApplyUndoAI,
    handleEventonClickApplyChangesAI,
  } from "@sparrow/common/utils";

  // ****************************** Props ******************************
  // For merge view
  export let mergeConf: Compartment;
  export let codeMirrorView: EditorView;
  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string; // New content to compare while in mergeView
  export let value: string; // Original content to compare
  export let originalContent = value; // Store the original content for comparison
  let previousMergeViewState = isMergeViewEnabled;
  const dispatch = createEventDispatcher();

  // ****************************** Reactives ******************************
  // Handle changes to isMergeViewEnabled prop
  $: if (codeMirrorView && isMergeViewEnabled !== previousMergeViewState) {
    previousMergeViewState = isMergeViewEnabled;

    if (isMergeViewEnabled) {
      isMergeViewLoading = true;
      originalContent = codeMirrorView.state.doc.toString(); // Store current content as original

      // Apply new content if provided
      if (newModifiedContent) {
        codeMirrorView.dispatch({
          changes: {
            from: 0,
            to: codeMirrorView.state.doc.length,
            insert: newModifiedContent,
          },
          annotations: [{ autoChange: true }],
        });
        updateMergeView();

        setTimeout(() => {
          isMergeViewLoading = false;
        }, 1000);
      }
    } else {
      // If turning off merge view, restore original content
      codeMirrorView.dispatch({
        changes: {
          from: 0,
          to: codeMirrorView.state.doc.length,
          insert: originalContent,
        },
        annotations: [{ autoChange: true }],
      });
    }

    updateMergeView(); // Can be removed
  }

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
    setTimeout(() => {
      isMergeViewLoading = false;
    }, 1000);
  }

  // ****************************** LifeCycle Callbacks ********************
  onMount(() => {
    originalContent = value;
  });

  // ****************************** Methods ********************************
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
  const applyChanges = () => {
    if (!isMergeViewEnabled || !codeMirrorView) return;

    const modifiedContent = codeMirrorView.state.doc.toString(); // Get the current modified content
    value = modifiedContent; // Update the original value with the modified content
    originalContent = modifiedContent; // Update internal state
    // dispatch("applyChanges", modifiedContent); // Notify parent component of change

    isMergeViewEnabled = false; // Exit merge view mode
    newModifiedContent = ""; // reset the content
    previousMergeViewState = false;
    updateMergeView(); // Update the editor view
    handleEventonClickApplyChangesAI("BulkEditor", "headers && parameters");
  };

  /**
   * Undo changes and revert to the original content
   * This function declines the changes and keeps the original value
   */
  const undoChanges = () => {
    if (!isMergeViewEnabled || !codeMirrorView) return;

    // Restore original content
    codeMirrorView.dispatch({
      changes: {
        from: 0,
        to: codeMirrorView.state.doc.length,
        insert: originalContent,
      },
      annotations: [{ autoChange: true }],
    });

    // dispatch("undoChanges", originalContent); // Notify parent that changes were declined
    isMergeViewEnabled = false; // Exit merge view mode
    newModifiedContent = ""; // reset the content
    previousMergeViewState = false;
    updateMergeView(); // Update the editor view
    handleEventOnClickApplyUndoAI("BulkEditor", "headers && parameters");
  };
</script>

{#if !isMergeViewLoading && isMergeViewEnabled}
  <div class="d-flex justify-content-end mt-3 me-1 gap-2 merge-view-act-btns">
    <Button
      title={"Keep the Changes"}
      size={"small"}
      type={"primary"}
      onClick={applyChanges}
    />
    <Button
      title={"Undo"}
      size={"small"}
      type={"secondary"}
      onClick={undoChanges}
    />

    <BulkEditorMergeViewNavigation
      editorView={codeMirrorView}
      bind:isMergeViewEnabled
      onApplyChanges={applyChanges}
    />
  </div>
{/if}

<style>
  .merge-view-act-btns {
    position: sticky;
    bottom: 4px;
  }
</style>
