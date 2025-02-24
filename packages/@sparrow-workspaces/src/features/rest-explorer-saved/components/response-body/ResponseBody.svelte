<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import {
    RequestDataTypeEnum,
    ResponseFormatterEnum,
  } from "@sparrow/common/types/workspace";
  export let response;
  export let apiState;
  export let onUpdateResponseBody;

  let language = apiState.bodyLanguage;
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
    {#if apiState.responseBodyFormatter === ResponseFormatterEnum.PREVIEW}
      <!-- 
        --
        -- Reponse content-type set to HTML preview,
        -- 
      -->
      <iframe srcdoc={response} style="width: 100%; height: calc(100% - 10px);"
      ></iframe>
    {:else}
      <!-- 
        --
        -- Reponse content-type set to HTML, JSON, XML, Javascript, Text,
        -- 
      -->
      <Editor
        bind:lang={language}
        bind:value={response}
        on:change={(e) => {
          onUpdateResponseBody(e.detail);
        }}
        isEditable={true}
        isFormatted={false}
      />{/if}
  </div>
</div>

<style>
  iframe {
    pointer-events: none;
  }
</style>
