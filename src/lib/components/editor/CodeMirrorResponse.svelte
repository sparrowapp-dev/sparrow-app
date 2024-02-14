<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from "svelte";
  import {
    RequestDataType,
    ResponseFormatter,
  } from "$lib/utils/enums/request.enum";
  import { isHorizontal } from "$lib/store/request-response-section";
  import { EditorView } from "codemirror";
  import { basicSetup, basicTheme } from "./codeMirrorTheme";
  import { EditorState, Compartment } from "@codemirror/state";
  import CodeMirrorViewHandler from "./CodeMirrorViewHandler";
  export let currentTabId: string;
  export let rawTab: RequestDataType;
  export let rawValue: string;
  export let formatter: string;
  let selectedTabId = currentTabId;
  const languageConf = new Compartment();
  let codeMirrorEditorDiv: HTMLDivElement;
  let codeMirrorView: EditorView;
  function initalizeCodeMirrorEditor(value: string) {
    let state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        basicTheme,
        languageConf.of([]),
        EditorState.readOnly.of(true),
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
    if (rawValue.toString() !== codeMirrorView.state.doc.toString()) {
      codeMirrorView.dispatch({
        changes: {
          from: 0,
          to: codeMirrorView.state.doc.length,
          insert: rawValue,
        },
      });
    }
    if (formatter === ResponseFormatter.PRETTY) {
      CodeMirrorViewHandler(codeMirrorView, languageConf, rawTab);
      if (rawTab === RequestDataType.JSON) {
        rawValue = JSON.stringify(JSON.parse(rawValue), null, 2);
        codeMirrorView.dispatch({
          changes: {
            from: 0,
            to: codeMirrorView.state.doc.length,
            insert: rawValue,
          },
        });
      }
    } else {
      codeMirrorView.dispatch({
        effects: languageConf.reconfigure([]),
      });
    }
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
    margin-left: 1%;
  }
</style>
