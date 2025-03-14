<script lang="ts">
  import { SparrowAIIcon } from "@sparrow/common/icons";
  import { AISuggestionBox, PromptInput, ChatItem } from "../";
  import { AISparkle, CrossIcon } from "@sparrow/library/icons";
  import { SparkleFilled } from "@sparrow/common/icons";
  import { cubicOut } from "svelte/easing";
  import { generatingImage } from "@sparrow/common/images";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  import type { Conversation } from "@sparrow/common/types/workspace";
  import { fade, fly } from "svelte/transition";
  import { SparrowPrimaryIcon } from "@sparrow/common/icons";

  export let conversations: Conversation[] = [];
  export let prompt = "";
  export let onUpdateAiPrompt;
  export let sendPrompt;
  export let isResponseGenerating;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let onUpdateRequestState;
  export let scrollList;

  let chatContainer: HTMLElement;
  /**
   * @description - scrolls the list container to top or bottom
   * @param position - decides the direction to scroll
   */
  const scroll = (
    _position: "bottom",
    _pixels: number,
    _behaviour: ScrollBehavior,
  ) => {
    if (_position === "bottom") {
      chatContainer.scrollTo({
        top: _pixels === -1 ? chatContainer.scrollHeight : _pixels,
        behavior: _behaviour,
      });
    }
  };

  /**
   * @description - triggers child function from parent component
   */
  $: scrollList = (
    _param: "bottom",
    _pixels: number,
    _behaviour: ScrollBehavior,
  ) => scroll(_param, _pixels, _behaviour);
</script>

<!-- <div class="d-flex flex-column h-100 chat-box"> -->
<div
  class="d-flex flex-column h-100 chat-box"
  in:fly={{ y: 50, duration: 300, easing: cubicOut }}
  out:fly={{ y: 50, duration: 300, easing: cubicOut }}
>
  <div style="flex:1; overflow:auto;">
    <div class="d-flex h-100 flex-column">
      <div
        class="d-flex"
        style="justify-content: space-between; align-items:center"
        in:fade={{ duration: 200 }}
      >
        <div class="p-2">
          <SparrowAIIcon height={"32px"} width={"32px"} />
          <span class="gradient-text">Sparrow</span>
        </div>
        <div
          on:click={() =>
            onUpdateRequestState({
              isChatbotActive: false,
            })}
          class="close-btn d-flex align-items-center justify-content-center"
        >
          <CrossIcon height={"18px"} width={"18px"} color={"#8A9299"} />
        </div>
      </div>

      <div bind:this={chatContainer} style="flex:1; overflow:auto;">
        <div
          class="d-flex flex-column h-100 align-items-center justify-content-center"
        >
          {#if !conversations?.length}
            <div
              class="h-100 p-3 w-100 d-flex flex-column justify-content-between"
              in:fade={{ duration: 300 }}
            >
              <div></div>
              <div class="d-flex flex-column align-items-center">
                <span class="pb-3">
                  <SparkleFilled height={"28px"} width={"28px"} />
                </span>
                <p class="text-fs-16 mb-1 text-secondary-180">
                  Ask anything or write with AI
                </p>
                <p class="text-fs-12 text-secondary-250">
                  Use AI to Quickly search for any Information
                </p>
              </div>
              <div class="d-flex flex-column align-items-end">
                <AISuggestionBox
                  onClick={(text = "") => {
                    sendPrompt(text);
                    MixpanelEvent(Events.AI_Int_Gen_Curl_Prompt);
                  }}
                  title="Generate Curl"
                />
                <AISuggestionBox
                  onClick={(text = "") => {
                    sendPrompt(text);
                    MixpanelEvent(Events.AI_Int_Gen_Doc_Prompt);
                  }}
                  title="Generate Documentation"
                />
                <AISuggestionBox
                  onClick={(text = "") => {
                    sendPrompt(text);
                    MixpanelEvent(Events.AI_Int_Gen_Mock_Prompt);
                  }}
                  title="Generate Mock Parameter Data"
                />
              </div>
            </div>
          {:else}
            <div class="h-100 w-100">
              {#each conversations as chat, index}
                <div in:fade={{ duration: 200, delay: index * 50 }}>
                  <ChatItem
                    message={chat.message}
                    messageId={chat.messageId}
                    type={chat.type}
                    status={chat.status}
                    isLiked={chat.isLiked}
                    isDisliked={chat.isDisliked}
                    {onToggleLike}
                    {regenerateAiResponse}
                    isLastRecieverMessage={conversations.length - 1 === index
                      ? true
                      : false}
                  />
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
  <div class="input-parent">
    {#if conversations?.length && isResponseGenerating}
      <p
        class="p-3 text-primary-300 generating-img"
        in:fade={{ duration: 200 }}
      >
        <img src={generatingImage} style="width: 118px;" alt="" />
      </p>
    {/if}
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
    background-color: var(--bg-ds-surface-700);
    border: 0.5px solid #5751fd;
    border-radius: 10px;
  }

  .chat-box::before {
    content: "";
    position: absolute;
    inset: 0;
    padding: 1px;
    border-radius: 8px;
    background: linear-gradient(
      90deg,
      var(--border-ds-info-400) 0%,
      var(--border-ds-primary-400) 50%,
      var(--border-ds-secondary-400) 100%
    );
    -webkit-mask:
      linear-gradient(white 0 0) content-box,
      linear-gradient(white 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    pointer-events: none;
  }
  .gradient-text {
    background: linear-gradient(to right, #158ff1, #5751fd);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    font-size: 16px;
    font-weight: 600;
    padding-left: 8px;
  }

  .close-btn {
    cursor: pointer;
    margin-right: 10px;
    height: 30px;
    width: 30px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }
  .close-btn:hover {
    cursor: pointer;
    background-color: #37394e;
  }

  .input-parent {
    position: relative;
  }

  .generating-img {
    position: absolute;
    top: -70%;
    background-color: var(--bg-ds-surface-700);
    width: 100%;
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--bg-ds-surface-100);
  }
</style>
