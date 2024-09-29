<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import type { WebSocketMessage } from "../../store/websocket";

  export let webSocket;
  let message = "";
  let language = webSocket.contentType;
  $: {
    if (webSocket) {
      language = webSocket.contentType;
      let uuid = webSocket?.body;
      message = currentMessage(uuid);
    }
  }

  const currentMessage = (uuid: string) => {
    if (webSocket) {
      const message = webSocket.messages.find(
        (message: WebSocketMessage) => message.uuid === uuid,
      );
      return message?.data;
    }
    return "";
  };
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
    bind:value={message}
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
