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
  let imageHasError = false;
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between w-100 h-100 response-body"
>
  <div
    class="w-100 position-relative {apiState.bodyFormatter ===
    ResponseFormatterEnum.PREVIEW
      ? 'h-100 overflow-hidden'
      : ''}"
  >
    {#if apiState.bodyLanguage === RequestDataTypeEnum.IMAGE}
      {#if !imageHasError}
        <!-- render image from base64 -->
        <img
          loading="lazy"
          src={response.body}
          alt="Sparrow logo"
          on:error={() => (imageHasError = true)}
          style="max-width:100%;"
        />
      {:else}
        <!-- if any error render sparrow logo -->
        <div class="d-flex flex-column">
          <SparrowLogo />
          <span class="mt-2 text-secondary-200 fw-bold text-fs-14 mt-4"
            >Unable to load image</span
          >
        </div>
      {/if}
    {:else if apiState.bodyFormatter === ResponseFormatterEnum.PREVIEW}
      <!-- 
        --
        -- Reponse content-type set to HTML preview,
        -- 
      -->
      <iframe srcdoc={response.body} style="width: 100%; height: calc(100%);"
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
</style>
