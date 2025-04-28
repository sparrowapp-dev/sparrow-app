<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { basicSetup, basicTheme } from "./theme";
  import { EditorState, Compartment, type Extension } from "@codemirror/state";
  import handleCodeMirrorSyntaxFormat from "./editor";
  import { EditorView } from "codemirror";
  import { createEventDispatcher } from "svelte";
  import { placeholder as CreatePlaceHolder } from "@codemirror/view";
  import { linter } from "@codemirror/lint";
  import { Button, notifications } from "../../ui";
  import type { Diagnostic } from "@codemirror/lint";
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

  // For merge view props
  export let isMergeViewEnabled = false;
  export let isMergeViewLoading = false;
  export let newModifiedContent: string; // New content to show in merge view
  let hasChanges = false;
  let originalContent = value; // Store the original content for comparison
  let previousMergeViewState = isMergeViewEnabled;

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
        dispatch("change", content); // Dispatch the new content to parent.
        if (isMergeViewEnabled) checkForChanges();
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

    const modifiedContent = codeMirrorView.state.doc.toString();
    dispatch("change", modifiedContent);
    value = modifiedContent; // Update the original value with the modified content
    originalContent = modifiedContent; // Update internal state

    previousMergeViewState = false;
    isMergeViewEnabled = false;
    newModifiedContent = ""; // reset the content
    hasChanges = false;
    updateMergeView(); // Update the editor view
  };

  /**
   * Undo changes and revert to the original content
   * This function declines the changes and keeps the original value
   */
  const undoChanges = () => {
    console.log("in undoChanges() :>> 1");
    if (!isMergeViewEnabled || !codeMirrorView) return;
    console.log("in undoChanges() :>> 2");

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

    previousMergeViewState = false;
    isMergeViewEnabled = false;
    isMergeViewLoading = false;
    newModifiedContent = "";
    hasChanges = false;
    updateMergeView(); // Update the editor view
  };

  // Function to check if there are actual changes between original and current content
  function checkForChanges() {
    if (!codeMirrorView || !isMergeViewEnabled) {
      hasChanges = false;
      return;
    }
    const currentContent = codeMirrorView.state.doc.toString();
    hasChanges = newModifiedContent !== currentContent;

    // console.log("curr :>> ", currentContent);
    // console.log("new :>> ", originalContent);
    console.log("has changes 1 :>> ", hasChanges);
    if (!hasChanges) {
      console.log("has changes 2 :>> ", hasChanges);
      undoChanges(); // resetting the mergeview states and props
      notifications.success("You already have updated changes.");
    }
  }

  // Call this function whenever content might change
  $: if (codeMirrorView && isMergeViewEnabled) checkForChanges();

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
    console.log("in rec 1");
    previousMergeViewState = isMergeViewEnabled;

    if (isMergeViewEnabled) {
      console.log("in rec 1, in isMergeVeiwEnabled ? :>>");
      isMergeViewLoading = true;

      // Store current content as original
      originalContent = codeMirrorView.state.doc.toString();

      // Apply new content if provided
      if (newModifiedContent) {
        console.log("**** Applying the new content! ****");
        codeMirrorView.dispatch({
          changes: {
            from: 0,
            to: codeMirrorView.state.doc.length,
            insert: newModifiedContent,
          },
          annotations: [{ autoChange: true }],
        });

        // Update merge view
        updateMergeView();

        // Use setTimeout to allow the merge view to be rendered
        // This is a workaround since the operation isn't really async
        setTimeout(() => {
          isMergeViewLoading = false;
        }, 1000); // Adjust timing based on your needs
      }
    } else {
      console.log("in rec 1, in else isMergeVeiwEnabled ? :>>");
      console.log("***** Turning off the merge view *****");
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
    console.log("in rec 2 :>> ");
    console.log("**** Inserting new content ****");
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
    // checkForChanges();

    // Use setTimeout to allow the merge view to be rendered
    setTimeout(() => {
      isMergeViewLoading = false;
    }, 1000);
  }

  // Run whenever component state changes
  afterUpdate(() => {
    console.log("in afterupdate :>> ");

    // Handling the mergeview state while component state changes
    if (!isMergeViewEnabled && value !== codeMirrorView.state.doc.toString()) {
      console.log("in if of mergeview :>> ");

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
    // if (isMergeViewEnabled) {
    //   console.log("on destroy;");
    //   undoChanges();
    //   // isMergeViewEnabled = false;
    // }
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
