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
    DismissRegular,
    BotRegular,
  } from "@sparrow/library/icons";
  import { SparkleFilled } from "@sparrow/common/icons";
  import { cubicOut } from "svelte/easing";
  import { generatingImage, SparrowLogo } from "@sparrow/common/images";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  // import type { Ai, Conversation } from "@sparrow/common/types/workspace";
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
  import { ConversationHistoryItem } from "../../..";
  import type {
    AiWrapper,
    Ai,
    Conversation,
  } from "@sparrow/common/types/workspace/ai-request-tab";

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
  export let onClearConversation;
  export let isChatAutoClearActive = false;
  export let conversationsHistory;
  export let onOpenConversationHistoryPanel;
  export let onCloseConversationHistoryPanel;
  export let chatPanelTitle: string;
  export let onSwitchConversation;
  export let onRenameConversation;
  export let onDeleteConversation;
  export let isChatPanelLoadingActive;
  export let currTabAiInfo: Ai;

  let isRenaming = false;
  let newRequestName: string = "";
  let inputField: HTMLInputElement;
  let conversationHistoryPanelLoader = false;
  let isConversationHistoryPanelOpen = false;

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

  const handleOpenConversationHistoryPanel = async () => {
    await onOpenConversationHistoryPanel();
    isConversationHistoryPanelOpen = true;
  };
  const handleCloseConversationHistoryPanel = async () => {
    await onCloseConversationHistoryPanel();
    isConversationHistoryPanelOpen = false;
  };

  const handleRenameInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    newRequestName = target.value.trim();
  };

  const onRenameBlur = async () => {
    if (newRequestName) {
      onRenameConversation(currTabAiInfo.conversationId, newRequestName);
    }
    isRenaming = false;
    newRequestName = "";
  };

  const onRenameInputKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldFile",
      ) as HTMLInputElement;
      inputField.blur();
    }
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

<div
  class="ai-chatbot-panel d-flex flex-row h-100 align-items-center justify-content-between"
