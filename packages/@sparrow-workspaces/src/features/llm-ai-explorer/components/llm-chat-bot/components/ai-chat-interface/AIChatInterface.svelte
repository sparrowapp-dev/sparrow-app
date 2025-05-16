<script lang="ts">
  import { SparrowAIIcon } from "@sparrow/common/icons";
  import { AISuggestionBox, PromptInput, ChatItem } from "../";
  import {
    AISparkle,
    CrossIcon,
    ChatHistoryIcon,
    EditRegular,
    BroomRegular,
    FormNewRegular,
  } from "@sparrow/library/icons";
  import { SparkleFilled } from "@sparrow/common/icons";
  import { cubicOut } from "svelte/easing";
  import { generatingImage } from "@sparrow/common/images";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import { Events } from "@sparrow/common/enums";
  import type { Conversation } from "@sparrow/common/types/workspace";
  import { fade, fly } from "svelte/transition";
  import { SparrowPrimaryIcon } from "@sparrow/common/icons";
  import { Modal, Toggle } from "@sparrow/library/ui";
  import { tick } from "svelte";
  import { StatusCode } from "@sparrow/common/utils";
  import {
    LLM_AI_ExplorerDataStore,
    type LLM_AI_ExplorerData,
  } from "@sparrow/workspaces/features/llm-ai-explorer/store";
  // import { isChatbotOpenInCurrTab } from "../../../../stores";

  export let conversations: Conversation[] = [];
  export let prompt = "";
  export let onUpdateAiPrompt;
  export let sendPrompt;
  export let isResponseGenerating;
  export let onToggleLike;
  export let regenerateAiResponse;
  export let onUpdateRequestState;
  export let onStopGeneratingAIResponse;
  export let handleApplyChangeOnAISuggestion;
  export let scrollList;
  export let responseData: LLM_AI_ExplorerData | undefined;
  export let modelVariant = "gpt-4os";

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
    const codeBlockTag = codeBlock.querySelector("code.hljs") as HTMLElement;
    if (codeBlockTag) codeBlockTag.style.maxWidth = "100%";
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
            class="d-flex justify-content-between align-items-center w-100"
            in:fade={{ duration: 200 }}
          >
            <div class="d-flex align-items-center gap-2">
              <button
                class="btn btn-sm p-1 d-flex align-items-center justify-content-center rounded-2"
                style="background-color: var(--bg-ds-surface-300); pointer-events: none;"
              >
                <ChatHistoryIcon size={"20px"} />
              </button>
              <span class="text-ds-font-size-12 fw-medium text-white"
                >Conversation</span
              >
              <button
                class="btn btn-sm p-1 d-flex align-items-center justify-content-center rounded-2 btn-transparent"
              >
                <EditRegular size={"12px"} color={"white"} />
              </button>
            </div>
            <div class="d-flex align-items-center gap-2">
              <!-- <div class="d-flex align-items-center gap-2">
        <span class="small text-white-50">Auto Clear</span>
        <Toggle isActive={false} disabled={false} onChange={() => {}} />
      </div> -->
              <div
                class="d-flex flex-row gap-2 text-ds-font-size-12 fw-medium"
                style="color: var(--text-ds-neutral-100);"
              >
                <span
                  >{responseData?.response.inputTokens || 0} input tokens</span
                >
                <span
                  >{responseData?.response.outputTokens || 0} output tokens</span
                >
              </div>
              <!-- <button class="btn btn-sm p-1 d-flex align-items-center justify-content-center rounded-2 btn-transparent">
        <BroomRegular size={"20px"} />
      </button>
      <button class="btn btn-sm d-flex align-items-center gap-1 rounded-2 border border-white-25 btn-transparent">
        <FormNewRegular name="document-add" size="18" />
        <span>New</span>
      </button> -->
            </div>
          </div>
        </div>

        <div
          bind:this={chatContainer}
          class="my-2"
          style="flex:1; overflow-x:hidden; overflow-y:auto;"
        >
          <div
            class="d-flex flex-column h-100 align-items-center justify-content-center"
          >
            {#if !conversations?.length}
              <div
                class="h-100 w-100 d-flex flex-column justify-content-center"
                in:fade={{ duration: 300 }}
              >
                <div class="d-flex flex-column align-items-center">
                  <span class="pb-3">
                    <SparkleFilled height={"28px"} width={"28px"} />
                  </span>
                  <p
                    class="text-ds-font-size-14 text-ds-line-height-150 text-ds-font-weight-semi-bold text-secondary-250 mb-0"
                    style="letter-spacing: -0.02em; color: var(--text-ds-neutral-500);"
                  >
                    Enter a prompt to start the conversation.
                  </p>
                </div>
              </div>
            {:else}
              <div class="h-100 w-100">
                {#each conversations as chat, index}
                  <div in:fade={{ duration: 200, delay: index * 50 }}>
                    <ChatItem
                      message={chat.message}
                      chatResponse={responseData}
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
                      {isResponseGenerating}
                      {handleApplyChangeOnAISuggestion}
                      {modelVariant}
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
        placeholder={"Write a prompt or generate one from generate prompt."}
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

  .btn-transparent {
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
  }

  .btn-transparent:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }
</style>
