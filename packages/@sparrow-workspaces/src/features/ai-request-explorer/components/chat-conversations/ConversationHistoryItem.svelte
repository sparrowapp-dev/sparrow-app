<script lang="ts">
  import type {
    ConversationsWrapper,
    Conversation,
  } from "@sparrow/common/types/workspace/ai-request-tab";
  import {
    DeleteRegular,
    EditRegular,
    MoreHorizontalRegular,
  } from "@sparrow/library/icons";
  import { Button, Modal, Options } from "@sparrow/library/ui";

  export let conversation: {
    id: string;
    title: string;
    timestamp: string;
    time?: string; // e.g., "12:45 AM"
    inputTokens?: number;
    outputTokens?: number;
    updatedBy?: string; // e.g., "GPT-4.0"
    isActive?: boolean;
  };
  export let onSelectConversation: (
    id: string,
    conversations: Conversation,
  ) => void;
  export let onDeleteConversation: (
    conversationId: string,
    conversationTitle: string,
  ) => void;
  export let onRenameConversation: (
    id: string,
    conversationTitle: string,
  ) => void;

  const handleSelect = () => {
    if (currOpenedConversationId === conversation.id) return;
    onSelectConversation(
      conversation.id,
      conversation.title,
      conversation.conversation,
    );
  };
  export let currOpenedConversationId: string;

  let isDeleteConversationPopupOpen = false;
  let isDeleteLoading = false;
  const handleDelete = async (e: Event) => {
    e.stopPropagation();
    await onDeleteConversation(conversation.id, conversation.title);
  };

  let showMenu = false;
  let chatItemTabWrapper: HTMLElement;
  let noOfColumns = 140;
  let isRenaming = false;
  let newRequestName: string = "";
  let inputField: HTMLInputElement;

  function rightClickContextMenu(event) {
    event.stopPropagation();
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  }
  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(`conversation-item-menu`);
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  const handleRenameInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    newRequestName = target.value.trim();
  };

  const onRenameBlur = async () => {
    if (newRequestName) {
      onRenameConversation(conversation.id, newRequestName);
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

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

<div
  class="conversation-item position-relative w-100 d-flex align-items-start justify-content-between p-2 rounded-2 cursor-pointer"
  class:active={currOpenedConversationId === conversation.id ? true : false}
  on:click={() => {
    handleSelect();
  }}
  role="button"
  tabindex="0"
>
  <div class="conversation-content flex-fill pe-2">
    <!-- Title -->
    {#if isRenaming}
      <input
        class="py-0 renameInputFieldFile text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        style="width: 70%"
        id="renameInputFieldFile"
        type="text"
        maxlength={100}
        value={conversation.title}
        on:click|stopPropagation={() => {}}
        bind:this={inputField}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div class="conversation-title text-truncate mb-1">
        {conversation.title}
      </div>
    {/if}
    <!-- <div class="conversation-title text-truncate mb-1">
      {conversation.title}
    </div> -->

    <!-- Metadata row -->
    <div class="d-flex align-items-center gap-2 flex-wrap">
      <!-- Tokens info -->
      {#if conversation.inputTokens !== undefined || conversation.outputTokens !== undefined}
        <div class="d-flex align-items-center gap-1">
          {#if conversation.inputTokens !== undefined}
            <span class="token-count input-tokens">
              {conversation.inputTokens} Input Tokens
            </span>
          {/if}
          {#if conversation.outputTokens !== undefined}
            <span class="token-count output-tokens">
              {conversation.outputTokens} Output Tokens
            </span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Bottom row with timestamp and updated by -->
    <div class="d-flex align-items-center justify-content-between mt-1">
      <div class="d-flex align-items-center gap-2">
        <!-- Timestamp -->
        <span class="conversation-timestamp">
          {conversation.date}
        </span>

        <!-- Time if available -->
        {#if conversation.time}
          <span class="conversation-time">
            {conversation.time}
          </span>
        {/if}
      </div>

      <!-- Updated by -->
      {#if conversation.authoredBy}
        <span class="updated-by">
          {`By ${conversation.authoredBy}`}
        </span>
      {/if}
    </div>
  </div>

  <button
    id={"conversation-item-menu"}
    bind:this={chatItemTabWrapper}
    class="delete-btn position-absolute btn p-0 rounded-1 d-flex align-items-center justify-content-center"
    on:click|stopPropagation={rightClickContextMenu}
  >
    <MoreHorizontalRegular size="12px" color="var(--icon-ds-neutral-100)" />
  </button>
</div>

{#if showMenu}
  <Options
    xAxis={chatItemTabWrapper.getBoundingClientRect().right - 10}
    yAxis={[
      chatItemTabWrapper.getBoundingClientRect().top - 0,
      chatItemTabWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={500}
    menuItems={[
      {
        onClick: () => {
          isRenaming = true;
          setTimeout(() => inputField.focus(), 100);
        },
        displayText: "Rename",
        disabled: false,
        hidden: false,
        icon: EditRegular,
        iconColor: "var(--sparrow-white)",
      },
      {
        onClick: () => {
          isDeleteConversationPopupOpen = true;
        },
        displayText: "Delete",
        disabled: false,
        hidden: false,
        icon: DeleteRegular,
        iconColor: "var(--icon-ds-danger-300)",
      },
    ]}
    {noOfColumns}
  />
{/if}

<Modal
  title={"Delete Conversation"}
  type={"dark"}
  zIndex={1000}
  isOpen={isDeleteConversationPopupOpen}
  width={"43%"}
  handleModalState={() => {
    isDeleteConversationPopupOpen = false;
  }}
>
  <div class="mt-2 mb-4">
    <p
      class="text-fs-14 text-ds-font-weight-medium text-ds-line-height-143"
      style="color: lightgray; letter-spacing: 0;"
    >
      This will permanently delete the conversation titled "<span
        style="color: var(--text-ds-neutral-50)"
        class="text-ds-font-weight-semi-bold">{conversation.title}</span
      >". This action cannot be undone, and you will no longer be able to access
      this conversation once it is deleted.
      <br /><br />
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
        isDeleteConversationPopupOpen = false;
      }}
    ></Button>
    <Button
      title={"Delete"}
      size={"medium"}
      type={"danger"}
      loader={isDeleteLoading}
      customWidth={"95px"}
      onClick={async (e) => {
        isDeleteLoading = true;
        await handleDelete(e);
        isDeleteLoading = false;
        isDeleteConversationPopupOpen = false;
      }}
    ></Button>
  </div>
</Modal>

<style>
  .conversation-item {
    transition: background-color 0.15s ease;
    cursor: pointer;
    /* margin: 0 4px 2px 0px; */
    background-color: var(--bg-ds-surface-500) !important;
  }

  /* .conversation-item:hover {
    background-color: var(--bg-ds-surface-800) !important;
  } */

  .conversation-item:not(.active):hover {
    background-color: var(--bg-ds-surface-800) !important;
  }

  .conversation-item.active {
    border: 0.5px solid var(--border-ds-primary-300) !important;
    cursor: default;
  }

  .conversation-title {
    font-family: Inter, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-ds-neutral-100);
    line-height: 1.2;

    /* height: 24px; */
    /* width: calc(100% - 58px);
    text-align: left;
    display: flex;
    align-items: center;
    padding: 0 4px;
    caret-color: var(--bg-ds-primary-300); */
  }
  .conversation-title:focus {
    outline: 0.5px solid var(--bg-ds-primary-300) !important;
  }

  .token-count {
    font-family: Inter, sans-serif;
    font-size: 9px;
    font-weight: 500;
    line-height: 1;
    padding: 2px 0px;
    border-radius: 3px;
    white-space: nowrap;
    color: #828282;
  }

  .input-tokens {
    /* color: var(--text-ds-success-400); */
    /* background-color: var(--bg-ds-success-900); */
  }

  .output-tokens {
    /* color: var(--text-ds-info-400); */
    /* background-color: var(--bg-ds-info-900); */
  }

  .conversation-timestamp {
    font-family: Inter, sans-serif;
    font-size: 10px;
    color: var(--text-ds-neutral-300);
    line-height: 1;
    font-weight: 500;
  }

  .conversation-time {
    font-family: Inter, sans-serif;
    font-size: 10px;
    color: var(--text-ds-neutral-300);
    line-height: 1;
    font-weight: 500;
  }

  .updated-by {
    font-family: Inter, sans-serif;
    font-size: 10px;
    color: var(--text-ds-surface-50);
    line-height: 1;
    font-weight: 500;
  }

  .delete-btn {
    background: none !important;
    border: none !important;
    opacity: 0;
    transition:
      opacity 0.15s ease,
      background-color 0.15s ease;
    top: 6px;
    right: 8px;
    width: 20px;
    height: 20px;
  }

  .conversation-item:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background-color: var(--bg-ds-surface-600) !important;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .renameInputFieldFile {
    height: 20px;
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding: 4px 2px;
    outline: none;
    border-radius: 4px !important;
    border: 1px solid var(--bg-ds-primary-300);
    caret-color: var(--bg-ds-primary-300);
  }
  .renameInputFieldFile:focus {
    outline: 0px solid var(--border-ds-primary-300) !important;
  }
</style>
