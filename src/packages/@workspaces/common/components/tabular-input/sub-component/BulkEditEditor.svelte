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

  export let placeholder: string;

  export let enableKeyValueHighlighting = false;

  export let value = "";
  export { componentClass as class };

  const dispatch = createEventDispatcher();

  let componentClass = "";
  const languageConf = new Compartment();
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
          let lines = text.split("\n");
          let lineStart = from;

          for (let line of lines) {
            if (line.startsWith("//")) {
              // Highlight the "//" in red
              decorations.push(
                Decoration.mark({ class: "comment-highlight" }).range(
                  lineStart,
                  lineStart + 2, // Only color the "//"
                ),
              );

              // Process the rest of the line as a key-value pair
              const trimmedLine = line.slice(2).replace(/^\s+/, ""); // Skip "//" and remove leading spaces
              const trimmedStart = lineStart + 2; // Adjust start position for key-value pairs

              let match;
              while ((match = KEY_VALUE_REGEX.exec(trimmedLine)) !== null) {
                const start = trimmedStart + match.index;
                const keyEnd = start + match[1].length;
                const end = start + match[0].length;

                // Apply key-value highlighting
                decorations.push(
                  Decoration.mark({ class: "key-highlight" }).range(
                    start,
                    keyEnd,
                  ),
                );
                decorations.push(
                  Decoration.mark({ class: "value-highlight" }).range(
                    keyEnd + 1,
                    end,
                  ),
                );
              }
            } else {
              // Regular key-value pair highlighting for lines without "//"
              let match;
              while ((match = KEY_VALUE_REGEX.exec(line)) !== null) {
                const start = lineStart + match.index;
                const keyEnd = start + match[1].length;
                const end = start + match[0].length;

                // Apply key-value highlighting
                decorations.push(
                  Decoration.mark({ class: "key-highlight" }).range(
                    start,
                    keyEnd,
                  ),
                );
                decorations.push(
                  Decoration.mark({ class: "value-highlight" }).range(
                    keyEnd + 1,
                    end,
                  ),
                );
              }
            }

            // Move to the next line, accounting for the newline character
            lineStart += line.length + 1;
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

  onMount(() => {
    initalizeCodeMirrorEditor(value);
  });

  onDestroy(() => {
    destroyCodeMirrorEditor(); // Call destroyCodeMirrorEditor when component is being destroyed
  });
</script>

<div
  class={`${componentClass} basic-codemirror-editor`}
  bind:this={codeMirrorEditorDiv}
/>

<style>
  .basic-codemirror-editor {
    width: 100%;
    height: 100%;
    margin-right: 1%;
  }

  :global(.key-highlight) {
    color: var(--text-primary-150);
  }

  :global(.value-highlight) {
    color: var(--white-color);
  }

  :global(.comment-highlight) {
    color: var(--text-secondary-200);
  }
</style>
