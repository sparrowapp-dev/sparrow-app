<script lang="ts">
  import CodeMirror from "$lib/components/editor/CodeMirror.svelte";
  import {
    RequestDataTypeEnum,
    ResponseFormatterEnum,
    type Response,
    type State,
  } from "@workspaces/shared/type";
  import { SparrowLogo } from "../../assets/images";
  export let response: Response;
  export let apiState: State;

  let language = apiState.responseBodyLanguage;
  $: {
    if (apiState) {
      if (apiState.responseBodyFormatter === "Raw") {
        language = RequestDataTypeEnum.TEXT;
      } else {
        language = apiState.responseBodyLanguage;
      }
    }
  }
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between w-100 h-100 response-body"
>
  <div
    class="w-100 position-relative {apiState.responseBodyFormatter ===
    ResponseFormatterEnum.PREVIEW
      ? 'h-100'
      : ''}"
  >
    {#if apiState.responseBodyLanguage === RequestDataTypeEnum.IMAGE}
      <img src={response.body} alt="" />
      <SparrowLogo />
    {:else if apiState.responseBodyFormatter === ResponseFormatterEnum.PREVIEW}
      <iframe
        srcdoc={response.body}
        style="width: 100%; height: calc(100% - 10px);"
      ></iframe>
    {:else}
      <CodeMirror
        bind:lang={language}
        bind:value={response.body}
        on:change={() => {}}
        codeMirrorStyle={"basic"}
        isEditable={false}
        isPretty={true}
      />
    {/if}
  </div>
</div>

<style>
  .response-body {
    overflow-y: scroll;
    overflow-x: hidden;
  }
</style>
