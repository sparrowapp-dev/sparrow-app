<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { basicSetup, basicTheme } from "./bulk-edit-theme";
  import { EditorState, Compartment, type Extension } from "@codemirror/state";
  import { EditorView } from "codemirror";
  import { createEventDispatcher } from "svelte";

  import {
    ViewPlugin,
    Decoration,
    placeholder as CreatePlaceHolder,
  } from "@codemirror/view";

  import { unifiedMergeView } from "@codemirror/merge";
  import { Button } from "@sparrow/library/ui";

  export let placeholder: string;

  export let enableKeyValueHighlighting = false;

  export let value = "";
  export { componentClass as class };

  // For merge view
  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string = ""; // New content to show in merge view
  let previousMergeViewState = isMergeViewEnabled;
  let originalContent = value; // Store the original content for comparison

  const dispatch = createEventDispatcher();

  let componentClass = "";
  const languageConf = new Compartment();
  const mergeConf = new Compartment(); // Add merge compartment
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;

  // Create merge extension
  function createMergeExtension(original: string) {
    return unifiedMergeView({
      original: original,
      highlightChanges: true,
      gutter: false,
      mergeControls: false,
    });
  }

  // Function to update the editor view when changes occur
  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    dispatch("change", userInput);
  });

  //  Define the key-value highlighting plugin
  const KEY_VALUE_REGEX = /([^:]+):(.+)/g;

  const keyValueHighlightStyle = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = this.createKeyValueDecorations(view);
      }

      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.createKeyValueDecorations(update.view);
        }
      }

      createKeyValueDecorations(view: EditorView) {
        const decorations: Range<Decoration>[] = [];
        for (let { from, to } of view.visibleRanges) {
          let text = view.state.doc.sliceString(from, to);
          let match;
          while ((match = KEY_VALUE_REGEX.exec(text)) !== null) {
            const start = from + match.index;
            const end = start + match[0].length;
            const keyEnd = start + match[1].length;

            decorations.push(
              Decoration.mark({ class: "key-highlight" }).range(start, keyEnd),
            );
            decorations.push(
              Decoration.mark({ class: "value-highlight" }).range(
                keyEnd + 1,
                end,
              ),
            );
          }
        }
        return Decoration.set(decorations);
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  );

  function initalizeCodeMirrorEditor(value: string) {
    let extensions: Extension[];
    extensions = [
      basicSetup,
      basicTheme,
      mergeConf.of([]), // Initialize empty merge compartment
      updateExtensionView,
      EditorView.lineWrapping, // Enable line wrapping
      CreatePlaceHolder(placeholder),
    ];

    if (enableKeyValueHighlighting) {
      extensions.push(keyValueHighlightStyle);
    }

    let state = EditorState.create({
      doc: value,
      extensions: extensions,
    });
    codeMirrorView = new EditorView({
      parent: codeMirrorEditorDiv,
      state: state,
    });
  }

  function destroyCodeMirrorEditor() {
    if (codeMirrorView) {
      codeMirrorView.destroy(); // Destroy the editor view
    }
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
  };

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

  afterUpdate(() => {
    if (!isMergeViewEnabled && value !== codeMirrorView.state.doc.toString()) {
      codeMirrorView.dispatch({
        changes: {
          from: 0,
          to: codeMirrorView.state.doc.length,
          insert: value,
        },
        annotations: [{ autoChange: true }],
      });
    }
  });

  onMount(() => {
    initalizeCodeMirrorEditor(value);
    originalContent = value;
  });

  onDestroy(() => {
    destroyCodeMirrorEditor(); // Call destroyCodeMirrorEditor when component is being destroyed
  });
</script>

<div
  class={`${componentClass} basic-codemirror-editor  ${isMergeViewEnabled ? "merge-view" : ""}`}
  bind:this={codeMirrorEditorDiv}
/>

{#if !isMergeViewLoading && isMergeViewEnabled}
  <div class="d-flex justify-content-end mt-3 me-1 gap-2 merge-view-act-btns">
    <Button
      title={"Keep the Changes"}
      size={"small"}
      type={"primary"}
      onClick={applyChanges}
    />
    <Button title={"Undo"} size={"small"} type={"secondary"} onClick={undoChanges} />
  </div>
{/if}

<style>
  .basic-codemirror-editor {
    width: 100%;
    height: 100%;
    margin-right: 1%;
  }

  :global(.key-highlight) {
    color: var(--text-ds-neutral-50);
  }

  :global(.value-highlight) {
    color: var(--white-color);
  }

  /* Merge view styles */
  .merge-view :global(.cm-changedLine) {
    /* background-color: #113b21; */
    background: var(--bg-ds-success-800) !important;
  }

  .merge-view :global(.cm-deletedChunk) {
    /* background-color: #3d1514; */
    background-color: var(--bg-ds-danger-800) !important;
  }

  /* Specific styling for deleted text */
  .merge-view :global(.cm-deletedText) {
    /* background-color: #621b18; */
    background-color: var(--bg-ds-danger-700) !important;
  }

  /* Specific styling for added text */
  .merge-view :global(.cm-changedText) {
    /* background: #14522e !important; */
    background: var(--bg-ds-success-700) !important;
  }

  .merge-view-act-btns {
    position: sticky;
    bottom: 4px;
  }
</style>
