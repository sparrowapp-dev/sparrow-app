<script lang="ts">
  import { SparrowAIIcon } from "@library/icons";
  import { AISuggestionBox, PromptInput, ChatItem } from "../";
  import { AISparkle, CloseIcon } from "../../assests";

  export let conversations = [];
  export let prompt = "";
  export let onUpdateAiPrompt;
  export let sendPrompt;
  export let isResponseGenerating;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let onUpdateRequestState;
</script>

<div class="d-flex flex-column h-100 chat-box">
  <div style="flex:1; overflow:auto;">
    <div class="d-flex h-100 flex-column">
      <div
        class="d-flex"
        style="justify-content: space-between; align-items:center"
      >
        <div class="p-2">
          <SparrowAIIcon height={"28px"} width={"28px"} />
          <span class="gradient-text">SparrowAI</span>
        </div>
        <div
          on:click={() =>
            onUpdateRequestState({
              isChatbotActive: false,
            })}
          class="close-btn"
        >
          <CloseIcon color={"#8A9299"} />
        </div>
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
                  title="Generate Mock Parameter Data"
                />
              </div>
            </div>
          {:else}
            <div class="h-100 w-100">
              {#each conversations as chat, index}
                <ChatItem
                  message={chat.message}
                  messageId={chat.messageId}
                  type={chat.type}
                  isLiked={chat.isLiked}
                  isDisliked={chat.isDisliked}
                  {onToggleLike}
                  {regenerateAiResponse}
                  isLastRecieverMessage={conversations.length - 1 === index
                    ? true
                    : false}
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

  .close-btn {
    cursor: pointer;
    margin-right: 10px;
    padding-left: 6px;
    padding-right: 6px;
    border-radius: 4px;
  }
  .close-btn:hover {
    cursor: pointer;
    background-color: #37394e;
  }
</style>
