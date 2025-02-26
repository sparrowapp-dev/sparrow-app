<script lang="ts">
  import { SparrowAIIcon } from "@sparrow/common/icons";
  import { AIChatBotIcon } from "@sparrow/library/icons";
  import { AISuggestionBox, PromptInput, ChatItem } from "../";
  import {
    AISparkle,
    CrossIcon,
    DismissRegular,
    AISparcleWhite,
  } from "@sparrow/library/icons";
  import { cubicOut } from "svelte/easing";
  import { generatingImage } from "@sparrow/common/images";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  import type { Conversation } from "@sparrow/common/types/workspace";
  import { fade, fly } from "svelte/transition";
  import { Button } from "@sparrow/library/ui";
  import { NavSparrow } from "@sparrow/library/icons";
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
        style="justify-content: space-between; align-items:center; height:32px; width:294.84px"
        in:fade={{ duration: 200 }}
      >
        <div class="p-2">
          <NavSparrow height={"32px"} width={"32px"} />
          <span class="gradient-text">Sparrow</span>
        </div>
        <!-- <div
          on:click={() =>
            onUpdateRequestState({
              isChatbotActive: false,
            })}
          class="close-btn d-flex align-items-center justify-content-center"
        >
          <CrossIcon height={"18px"} width={"18px"} color={"#8A9299"} />
        </div> -->
        <Button
          type={"teritiary-regular"}
          size="medium"
          startIcon={DismissRegular}
          onClick={() =>
            onUpdateRequestState({
              isChatbotActive: false,
            })}
        />
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
    position: relative;
    background-color: var(--bg-ds-surface-700);
    border-radius: 8px;
    padding: 16px 12px 16px 12px;
    min-width: 320px;
    max-width: 440px;
    min-height: 240px;
    max-height: 640px;
    /* padding: 8px; */
    isolation: isolate;
    gap: 16px;
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
    top: -97%;
    /* background-color: red; */
    background-color: var(--bg-ds-surface-700);
    width: 100%;
  }
  ::-webkit-scrollbar {
    /* width: 6px;  
  height: 10px; */
  }

  ::-webkit-scrollbar-track {
    /* background-color: var(--bg-ds-surface-100); */
  }

  /* Scrollbar handle (thumb) */
  ::-webkit-scrollbar-thumb {
    background-color: var(--bg-ds-surface-100);
    /* border-radius: 8px; */
  }
</style>
