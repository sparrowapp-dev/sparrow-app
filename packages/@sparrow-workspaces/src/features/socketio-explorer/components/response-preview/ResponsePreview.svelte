<script lang="ts">
  import { Editor } from "@sparrow/library/forms";
  import type { SocketIORequestMessageTabInterface } from "@sparrow/common/types/workspace/socket-io-request-tab";
  import * as Sentry from "@sentry/svelte";

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
        (message: SocketIORequestMessageTabInterface) => message.uuid === uuid,
      );
      let messageData = message?.data || "";
      try {
        let parse = JSON.parse(messageData);
        if (parse[1] === "(empty)") {
          return "\n";
        }
        messageData = `${parse[1]}`;
      } catch (e) {
        Sentry.captureException(e);
        console.error(e);
      }

      return messageData;
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
