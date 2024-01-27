<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import { RequestDataType } from "$lib/utils/enums/request.enum";
  import { isHorizontal } from "$lib/store/request-response-section";
  import { EditorView } from "codemirror";
  import { basicSetup, basicTheme } from "./codeMirrorTheme";
  import { EditorState, Compartment } from "@codemirror/state";
  import CodeMirrorViewHandler from "./CodeMirrorViewHandler";
  export let currentTabId: string;
  export let rawTab: RequestDataType;
  export let rawValue: string;
  export let handleRawChange: (data: string) => void;
  let selectedTabId = currentTabId;
  const languageConf = new Compartment();
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;
  const updateExtensionView = EditorView.updateListener.of((update) => {
    const userInput = update.state.doc.toString();
    handleRawChange(userInput);
  });
  function initalizeCodeMirrorEditor(value: string) {
    let state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        basicTheme,
        updateExtensionView,
        languageConf.of([]),
      ],
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

<div id="code-editor" bind:this={codeMirrorEditorDiv} />

<style>
  #code-editor {
    width: 100%;
    height: calc(100vh - 360px);
    margin-right: 1%;
  }
</style>
