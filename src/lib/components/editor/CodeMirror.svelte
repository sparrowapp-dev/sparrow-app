<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import {
    basicSetup,
    basicTheme,
  } from "./code-mirror-themes/BasicCodeMirrorTheme";
  import { EditorState, Compartment, type Extension } from "@codemirror/state";
  import CodeMirrorViewHandler from "./CodeMirrorViewHandler";
  import { EditorView } from "codemirror";
  import { createEventDispatcher } from "svelte";

  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let isEditable = true;
  export let isFormatted = false;
  export let isBodyBeautified = false;
  export let onUpdateBeautifiedState: (value: boolean) => void;
  export { componentClass as class };

  const dispatch = createEventDispatcher();

  let componentClass = "";
  const languageConf = new Compartment();
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;

  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    dispatch("change", userInput);
  });

  function initalizeCodeMirrorEditor(value: string) {
    let extensions: Extension[];
    extensions = [
      basicSetup,
      basicTheme,
      updateExtensionView,
      languageConf.of([]),
      EditorView.lineWrapping, // Enable line wrapping
      EditorState.readOnly.of(!isEditable ? true : false),
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

  onMount(() => {
    initalizeCodeMirrorEditor(value);
  });

  afterUpdate(() => {
    CodeMirrorViewHandler(
      codeMirrorView,
      languageConf,
      lang,
      isFormatted,
      value,
      onUpdateBeautifiedState,
    );
  });

  $: {
    if (isBodyBeautified) {
      CodeMirrorViewHandler(
        codeMirrorView,
        languageConf,
        lang,
        true,
        value,
        onUpdateBeautifiedState,
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
