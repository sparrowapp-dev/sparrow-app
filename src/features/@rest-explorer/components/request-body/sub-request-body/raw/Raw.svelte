<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { RequestDataType } from "$lib/utils/enums/request.enum";
  import { isHorizontal } from "$lib/store/request-response-section";
  import {
    basicSetup,
    basicTheme,
  } from "$lib/components/editor/code-mirror-themes/BasicCodeMirrorTheme";
  import {
    UrlInputSetup,
    UrlInputTheme,
  } from "$lib/components/editor/code-mirror-themes/UrlInputCodeMirrorTheme";
  import { EditorState, Compartment, type Extension } from "@codemirror/state";
  import CodeMirrorViewHandler from "$lib/components/editor/CodeMirrorViewHandler";
  import { javascriptLanguage } from "@codemirror/lang-javascript";
  import { EditorView } from "codemirror";

  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let onUpdateRequestBody: (data: string) => void = () => {};
  export let codeMirrorStyle: "basic" | "url" = "basic";

  let componentClass = "";
  export { componentClass as class };

  const languageConf = new Compartment();
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;
  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    onUpdateRequestBody({ raw: userInput });
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
      ];
    } else if (codeMirrorStyle === "url") {
      extensions = [
        UrlInputSetup,
        UrlInputTheme,
        updateExtensionView,
        languageConf.of([javascriptLanguage]),
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
    CodeMirrorViewHandler(codeMirrorView, languageConf, lang);
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
    height: calc(100vh - 360px);
  }

  .url-codemirror {
    min-height: 20px; /* Adjust as needed */
    max-height: 100px; /* Adjust as needed */
    overflow: auto;
  }
</style>
