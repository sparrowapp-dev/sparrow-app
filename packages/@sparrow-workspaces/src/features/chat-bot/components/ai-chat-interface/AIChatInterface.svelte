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
  import { Modal } from "@sparrow/library/ui";
  import { tick } from "svelte";

  export let conversations: Conversation[] = [];
  export let prompt = "";
  export let onUpdateAiPrompt;
  export let sendPrompt;
  export let isResponseGenerating;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let onUpdateRequestState;
  export let onStopGeneratingAIResponse;
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

  let isCodePreviewOpened = false;
  let codeBlockHtml = ""; // will hold HTML string for preview

  const handleCodePreview = async (codeBlock: HTMLElement) => {
    codeBlockHtml = codeBlock.outerHTML; // get its full HTML
    isCodePreviewOpened = true;

    await tick(); // ensure modal renders first
  };

  const handleCloseCodePreviewPopup = () => {
    isCodePreviewOpened = false;
    codeBlockHtml = ""; // clear after closing
  };

  export const setupCodeBlockForPreview = (node: HTMLElement, html: string) => {
    node.innerHTML = html;
    return {
      update(newHtml: string) {
        node.innerHTML = newHtml;
      },
    };
  };
</script>

<!-- Code Block Preview Modal -->
<Modal
  title="Code Preview"
  type="dark"
  zIndex={1000}
  isOpen={isCodePreviewOpened}
  width="37.5%"
  handleModalState={handleCloseCodePreviewPopup}
>
  <div
    class="message-wrapper mt-3"
    use:setupCodeBlockForPreview={codeBlockHtml}
  ></div>
</Modal>

<div class="ai-chat-panel h-100">
  <div
    class="d-flex flex-column h-100 chat-box"
    in:fly={{ y: 50, duration: 300, easing: cubicOut }}
    out:fly={{ y: 50, duration: 300, easing: cubicOut }}
  >
    <div style="flex:1; overflow:auto;">
      <div class="d-flex h-100 flex-column">
        <div class="chatbox-heading">
          <div
            class="d-flex"
            style="justify-content: space-between; align-items:center"
            in:fade={{ duration: 200 }}
          >
            <div class="">
              <SparrowPrimaryIcon
                height={"32px"}
                width={"32px"}
                color="var(--primary-btn-color)"
              />
              <span class="gradient-text">Sparrow AI</span>
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
        </div>

        <div
          bind:this={chatContainer}
          class="my-2"
          style="flex:1; overflow:auto;"
        >
          <div
            class="d-flex flex-column h-100 align-items-center justify-content-center"
          >
            {#if !conversations?.length}
              <div
                class="h-100 w-100 d-flex flex-column justify-content-between"
                in:fade={{ duration: 300 }}
              >
                <div></div>
                <div class="d-flex flex-column align-items-center">
                  <span class="pb-3">
                    <SparkleFilled height={"28px"} width={"28px"} />
                  </span>
                  <p
                    class="text-ds-font-size-16 text-ds-line-height-150 text-ds-font-weight-500 mb-1"
                    style="letter-spacing: -0.02em; color: var(--text-ds-neutral-100); font-weight: 500;"
                  >
                    Ask AI anything and get instant insights
                  </p>
                  <p
                    class="text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-500 text-secondary-250 mb-0"
                    style="letter-spacing: -0.02em; color: var(--text-ds-neutral-500); font-weight: 500;"
                  >
                    Generate mock data, debug errors, and explore solutions
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
                    title="Generate Mock Data"
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
                      onClickCodeBlockPreview={handleCodePreview}
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
          class="text-primary-300 generating-img d-flex justify-content-center align-items-center"
          in:fade={{ duration: 200 }}
        >
          <img src={generatingImage} style="width: 118px;" alt="" />
        </p>
      {/if}
      <PromptInput
        {prompt}
        {onUpdateAiPrompt}
        {isResponseGenerating}
        {onStopGeneratingAIResponse}
        placeholder={"How can I help you?"}
        {sendPrompt}
      />
    </div>
  </div>
</div>

<style>
  .ai-chat-panel {
    background-color: var(--bg-ds-surface-700);
    border-radius: 6px;
    border: 1px solid var(--bg-ds-surface-100);
    padding: 10px;
  }
  .chat-box {
    background-color: var(--bg-ds-surface-700);
  }

  .chatbox-heading {
    border-bottom: 1px solid var(--bg-ds-surface-100);
    padding-bottom: 6px;
  }

  .chat-box::before {
    content: "";
    position: absolute;
    inset: 0;
    padding: 1px;
    border-radius: 8px;
    pointer-events: none;
  }
  .gradient-text {
    background: white;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    font-size: 14px;
    font-weight: 400;
  }

  .close-btn {
    cursor: pointer;
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
    background-color: var(--bg-ds-surface-700);
    width: 100%;
    margin-bottom: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--bg-ds-surface-100);
  }
</style>