>
  <!-- Conversation History Panel -->
  {#if isConversationHistoryPanelOpen}
    <div
      class="conversation-history-panel d-flex flex-column h-100 px-2 py-2 gap-2"
    >
      <div
        class="conversation-history-header d-flex align-items-center justify-content-between mt-1"
      >
        <span
          class="history-title text-ds-font-size-14 text-ds-font-weight-semi-bold ms-1"
          >Conversation History</span
        >

        <Button
          size="extra-small"
          startIcon={DismissRegular}
          type="teritiary-regular"
          onClick={() => {
            handleCloseConversationHistoryPanel();
          }}
        />
      </div>

      <div
        class="conversation-list d-flex flex-column mt-2 gap-2 align-items-start justify-content-start flex-grow-1"
      >
        {#if conversationsHistory && conversationsHistory._data.conversations.length}
          {#each [...conversationsHistory._data.conversations].reverse() as conversation (conversation.id)}
            <ConversationHistoryItem
              currOpenedConversationId={currTabAiInfo.conversationId}
              {conversation}
              onSelectConversation={onSwitchConversation}
              {onRenameConversation}
              {onDeleteConversation}
            />
          {/each}
        {:else}
          <div
            class="empty-state d-flex flex-column align-items-center justify-content-center h-100 m-auto"
          >
            <div
              style="width: 200px;"
              class="d-flex flex-column align-items-center justify-content-center gap-2"
            >
              <div class="">
                <BotRegular
                  width={"24px"}
                  height={"30px"}
                  color={"var(--icon-ds-neutral-500)"}
                />
              </div>

              <p
                class="empty-text text-ds-font-size-14"
                style="font-family: Inter,sans-serif; color: grey"
              >
                No conversations yet
              </p>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
  <!-- <div style="width: 16px;"></div> -->

  <!-- ChatBot Panel -->
  <div
    class="ai-chat-panel h-100 {isConversationHistoryPanelOpen
      ? 'with-history'
      : 'full-width'}"
  >
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
              style="min-width: 0;"
            >
              <div
                class="d-flex align-items-center gap-1"
                style="flex: 1; min-width: 0;"
              >
                <span
                  style={isConversationHistoryPanelOpen
                    ? "border: 2px solid var(--border-ds-primary-300); border-radius: 4px; flex-shrink: 0;"
                    : "flex-shrink: 0;"}
                >
                  <Tooltip
                    title={isConversationHistoryPanelOpen
                      ? "Close chat history"
                      : " Open chat history"}
                    placement={"top-center"}
                  >
                    <Button
                      size="small"
                      startIcon={ChatHistoryRegular}
                      type={"secondary"}
                      loader={conversationHistoryPanelLoader}
                      onClick={async () => {
                        conversationHistoryPanelLoader = true;
                        isConversationHistoryPanelOpen =
                          !isConversationHistoryPanelOpen;
                        if (isConversationHistoryPanelOpen) {
                          await handleOpenConversationHistoryPanel();
                          conversationHistoryPanelLoader = false;
                        } else {
                          await handleCloseConversationHistoryPanel();
                          conversationHistoryPanelLoader = false;
                        }
                      }}
                    />
                  </Tooltip>
                </span>

                <!-- Chat Title with Edit Button -->
                <div
                  class="d-flex align-items-center gap-1"
                  style="flex: 1; min-width: 0;"
                >
                  {#if isRenaming}
                    <input
                      class="py-0 renameInputFieldFile text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
                      style="flex: 1; min-width: 0;"
                      id="renameInputFieldFile"
                      type="text"
                      maxlength={100}
                      value={chatPanelTitle}
                      on:click|stopPropagation={() => {}}
                      bind:this={inputField}
                      on:input={handleRenameInput}
                      on:blur={onRenameBlur}
                      on:keydown={onRenameInputKeyPress}
                    />
                  {:else}
                    <div
                      class="chat-panel-title"
                      style="color: var(--bg-ds-neutral-50); flex: 1; min-width: 0; max-width: 50%; overflow: hidden;"
                      on:click={() => {
                        // isRenaming = true;
                        // setTimeout(() => inputField.focus(), 100);
                      }}
                    >
                      <p
                        class="m-0 p-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-semi-bold"
                        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: Inter, sans-serif;"
                      >
                        {chatPanelTitle}
                      </p>
                    </div>
                  {/if}

                  <Tooltip title={"Edit Title"} placement={"top-center"}>
                    <div style="flex-shrink: 0;">
                      <div style="transform: scale(0.85);">
                        <Button
                          size="extra-small"
                          startIcon={EditRegular}
                          type="teritiary-regular"
                          disable={isRenaming}
                          onClick={() => {
                            isRenaming = true;
                            setTimeout(() => inputField.focus(), 100);
                          }}
                        />
                      </div>
                    </div>
                  </Tooltip>
                </div>
              </div>

              <div
                class="d-flex align-items-center gap-1"
                style="flex-shrink: 0;"
              >
                <Tooltip
                  title={"Clears chat context after each message."}
                  placement={"top-center"}
                  zIndex={701}
                  show={true}
                >
                  <div class="d-flex align-items-center">
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
                          await onClearConversation();
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
                </Tooltip>

                <Tooltip title={"New Conversation"} placement={"top-center"}>
                  <Button
                    id={`start-new-conversation-btn`}
                    title={"New"}
                    size="extra-small"
                    customWidth={"60px"}
                    buttonClassProp={""}
                    type={"teritiary-regular"}
                    startIcon={FormNewRegular}
                    onClick={async () => {
                      // Create new conversation with empty id and conversation array
                      onSwitchConversation("", "New Conversation", []);
                    }}
                  />
                </Tooltip>
              </div>
            </div>
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
                      .reduce((sum, c) => sum + (c.outputTokens || 0), 0)} output
                tokens
              </span>
            </div>
          </div>

          <div
            bind:this={chatContainer}
            class="my-2 position-relative"
            style="flex:1; overflow-x:hidden; overflow-y:auto;"
          >
            <!-- {#if isChatLoadingActive} -->
            {#if isChatPanelLoadingActive}
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
                        isLastRecieverMessage={conversations.length - 1 ===
                        index
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
        await onClearConversation();
        notifications.success("Chat history cleared successfully.");
      }}
    ></Button>
  </div>
</Modal>

<style>
  .ai-chatbot-panel {
    /* overflow-x: auto; */
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  .ai-chat-panel {
    background-color: var(--bg-ds-surface-700);
    border-radius: 6px;
    border: 1px solid var(--bg-ds-surface-100);
    padding: 10px;
    transition: all 0.3s ease;
    min-width: 0;
    overflow: hidden;
  }

  /* new - st*/

  /* Full width when history panel is closed */
  .ai-chat-panel.full-width {
    width: 100%;
    flex: 1;
  }

  /* Adjusted width when history panel is open */

  .ai-chat-panel.with-history {
    width: 59%;
    flex: 0 0 59%;
  }

  /* Conversation History Panel Styles */
  .conversation-history-panel {
    width: 40%;
    flex: 0 0 40%;
    transition: all 0.3s ease;
    background-color: var(--bg-ds-surface-600);
    border-right: 1px solid var(--border-ds-surface-200);
    border-radius: 8px;
    overflow: hidden;
    min-width: 0;
  }

  .history-title {
    font-family: Inter, sans-serif;
    color: var(--text-ds-neutral-100);
  }

  .conversation-list {
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    width: 100%;
  }

  /* Hide scrollbar completely while keeping scroll functionality */
  .conversation-list::-webkit-scrollbar {
    display: none;
  }
  .conversation-list {
    scrollbar-width: none;
  }

  /* Custom scrollbar styling */
  /* .conversation-list::-webkit-scrollbar {
    width: 4px;
  }
  .conversation-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .conversation-list::-webkit-scrollbar-thumb {
    background: var(--border-ds-surface-300);
    border-radius: 2px;
  }
  .conversation-list::-webkit-scrollbar-thumb:hover {
    background: var(--border-ds-surface-400);
  }
  .conversation-list {
    scrollbar-width: thin;
    scrollbar-color: var(--border-ds-surface-300) transparent;
  } */

  /* new - ed */

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

  .renameInputFieldFile {
    height: 24px;
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding: 4px 2px;
    outline: none;
    border-radius: 4px !important;
    border: 1px solid var(--bg-ds-primary-300);
    caret-color: var(--bg-ds-primary-300);
  }
  .renameInputFieldFile:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }

  .chat-panel-title {
    height: 24px;
    line-height: 18px;
    font-weight: 500;
    width: calc(100% - 58px);
    text-align: left;
    display: flex;
    align-items: center;
    padding: 2px 4px;
    caret-color: var(--bg-ds-primary-300);
  }
  .chat-panel-title:focus {
    border: 1px solid var(--bg-ds-primary-300) !important;
  }
  /* .chat-panel-title:hover {
    border: 1px solid var(--bg-ds-primary-300) !important;
    border-radius: 4px;
    cursor: text;
  } */
</style>
