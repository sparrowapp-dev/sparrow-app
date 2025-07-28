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
  let iframeRef: HTMLIFrameElement;

  function handleIframeLoad(): void {
    try {
      const iframeDoc: Document | null =
        iframeRef.contentDocument || iframeRef.contentWindow?.document || null;
      if (!iframeDoc) {
        console.warn("Cannot access iframe document");
        return;
      }
      iframeDoc.addEventListener(
        "click",
        (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
        },
        true,
      );
      iframeDoc.addEventListener(
        "mousedown",
        (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
        },
        true,
      );
    } catch (error: unknown) {
      console.error(
        "Cannot access iframe content due to cross-origin restrictions",
      );
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
      <iframe
        bind:this={iframeRef}
        srcdoc={response}
        style="width: 100%; height: calc(100%);"
        on:load={handleIframeLoad}
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
          // onUpdateResponseBody(e.detail);
        }}
        isEditable={false}
        isFormatted={true}
      />{/if}
  </div>
</div>

<style>
  iframe {
    /* pointer-events: none; */
  }
</style>
