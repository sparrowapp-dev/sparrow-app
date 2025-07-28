<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { getBasicSetup, getTheme } from "./theme";
  import { EditorState, Compartment, type Extension } from "@codemirror/state";
  import handleCodeMirrorSyntaxFormat from "./editor";
  import { EditorView } from "codemirror";
  import { createEventDispatcher } from "svelte";
  import {
    placeholder as CreatePlaceHolder,
    keymap,
    MatchDecorator,
    WidgetType,
    type DecorationSet,
  } from "@codemirror/view";
  import { linter } from "@codemirror/lint";
  import type { Diagnostic } from "@codemirror/lint";
  import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
  import { Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";
  import { RangeSetBuilder } from "@codemirror/state";
  import { MathFormulaFunction } from "@sparrow/library/assets";
  import { DismissIcon } from "@sparrow/library/assets";
  import {
    handleEventonClickApplyChangesAI,
    handleEventOnClickApplyUndoAI,
  } from "@sparrow/common/utils";
  import MergeView from "./MergeView.svelte";

  export let lang:
    | "HTML"
    | "JSON"
    | "XML"
    | "JavaScript"
    | "Text"
    | "Graphql"
    | "Python"
    | "Curl" = "Text";
  export let value = "";
  export let customSuggestions = false;
  export let isEnterKeyNotAllowed = false;
  export let suggestions: { label: string; type: string }[] = [];
  export let isEditable = true;
  export let isFormatted = false;
  export let isBodyBeautified = false;
  export let beautifySyntaxCallback: (value: boolean) => void = () => {};
  export { componentClass as class };
  export let placeholder = "";
  export let isErrorVisible = false; // Determines if errors should be shown
  export let errorMessage = ""; // Error message to display if `isErrorVisible` is true
  export let errorStartIndex = 0;
  export let errorEndIndex = 0;
  export let autofocus = false;
  export let cursorPosition: number | null = null;
  export let handleOpenDE;
  export let dispatcher;
  export let showLineNumbers = true;
  export let highlightActiveLine = true;
  export let highlightActiveLineGutter = true;

  // For merge view props
  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string; // New content to show in merge view
  let originalContent = value; // Store the original content for comparison

  const dispatch = createEventDispatcher();

  let componentClass = "";
  const languageConf = new Compartment();
  const lintConf = new Compartment(); // Compartment for linting
  const mergeConf = new Compartment(); // Compartment for diff/merge view
  const themeConf = new Compartment(); // Compartment for theme
  const setupConf = new Compartment(); // Compartment for basic setup
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;

  // Function to update the editor view when changes occur
  const updateExtensionView = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const isAutoChange = update?.transactions?.some((transaction) =>
        transaction?.annotations?.some((annotation) => annotation?.autoChange),
      );
      if (!isAutoChange) {
        // only hits for input, blur etc type of events.
        const content = update.state.doc.toString(); // Get the new content
        cursorPosition = update.state.selection.main.head;
        dispatch("change", content); // Dispatch the new content to parent.
      }
    }
  });

  const keyBindings = keymap.of([
    {
      key: "Enter",
      run: () => {
        return true;
      },
      preventDefault: true,
    },
  ]);

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

  // Create diagnostics based on the error message
  function createDiagnostics(doc: string): Diagnostic[] {
    if (isErrorVisible && errorMessage) {
      return [
        {
          from: errorStartIndex,
          to: errorEndIndex,
          message: errorMessage,
          severity: "error",
        },
      ];
    }
    return [];
  }

  const lintExtension = linter((view) =>
    createDiagnostics(view.state.doc.toString()),
  );

  function initalizeCodeMirrorEditor(value: string) {
    const editorOptions = {
      showLineNumbers,
      highlightActiveLine,
      highlightActiveLineGutter,
    };

    let extensions: Extension[];
    extensions = [
      ...(isEnterKeyNotAllowed ? [keyBindings] : []),
      setupConf.of(getBasicSetup(editorOptions)),
      themeConf.of(getTheme(editorOptions)),
      expressionPlugin,
      dragDropPlugin,
      languageConf.of([]),
      lintConf.of([]), // Add lint compartment
      mergeConf.of([]), // Initialize empty merge compartment
      updateExtensionView,
      EditorView.lineWrapping, // Enable line wrapping
      EditorState.readOnly.of(!isEditable ? true : false),
      CreatePlaceHolder(placeholder),
    ];

    // Removing window style space(\r\n) to find correct cursor position
    let sanitizedValue = value?.includes("\r\n")
      ? value.replace(/\r\n/g, "\n")
      : value;

    let state = EditorState.create({
      doc: value,
      extensions: extensions,
      selection: autofocus
        ? { anchor: sanitizedValue.length, head: sanitizedValue.length }
        : { anchor: 0, head: 0 },
    });

    codeMirrorView = new EditorView({
      parent: codeMirrorEditorDiv,
      state: state,
    });

    if (autofocus && isEditable) {
      setTimeout(() => {
        codeMirrorView.focus();
        codeMirrorView.dispatch({
          effects: EditorView.scrollIntoView(value.length),
        });
      }, 100);
    }
    setTimeout(() => {
      dispatcher = codeMirrorView;
    }, 100);
  }

  function destroyCodeMirrorEditor() {
    if (codeMirrorView) {
      codeMirrorView.destroy(); // Destroy the editor view
    }
  }

  function updateLinting() {
    // Reconfigure linting dynamically based on `isErrorVisible` and `errorMessage`
    if (codeMirrorView) {
      codeMirrorView.dispatch({
        effects: lintConf.reconfigure(
          isErrorVisible && errorMessage ? [lintExtension] : [],
        ),
      });
    }
  }

  onMount(() => {
    initalizeCodeMirrorEditor(value);
    // Attach keydown listener to prevent global search when inside CodeMirror
    codeMirrorEditorDiv.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.stopPropagation();
      }
    });
    originalContent = value; // Store initial content as original
  });

  // Run whenever component state changes
  afterUpdate(() => {
    // Handling the mergeview state while component state changes
    if (!isMergeViewEnabled && value !== codeMirrorView.state.doc.toString()) {
      let sanitizedValue = value?.includes("\r\n")
        ? value.replace(/\r\n/g, "\n")
        : value;

      codeMirrorView.dispatch({
        changes: {
          from: 0,
          to: codeMirrorView.state.doc.length,
          insert: value,
        },
        selection: autofocus
          ? { anchor: sanitizedValue.length, head: sanitizedValue.length }
          : { anchor: 0, head: 0 },
        annotations: [{ autoChange: true }],
      });

      if (autofocus && isEditable) {
        codeMirrorView.focus();
        codeMirrorView.dispatch({
          effects: EditorView.scrollIntoView(value.length),
        });
      }
    }

    handleCodeMirrorSyntaxFormat(
      codeMirrorView,
      languageConf,
      lang,
      isFormatted,
      value,
      beautifySyntaxCallback,
    );

    updateLinting(); // Update linting whenever the component updates
  });

  // Run whenever isBodyBeautified changes to format request body syntax
  $: {
    if (isBodyBeautified) {
      handleCodeMirrorSyntaxFormat(
        codeMirrorView,
        languageConf,
        lang,
        true,
        value,
        beautifySyntaxCallback,
      );
    }
  }

  onDestroy(() => {
    destroyCodeMirrorEditor(); // Call destroyCodeMirrorEditor when component is being destroyed
  });
</script>

<div
  class={`${componentClass} basic-codemirror-editor ${isMergeViewEnabled ? "merge-view" : ""}`}
  bind:this={codeMirrorEditorDiv}
/>

<MergeView
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

  :global(.cm-expression-block) {
    height: 20px;
  }

  :global(.cm-expression-block-close-img) {
    padding-left: 1px;
    border-left: 1px solid var(--border-ds-neutral-50);
    margin-bottom: 1px;
  }
  :global(.cm-expression-block-img) {
    margin-bottom: 2px;
  }
  :global(.cm-expression-block-close-span) {
    align-content: center;
    margin: 0px;
  }
</style>
