<script lang="ts">
  import { Editor } from "@library/forms";

  export let webSocket;

  let language = webSocket.contentType;
  $: {
    if (webSocket) {
      language = webSocket.contentType;
    }
  }
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between w-100 h-100 response-body"
>
  <!-- 
          --
          -- Reponse content-type set to HTML, JSON, XML, Javascript, Text,
          -- 
        -->
  <Editor
    bind:lang={language}
    bind:value={webSocket.body}
    on:change={() => {}}
    isEditable={false}
    isFormatted={true}
    placeholder={"Select a request to get detail"}
  />
</div>

<style>
  iframe {
    pointer-events: none;
  }
</style>
