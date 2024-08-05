<script lang="ts">
  import { SparrowAIIcon } from "@common/icons";
  import { AISuggestionBox, PromptInput, ChatItem } from "../";
  import { AISparkle, CrossIcon } from "@library/icons";
  import { cubicOut } from "svelte/easing";
  import { generatingImage } from "@common/images";
  import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
  import { Events } from "$lib/utils/enums";
  import type { Conversation } from "@common/types/workspace";

  export let conversations: Conversation[] = [];
  export let prompt = "";
  export let onUpdateAiPrompt;
  export let sendPrompt;
  export let isResponseGenerating;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let onUpdateRequestState;
  export let scrollList;

  /**
   * A Svelte transition function that animates elements sliding in and out.
   *
   * @param node - The DOM element to apply the transition to.
   * @param params - Configuration object for the transition.
   */
  const slide = (node: HTMLElement, { duration }: { duration: number }) => {
    return {
      duration,
      css: (t: number) => {
        const easing = cubicOut(t);
        const translateY = (1 - easing) * 20;
        return `
          transform: translateY(${translateY}%);

        `;
      },
    };
  };

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
  transition:slide={{ duration: 200 }}
>
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
            >
              <div></div>
              <div class="d-flex flex-column align-items-center">
                <span class="pb-3">
                  <AISparkle
                    height={"20px"}
                    width={"20px"}
                    color={"var(--icon-primary-300)"}
                  />
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
              {/each}
              {#if isResponseGenerating}
                <p class="p-3 text-primary-300">
                  <img src={generatingImage} style="width: 118px;" alt="" />
                </p>
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
  }
  .close-btn:hover {
    cursor: pointer;
    background-color: #37394e;
  }
</style>
