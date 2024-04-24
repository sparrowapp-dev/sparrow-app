<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { isHorizontal } from "$lib/store/request-response-section";
  import {
    basicSetup,
    basicTheme,
  } from "./code-mirror-themes/BasicCodeMirrorTheme";
  import {
    UrlInputSetup,
    UrlInputTheme,
  } from "./code-mirror-themes/UrlInputCodeMirrorTheme";
  import { EditorState, Compartment, type Extension } from "@codemirror/state";
  import CodeMirrorViewHandler from "./CodeMirrorViewHandler";
  import { javascriptLanguage } from "@codemirror/lang-javascript";
  import { EditorView } from "codemirror";
  import { createEventDispatcher } from "svelte";

  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let codeMirrorStyle: "basic" | "url" = "basic";
  export let isEditable = true;
  export let isPretty = false;
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
    if (codeMirrorStyle === "basic") {
      extensions = [
        basicSetup,
        basicTheme,
        updateExtensionView,
        languageConf.of([]),
        EditorView.lineWrapping, // Enable line wrapping
        EditorState.readOnly.of(!isEditable ? true : false),
      ];
    } else if (codeMirrorStyle === "url") {
      extensions = [
        UrlInputSetup,
        UrlInputTheme,
        updateExtensionView,
        languageConf.of([javascriptLanguage]),
        EditorState.readOnly.of(!isEditable ? true : false),
      ];
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
  onMount(() => {
    initalizeCodeMirrorEditor(value);
  });
  afterUpdate(() => {
    CodeMirrorViewHandler(codeMirrorView, languageConf, lang, isPretty, value);
  });

  let isHorizontalMode: boolean;
  const isHorizontalUnsubscribe = isHorizontal.subscribe((value) => {
    isHorizontalMode = value;
  });

  onDestroy(() => {
    isHorizontalUnsubscribe();
  });
</script>

<div
  id="request-code-editor"
  class={`${componentClass} ${
    codeMirrorStyle === "url" ? "url-codemirror" : "basic-codemirror"
  }`}
  bind:this={codeMirrorEditorDiv}
/>

<style>
  #request-code-editor {
    width: 100%;
    margin-right: 1%;
  }

  .basic-codemirror {
    height: 100%;
  }

  .url-codemirror {
    min-height: 20px; /* Adjust as needed */
    max-height: 100px; /* Adjust as needed */
    overflow: auto;
  }
</style>
