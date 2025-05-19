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
  import BulkEditorMergeView from "./BulkEditorMergeView.svelte";

  export let placeholder: string;

  export let enableKeyValueHighlighting = false;

  export let value = "";
  export { componentClass as class };

  // For merge view
  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string = ""; // New content to show in merge view
  let originalContent = value; // Store the original content for comparison

  const dispatch = createEventDispatcher();

  let componentClass = "";
  const languageConf = new Compartment();
  const mergeConf = new Compartment(); // Add merge compartment
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;

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
    // originalContent = value;
  });

  onDestroy(() => {
    destroyCodeMirrorEditor(); // Call destroyCodeMirrorEditor when component is being destroyed
  });
</script>

<div
  class={`${componentClass} basic-codemirror-editor  ${isMergeViewEnabled ? "merge-view" : ""}`}
  bind:this={codeMirrorEditorDiv}
/>

<BulkEditorMergeView
  {mergeConf}
  {codeMirrorView}
  bind:isMergeViewEnabled
  bind:isMergeViewLoading
  bind:newModifiedContent
  bind:value
  bind:originalContent
  on:change={(e) => {
    value = e.detail;
    dispatch("change", e.detail); // Dispatch the new content to parent.
  }}
/>

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
</style>
