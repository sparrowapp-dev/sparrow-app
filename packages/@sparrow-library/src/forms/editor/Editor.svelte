<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { basicSetup, basicTheme } from "./theme";
  import { EditorState, Compartment, type Extension } from "@codemirror/state";
  import handleCodeMirrorSyntaxFormat from "./editor";
  import { EditorView } from "codemirror";
  import { createEventDispatcher } from "svelte";
  import { placeholder as CreatePlaceHolder } from "@codemirror/view";
  import { linter } from "@codemirror/lint";
  import type { Diagnostic } from "@codemirror/lint";

  // Import the merge extensions **anish
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

  // New props for merge view **anish
  export let originalText = `{
   "title": "Introduce Sparrow Copilot for API error responses",
   "details": "We aim to help developers and QA engineers debug API responses by providing AI powered help in identifying possible root causes for the error responses. Design a seamless experience to help engineers debug the error responses. As a developer, I need a quick way to understand why the server is giving an error response. Key Considerations Provide contextual suggestions to improve discoverability of the feature The flow should be conversational so that the user can explore the next steps to resolve the error.Check the tech feasibility with the AI team.",
   "users": "cfsds123"
}`; // The original code to compare against
  export let showMergeView = true; // Toggle between regular editor and merge view

  const dispatch = createEventDispatcher();

  let componentClass = "";
  const languageConf = new Compartment();
  const lintConf = new Compartment(); // Compartment for linting
  const mergeConf = new Compartment(); // **anish
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;

  // Create merge extension **anish
  function createMergeExtension() {
    return unifiedMergeView({
      original: originalText,
      modified: value,
      highlightChanges: true,
      gutter: true,
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
      mergeConf.of([]), // **anish
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
    codeMirrorView.dispatch({
      effects: lintConf.reconfigure(
        isErrorVisible && errorMessage ? [lintExtension] : [],
      ),
    });
  }

  // **anish
  function updateMergeView() {
    if (codeMirrorView) {
      codeMirrorView.dispatch({
        effects: mergeConf.reconfigure(
          showMergeView ? [createMergeExtension()] : [],
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
  });

  // Run whenever component state changes
  afterUpdate(() => {
    // **anish
    if (
      !showMergeView &&
      value?.toString() !== codeMirrorView.state.doc?.toString()
    ) {
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
    updateMergeView(); // **anish
  });

  // **anish
  // Monitor for changes in the merge view configuration
  $: {
    if (codeMirrorView && (showMergeView || originalText)) {
      updateMergeView();
    }
  }

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
  class={`${componentClass} basic-codemirror-editor ${showMergeView ? "merge-view" : ""}`}
  bind:this={codeMirrorEditorDiv}
/>

<style>
  .basic-codemirror-editor {
    width: 100%;
    height: 100%;
    margin-right: 1%;
  }

  .merge-view :global(.cm-mergeOriginal) {
    background-color: rgba(255, 0, 0, 0.1);
  }

  .merge-view :global(.cm-mergeModified) {
    background-color: rgba(0, 255, 0, 0.1);
  }

  .merge-view :global(.cm-mergeLineAdded) {
    background-color: rgba(0, 255, 0, 0.9);
  }

  .merge-view :global(.cm-mergeLineDeleted) {
    background-color: rgb(190, 0, 0);
  }
</style>
