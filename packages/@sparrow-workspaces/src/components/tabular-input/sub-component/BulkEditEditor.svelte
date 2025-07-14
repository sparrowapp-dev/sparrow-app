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
    ViewUpdate,
    type DecorationSet,
    MatchDecorator,
    WidgetType,
  } from "@codemirror/view";
  import BulkEditorMergeView from "./BulkEditorMergeView.svelte";
  import { DismissIcon, MathFormulaFunction } from "@sparrow/library/assets";
  export let handleOpenDE;

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

  /**
   * Widget to render the dynamic expression.
   */
  class ExpressionWidget extends WidgetType {
    constructor(
      readonly name: string,
      readonly from: number,
      readonly to: number,
    ) {
      super();
    }

    toDOM(view: EditorView) {
      const imgWrapper = document.createElement("span");
      imgWrapper.className = "cm-expression-block-img";
      const img = document.createElement("img");
      img.src = MathFormulaFunction;
      img.alt = "Expression Icon";
      imgWrapper.appendChild(img);

      const container = document.createElement("span");
      container.className = "cm-expression-block";

      const text = document.createElement("span");
      text.textContent = this.name;

      const close = document.createElement("span");
      close.className = "cm-expression-block-close-span";

      const closeIcon = document.createElement("img");
      closeIcon.src = DismissIcon;
      closeIcon.alt = "Expression Close Icon";
      closeIcon.className = "cm-expression-block-close-img";
      close.append(closeIcon);

      close.onclick = (e) => {
        const pos = view.posAtDOM(container);
        e.stopPropagation();
        view.dispatch({
          changes: { from: pos, to: pos + this.to - this.from },
        });
      };

      container.appendChild(imgWrapper);
      container.appendChild(text);
      container.appendChild(close);

      container.onclick = (e) => {
        const pos = view.posAtDOM(container);
        e.stopPropagation();
        const content = view.state.doc.sliceString(
          pos,
          pos + this.to - this.from,
        );
        handleOpenDE({
          source: {
            from: pos,
            to: pos + this.to - this.from,
            content,
          },
          dispatch: view,
        });
      };

      // Handle dragging
      container.setAttribute("draggable", "true");
      container.addEventListener("dragstart", (e) => {
        const pos = view.posAtDOM(container);
        e.stopPropagation();
        const content = view.state.doc.sliceString(
          pos,
          pos + this.to - this.from,
        );
        e.dataTransfer?.setData("application/x-expression", content);
        e.dataTransfer?.setData("text/plain", content); // fallback
        e.dataTransfer?.setData("text/from", String(pos));
        e.dataTransfer?.setData("text/to", String(pos + this.to - this.from));
      });
      return container;
    }

    ignoreEvent() {
      return true;
    }
  }

  export const dragDropPlugin = ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        this.view = view;

        this.handleDrop = this.handleDrop.bind(this);
        view.dom.addEventListener("drop", this.handleDrop);
      }

      handleDrop(event: DragEvent) {
        event.preventDefault();

        const content = event.dataTransfer?.getData("application/x-expression");
        const from = parseInt(
          event.dataTransfer?.getData("text/from") || "",
          10,
        );
        const to = parseInt(event.dataTransfer?.getData("text/to") || "", 10);

        if (!content || isNaN(from) || isNaN(to)) return;

        const pos = this.view.posAtCoords({
          x: event.clientX,
          y: event.clientY,
        });
        if (pos == null) return;

        if (pos >= from && pos <= to) return;
      }

      destroy() {
        this.view.dom.removeEventListener("drop", this.handleDrop);
      }
    },
  );

  let currentIndex = 0;

  /**
   * Create regex matching pattern for the expression.
   * @example [[expression]]
   */

  const expressionMatcher = new MatchDecorator({
    regexp: /\[\*\$\[(.*?)\]\$\*\]/g,
    decoration: (match) => {
      return Decoration.replace({
        widget: new ExpressionWidget(
          match[1],
          match.index,
          match.index + match[0].length,
        ),
        inclusive: false,
      });
    },
  });
  /**
   * Create a decoration set for the expression matcher.
   * @param view - The editor view instance.
   */
  const expressionPlugin = ViewPlugin.fromClass(
    class {
      placeholders: DecorationSet;
      constructor(view: EditorView) {
        currentIndex = 0;
        this.placeholders = expressionMatcher.createDeco(view);
      }
      update(update: ViewUpdate) {
        currentIndex = 0;
        this.placeholders = expressionMatcher.updateDeco(
          update,
          this.placeholders,
        );
      }
    },
    {
      decorations: (instance) => instance.placeholders,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.placeholders || Decoration.none;
        }),
    },
  );

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
      expressionPlugin,
      dragDropPlugin,
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
