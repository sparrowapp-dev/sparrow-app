<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { basicSetup, basicTheme } from "./theme";
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
  import { Button, notifications } from "../../ui";
  import type { Diagnostic } from "@codemirror/lint";
  import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
  import { Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";
  import { RangeSetBuilder } from "@codemirror/state";
  import { MathFormulaFunction } from "@sparrow/library/assets";
  import { unifiedMergeView } from "@codemirror/merge";
  import { DismissIcon } from "@sparrow/library/assets";

  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" | "Graphql" =
    "Text";
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
  export let cursorPosition: number | null = null;
  export let handleOpenDE;
  export let dispatcher;

  // For merge view props
  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string; // New content to show in merge view
  let hasChanges = false;
  let originalContent = value; // Store the original content for comparison

  const dispatch = createEventDispatcher();

  let componentClass = "";
  const languageConf = new Compartment();
  const lintConf = new Compartment(); // Compartment for linting
  const mergeConf = new Compartment(); // Compartment for diff/merge view
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
      // readonly id: string,
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
          dispatch: view.dispatch,
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
    let extensions: Extension[];
    extensions = [
      ...(isEnterKeyNotAllowed ? [keyBindings] : []),
      basicSetup,
      basicTheme,
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

    let state = EditorState.create({
      doc: value,
      extensions: extensions,
    });
    codeMirrorView = new EditorView({
      parent: codeMirrorEditorDiv,
      state: state,
    });
    dispatcher = codeMirrorView.dispatch;
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
    // dispatch("undoChanges", originalContent); // Notify parent that changes were declined

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

  // Call this function whenever content might change
  $: if (codeMirrorView && isMergeViewEnabled) checkForChanges();

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

  // Utility function to create a delay
  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Show dummy loading
  const showSyncLoading = async (delay: number) => {
    isMergeViewLoading = true;
    await sleep(delay);
    isMergeViewLoading = false;
  };

  // Run whenever component state changes
  afterUpdate(() => {
    // Handling the mergeview state while component state changes
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

{#if hasChanges}
  <div class="d-flex justify-content-end mt-3 me-0 gap-2">
    <Button
      title={"Keep the Changes"}
      size={"small"}
      type={"primary"}
      onClick={() => {
        "click applyChanges";
        applyChanges();
      }}
    ></Button>

    <Button
      title={"Undo"}
      size={"small"}
      type={"secondary"}
      onClick={() => {
        "click undoChanges";
        undoChanges();
      }}
    ></Button>
  </div>
{/if}

<style>
  .basic-codemirror-editor {
    width: 100%;
    height: 100%;
    margin-right: 1%;
  }

  /* Style for customizing the css for codemirror merge view */

  /* styling for added row */
  .merge-view :global(.cm-changedLine) {
    background: var(--bg-ds-success-800);
  }

  /* styling for deleted row */
  .merge-view :global(.cm-deletedChunk) {
    background-color: var(--bg-ds-danger-800);
  }

  /* styling for deleted text */
  .merge-view :global(.cm-deletedText) {
    background-color: var(--bg-ds-danger-700);
  }

  /* styling for added text */
  .merge-view :global(.cm-changedText) {
    background: var(--bg-ds-success-700);
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
