<script lang="ts">
  import { SparrowAIIcon } from "@sparrow/common/icons";
  import { AISuggestionBox, PromptInput, ChatItem } from "../";
  import {
    AISparkle,
    CrossIcon,
    ChatHistoryRegular,
    EditRegular,
    BroomRegular,
    FormNewRegular,
  } from "@sparrow/library/icons";
  import { SparkleFilled } from "@sparrow/common/icons";
  import { cubicOut } from "svelte/easing";
  import { generatingImage, SparrowLogo } from "@sparrow/common/images";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import type { Conversation } from "@sparrow/common/types/workspace";
  import { fade, fly } from "svelte/transition";
  import {
    Button,
    Loader,
    Modal,
    notifications,
    Toggle,
    Tooltip,
  } from "@sparrow/library/ui";
  import { tick } from "svelte";
  import { type AiRequestExplorerData } from "@sparrow/workspaces/features/ai-request-explorer/store";
  import { Sleep } from "@sparrow/common/utils";

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
  export let responseData: AiRequestExplorerData;
  export let onChatClear;
  export let isChatAutoClearActive = false;
  let isChatLoadingActive = false;

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

  let isChatClearPopupOpened = false;
  const handleClosePopupBackdrop = (flag: boolean) => {
    isChatClearPopupOpened = flag;
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
                <ChatHistoryRegular size={"20px"} />
              </button>
              <span class="text-ds-font-size-12 fw-medium text-white"
                >Conversation</span
              >
              <!-- <button
                class="btn btn-sm p-1 d-flex align-items-center justify-content-center rounded-2 btn-transparent"
              >
                <EditRegular size={"12px"} color={"white"} />
              </button> -->
            </div>
            <div class="d-flex align-items-center gap-2">
              <Tooltip
                title={"Clears chat context after each message."}
                placement={"top-center"}
                zIndex={701}
                show={true}
              >
                <div class="d-flex align-items-center gap-2">
                  <Toggle
                    label={"Auto Clear"}
                    textColor={"var(--text-ds-neutral-100)"}
                    isActive={isChatAutoClearActive}
                    disabled={false}
                    onChange={async (event) => {
                      if (conversations?.length) {
                        onUpdateRequestState({
                          isChatAutoClearActive: event?.target.checked,
                        });
                        chatContainer.scrollTo({
                          top: 0,
                          behavior: "auto",
                        });
                        // handleClosePopupBackdrop(false);
                        isChatLoadingActive = true;
                        await new Sleep().setTime(1500).exec();
                        onChatClear();
                        isChatLoadingActive = false;
                      }

                      notifications.success(
                        event?.target.checked
                          ? "New prompts will now run in zero-shot mode with no chat history."
                          : "Chat history will now persist across prompts.",
                      );
                    }}
                  />
                </div>
              </Tooltip>

              <Tooltip title={"Clear chat"} placement={"top-center"}>
                <span class="add-icon-container">
                  <Button
                    id={`clear-chat-history`}
                    size="extra-small"
                    customWidth={"24px"}
                    type="teritiary-regular"
                    startIcon={BroomRegular}
                    disable={!conversations?.length}
                    onClick={async (e) => {
                      isChatClearPopupOpened = true;
                    }}
                  />
                </span>
              </Tooltip>

              <!-- <Tooltip
                title={"New Conversation"}
                placement={"left-center"}
                zIndex={701}
                show={true}
              >
                <span class="add-icon-container">
                  <Button
                    id={`start-new-conversation`}
                    size="extra-small"
                    customWidth={"24px"}
                    type="teritiary-regular"
                    startIcon={FormNewRegular}
                    onClick={async (e) => {}}
                  />
                </span>
              </Tooltip> -->
            </div>
          </div>
          <!-- <div
            class="d-flex flex-row gap-2 fw-medium justify-content-end p-1"
            style="font-size: 10px;"
          >
            <span style="color: var(--text-ds-success-300);"
              >{isResponseGenerating
                ? 0
                : conversations[conversations.length - 1]?.inputTokens || 0}
              input tokens</span
            >
            <span style="color: var(--text-ds-danger-300);"
              >{isResponseGenerating
                ? 0
                : conversations[conversations.length - 1]?.outputTokens || 0} output
              tokens</span
            >
          </div> -->

          <div
            class="d-flex flex-row gap-2 fw-medium justify-content-end p-1"
            style="font-size: 10px;"
          >
            <span style="color: var(--text-ds-success-300);">
              {isResponseGenerating
                ? 0
                : conversations
                    .filter((c) => c.type === "Sender")
                    .reduce((sum, c) => sum + (c.inputTokens || 0), 0)} input tokens
            </span>
            <span style="color: var(--text-ds-danger-300);">
              {isResponseGenerating
                ? 0
                : conversations
                    .filter((c) => c.type === "Receiver")
                    .reduce((sum, c) => sum + (c.outputTokens || 0), 0)} output tokens
            </span>
          </div>
        </div>

        <div
          bind:this={chatContainer}
          class="my-2 position-relative"
          style="flex:1; overflow-x:hidden; overflow-y:auto;"
        >
          {#if isChatLoadingActive}
            <div
              class="d-flex align-items-center justify-content-center w-100 h-100"
              style="z-index:3; position:absolute;"
            >
              <Loader loaderSize={"20px"} />
            </div>
          {/if}

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
                    <!-- <SparkleFilled height={"28px"} width={"28px"} /> -->
                    <SparrowLogo width={"116"} height={"120px"} />
                  </span>
                  <p
                    class="text-ds-font-size-14 text-ds-line-height-150 text-ds-font-weight-medium text-secondary-250 mb-0"
                    style="letter-spacing: 0; color: var(--text-ds-neutral-500);"
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
                      aiResponseMetrices={{
                        response: {
                          messageId: chat.messageId,
                          inputTokens: chat.inputTokens,
                          outputTokens: chat.outputTokens,
                          totalTokens: chat.totalTokens,
                          statusCode: chat.statusCode,
                          time: chat.time,
                          modelProvider: chat.modelProvider,
                          modelVariant: chat.modelVariant,
                        },
                      }}
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

<Modal
  title={"Delete Conversation"}
  type={"dark"}
  zIndex={1000}
  isOpen={isChatClearPopupOpened}
  width={"43%"}
  handleModalState={() => handleClosePopupBackdrop(false)}
>
  <div class="mt-2 mb-4">
    <p
      class="text-fs-14 text-ds-font-weight-medium text-ds-line-height-143"
      style="color: lightgray; letter-spacing: 0;"
    >
      This will permanently delete the current conversation. The system prompt
      will remain unchanged, but all previous user inputs and model responses
      will be cleared.<br /><br />
      Are you sure you want to proceed?
    </p>
  </div>

  <div class="d-flex justify-content-end gap-2">
    <Button
      title={"Cancel"}
      size={"medium"}
      customWidth={"95px"}
      type={"secondary"}
      onClick={() => {
        handleClosePopupBackdrop(false);
      }}
    ></Button>
    <Button
      title={"Delete"}
      size={"medium"}
      type={"danger"}
      customWidth={"95px"}
      onClick={async (e) => {
        chatContainer.scrollTo({
          top: 0,
          behavior: "auto",
        });
        handleClosePopupBackdrop(false);
        isChatLoadingActive = true;
        await new Sleep().setTime(1500).exec();
        onChatClear();
        notifications.success("Chat history cleared successfully.");
        isChatLoadingActive = false;
      }}
    ></Button>
  </div>
</Modal>

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
