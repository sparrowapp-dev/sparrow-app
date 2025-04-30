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
  import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
  import { Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";
  import { RangeSetBuilder } from "@codemirror/state";

  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" | "Graphql" =
    "Text";
  export let value = "";
  export let customSuggestions = false;
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

  const dispatch = createEventDispatcher();

  let componentClass = "";
  const languageConf = new Compartment();
  const lintConf = new Compartment(); // Compartment for linting
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

  const variableHighlighter = ViewPlugin.fromClass(
    class {
      decorations;
      constructor(view: any) {
        this.decorations = this.buildDecorations(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }
      buildDecorations(view: EditorView) {
        const builder = new RangeSetBuilder();
        for (let { from, to } of view.visibleRanges) {
          const text = view.state.doc.sliceString(from, to);
          const regex = /{{(.*?)}}/g;
          let match;
          while ((match = regex.exec(text)) !== null) {
            const start = from + match.index + 2; // skip {{
            const end = from + match.index + match[0].length - 2; // skip }}
            builder.add(
              start,
              end,
              Decoration.mark({
                class: "cm-variable-highlight",
              }),
            );
          }
        }
        return builder.finish();
      }

      destroy() {}
    },
    {
      decorations: (v: any) => v.decorations,
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

  function dotCompletionSource(context: CompletionContext) {
    const before = context.matchBefore(/\./);
    if (!before || (before.from === context.pos && !context.explicit))
      return null;
    return {
      from: context.pos,
      options: suggestions,
    };
  }

  function initalizeCodeMirrorEditor(value: string) {
    let extensions: Extension[];
    extensions = [
      basicSetup,
      basicTheme,
      languageConf.of([]),
      lintConf.of([]), // Add lint compartment
      updateExtensionView,
      EditorView.lineWrapping, // Enable line wrapping
      EditorState.readOnly.of(!isEditable ? true : false),
      CreatePlaceHolder(placeholder),
      ...(customSuggestions
        ? [
            autocompletion({ override: [dotCompletionSource] }),
            variableHighlighter,
          ]
        : []), // Include autocompletion only if customSuggestions is true
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

  onMount(() => {
    initalizeCodeMirrorEditor(value);
    // Attach keydown listener to prevent global search when inside CodeMirror
    codeMirrorEditorDiv.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.stopPropagation();
      }
    });
    codeMirrorEditorDiv.addEventListener(
      "blur",
      () => {
        cursorPosition = null;
      },
      true,
    );
  });

  // Run whenever component state changes
  afterUpdate(() => {
    if (value?.toString() !== codeMirrorView.state.doc?.toString()) {
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
  class={`${componentClass} basic-codemirror-editor`}
  bind:this={codeMirrorEditorDiv}
/>

<style>
  .basic-codemirror-editor {
    width: 100%;
    height: 100%;
    margin-right: 1%;
  }
</style>
