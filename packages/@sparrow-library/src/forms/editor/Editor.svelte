<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { basicSetup, basicTheme } from "./theme";
  import { EditorState, Compartment, type Extension } from "@codemirror/state";
  import handleCodeMirrorSyntaxFormat from "./editor";
  import { EditorView } from "codemirror";
  import { createEventDispatcher } from "svelte";
  import { placeholder as CreatePlaceHolder } from "@codemirror/view";
  import { linter } from "@codemirror/lint";
  import { Button } from "../../ui";
  import type { Diagnostic } from "@codemirror/lint";

  // Import the merge extensions
  import { unifiedMergeView } from "@codemirror/merge";

  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" | "Graphql" =
    "Text";
  export let value = "";
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

  // For merge view - now as props
  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string; // New content to show in merge view

  let previousMergeViewState = isMergeViewEnabled;
  let originalContent = value; // Store the original content for comparison
  // let currentModifiedContent = ""; // Track the current modified content

  const dispatch = createEventDispatcher();

  let componentClass = "";
  const languageConf = new Compartment();
  const lintConf = new Compartment(); // Compartment for linting
  const mergeConf = new Compartment();
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
        // currentModifiedContent = content; // Update our tracking of modified content
        dispatch("change", content); // Dispatch the new content to parent.
      }
    }
  });

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
      basicSetup,
      basicTheme,
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
  const applyChanges = () => {
    if (!isMergeViewEnabled || !codeMirrorView) return;

    // Get the current modified content
    const modifiedContent = codeMirrorView.state.doc.toString();

    // Update the original value with the modified content
    value = modifiedContent;
    originalContent = modifiedContent; // Update internal state

    // Notify parent component of change
    // dispatch("change", modifiedContent);
    // dispatch("applyChanges", modifiedContent);

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

  onMount(() => {
    initalizeCodeMirrorEditor(value);

    originalContent = value; // Store initial content as original

    // Attach keydown listener to prevent global search when inside CodeMirror
    codeMirrorEditorDiv.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.stopPropagation();
      }
    });
  });

  // Handle changes to isMergeViewEnabled prop
  $: if (codeMirrorView && isMergeViewEnabled !== previousMergeViewState) {
    previousMergeViewState = isMergeViewEnabled;

    if (isMergeViewEnabled) {
      isMergeViewLoading = true;

      // Store current content as original
      originalContent = codeMirrorView.state.doc.toString();

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
        // currentModifiedContent = newModifiedContent;

        // Update merge view
        updateMergeView();

        // Use setTimeout to allow the merge view to be rendered
        // This is a workaround since the operation isn't really async
        setTimeout(() => {
          isMergeViewLoading = false;
        }, 1000); // Adjust timing based on your needs
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

    updateMergeView();
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
    // currentModifiedContent = newModifiedContent;
    updateMergeView();

    // Use setTimeout to allow the merge view to be rendered
    setTimeout(() => {
      isMergeViewLoading = false;
    }, 1000);
  }

  // Run whenever component state changes
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
    // If changes are not saved, then undo those changes before gettings destroyed
    if (isMergeViewEnabled) {
      console.log("on destroy;");
      undoChanges();
      // isMergeViewEnabled = false;
    }
    destroyCodeMirrorEditor(); // Call destroyCodeMirrorEditor when component is being destroyed
  });
</script>

<div
  class={`${componentClass} basic-codemirror-editor ${isMergeViewEnabled ? "merge-view" : ""}`}
  bind:this={codeMirrorEditorDiv}
/>

{#if isMergeViewEnabled}
  <div class="d-flex justify-content-end mt-3 me-0 gap-2">
    <Button
      title={"Keep the Changes"}
      type={"primary"}
      onClick={() => {
        "click applyChanges";
        applyChanges();
      }}
    ></Button>

    <Button
      title={"Undo"}
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

  /* .merge-view :global(.cm-activeLine), */
  .merge-view :global(.cm-changedLine) {
    background-color: #113b21;
  }

  .merge-view :global(.cm-deletedChunk) {
    background-color: #3d1514;
  }

  /* Specific styling for deleted text */
  .merge-view :global(.cm-deletedText) {
    background-color: #621b18;
  }

  /* Specific styling for added text */
  .merge-view :global(.cm-changedText) {
    background: #14522e !important;
  }

  .merge-view :global(.ͼw) {
    /* color: var(--editor-string-color); */
  }
</style>
