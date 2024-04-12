<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { RequestDataType } from "$lib/utils/enums/request.enum";
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

  export let currentTabId: string | undefined = undefined;
  export let rawTab: RequestDataType | undefined = undefined;
  export let rawValue: string | undefined = undefined;
  export let handleRawChange: (data: string) => void = () => {};
  export let codeMirrorStyle: "basic" | "url" = "basic";

  let componentClass = "";
  export { componentClass as class };

  let selectedTabId = currentTabId;
  const languageConf = new Compartment();
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;
  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    // rawValue = userInput;
    handleRawChange(userInput);
  });

  function initalizeCodeMirrorEditor(value: string) {
    let extensions: Extension[];
    if (codeMirrorStyle === "basic") {
      extensions = [
        basicSetup,
        basicTheme,
        updateExtensionView,
        languageConf.of([]),
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
    initalizeCodeMirrorEditor(rawValue);
  });
  afterUpdate(() => {
    if (selectedTabId !== currentTabId) {
      codeMirrorView.dispatch({
        changes: {
          from: 0,
          to: codeMirrorView.state.doc.length,
          insert: rawValue,
        },
      });
      selectedTabId = currentTabId;
    }
    CodeMirrorViewHandler(codeMirrorView, languageConf, rawTab);
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
