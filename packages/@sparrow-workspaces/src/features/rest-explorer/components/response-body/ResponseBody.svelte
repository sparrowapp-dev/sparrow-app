<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import {
    RequestDataTypeEnum,
    ResponseFormatterEnum,
    type Response,
    type State,
  } from "@sparrow/common/types/workspace";
  import { SparrowLogo } from "../../assets/images";
  export let response: Response;
  export let apiState;

  let language = apiState.bodyLanguage;
  $: {
    if (apiState) {
      if (apiState.bodyFormatter === "Raw") {
        language = RequestDataTypeEnum.TEXT;
      } else {
        language = apiState.bodyLanguage;
      }
    }
  }
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between w-100 h-100 response-body"
>
  <div
    class="w-100 position-relative {apiState.bodyFormatter ===
    ResponseFormatterEnum.PREVIEW
      ? 'h-100'
      : ''}"
  >
    {#if apiState.bodyLanguage === RequestDataTypeEnum.IMAGE}
      <!-- 
        --
        -- Reponse content-type set to image,
        -- 
      -->
      <SparrowLogo />
    {:else if apiState.bodyFormatter === ResponseFormatterEnum.PREVIEW}
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
