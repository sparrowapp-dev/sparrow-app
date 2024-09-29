<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import {
    RequestDataTypeEnum,
    ResponseFormatterEnum,
  } from "@sparrow/common/types/workspace";
  // import { SparrowLogo } from "../../assets/images";
  export let response;
  export let apiState;

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
      <!-- 
        --
        -- Reponse content-type set to image,
        -- 
      -->
      <!-- <SparrowLogo /> -->
    {:else if apiState.responseBodyFormatter === ResponseFormatterEnum.PREVIEW}
      <!-- 
        --
        -- Reponse content-type set to HTML preview,
        -- 
      -->
      <iframe
        srcdoc={response.body}
        style="width: 100%; height: calc(100% - 10px);"
      ></iframe>
    {:else}
      <!-- 
        --
        -- Reponse content-type set to HTML, JSON, XML, Javascript, Text,
        -- 
      -->
      <Editor
        bind:lang={language}
        bind:value={response.body}
        on:change={() => {}}
        isEditable={false}
        isFormatted={true}
      />{/if}
  </div>
</div>

<style>
  iframe {
    pointer-events: none;
  }

  .response-body {
    overflow-y: hidden;
    transition: overflow 0.3s ease-in-out;
  }

  .response-body:hover {
    overflow-y: auto;
  }
</style>
