<script lang="ts">
  import { SparrowAIIcon } from "@library/icons";
  import { AISuggestionBox, PromptInput, ChatItem } from "../";
  import { AISparkle } from "../../assests";

  export let conversations = [];
  export let prompt = "";
  export let onUpdateAiPrompt;
  export let onUpdateAiConversation;
  export let onGenerateAiResponse;

  let isResponseGenerating = false;
  const sendPrompt = async (text: string) => {
    if (text) {
      isResponseGenerating = true;
      onUpdateAiConversation([
        ...conversations,
        {
          message: text,
          messageId: "",
          type: "SENDER",
          isLiked: false,
          isDisliked: false,
        },
      ]);
      const response = await onGenerateAiResponse(text, "", "");
      isResponseGenerating = false;
    }
  };
</script>

<div class="d-flex flex-column h-100 chat-box">
  <div style="flex:1; overflow:auto;">
    <div class="d-flex h-100 flex-column">
      <div class="p-2">
        <SparrowAIIcon />
        <span class="gradient-text">SparrowAI</span>
      </div>
      <div style="flex:1; overflow:auto;">
        <div
          class="d-flex flex-column h-100 align-items-center justify-content-center"
        >
          {#if !conversations?.length}
            <div
              class="h-100 p-3 w-100 d-flex flex-column justify-content-between"
            >
              <div></div>
              <div class="d-flex flex-column align-items-center">
                <AISparkle />
                <p class="text-fs-16 mb-1">Ask anything or write with AI</p>
                <p class="text-fs-12">
                  Use AI to Quickly search for any Information
                </p>
              </div>
              <div class="d-flex flex-column align-items-end">
                <AISuggestionBox
                  onClick={(text = "") => {
                    sendPrompt(text);
                  }}
                  title="Generate Curl"
                />
                <AISuggestionBox
                  onClick={(text = "") => {
                    sendPrompt(text);
                  }}
                  title="Generate Documentation"
                />
                <AISuggestionBox
                  onClick={(text = "") => {
                    sendPrompt(text);
                  }}
                  title="Generate Mock data"
                />
              </div>
            </div>
          {:else}
            <div class="h-100 w-100">
              {#each conversations as chat}
                <ChatItem
                  message={chat.message}
                  messageId={chat.messageId}
                  type={chat.type}
                />
              {/each}
              {#if isResponseGenerating}
                <p class="p-3 text-primary-300">... Generating</p>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
  <div>
    <PromptInput
      {prompt}
      {onUpdateAiPrompt}
      {isResponseGenerating}
      placeholder={"How can I help you?"}
      {sendPrompt}
    />
  </div>
</div>

<style>
  .chat-box {
    background-color: var(--bg-tertiary-750);
    border: 0.5px solid #5751fd;
    border-radius: 10px;
  }

  .gradient-text {
    background: linear-gradient(to right, #158ff1, #5751fd);
    -webkit-background-clip: text;
    color: transparent;
    font-size: 16px;
    font-weight: 600;
    padding-left: 8px;
  }
</style>
