<!-- <script lang="ts">
  import { DismissRegular } from "@sparrow/library/icons";

  export let conversation: {
    id: string;
    title: string;
    timestamp: string;
    isActive?: boolean;
  };
  export let onSelect: (id: string) => void;
  export let onDelete: (id: string) => void;

  const handleSelect = () => {
    onSelect(conversation.id);
  };

  const handleDelete = (e: Event) => {
    e.stopPropagation();
    onDelete(conversation.id);
  };

  $: {
    console.log(`Conversation Item: ${conversation},`);
  }
</script>

<div
  class="conversation-item"
  class:active={conversation.isActive}
  on:click={handleSelect}
  on:keydown={(e) => e.key === "Enter" && handleSelect()}
  role="button"
  tabindex="0"
>
  <div class="conversation-content">
    <div class="conversation-title">{conversation.title}</div>
    <div class="conversation-timestamp">{conversation.timestamp}</div>
  </div>
  <button
    class="delete-btn"
    on:click={handleDelete}
    title="Delete conversation"
  >
    <DismissRegular size="12px" color="var(--icon-ds-neutral-400)" />
  </button>
</div>

<style>
  .conversation-item {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 8px 12px;
    /* margin: 0 4px 2px 4px; */
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.15s ease;
    border: 1px solid transparent;
    position: relative;
  }

  .conversation-item:hover {
    background-color: var(--bg-ds-surface-800);
  }

  .conversation-item.active {
    background-color: var(--bg-ds-surface-700);
    border-color: var(--border-ds-primary-300);
  }

  .conversation-content {
    flex: 1;
    min-width: 0;
    padding-right: 8px;
  }

  .conversation-title {
    font-family: Inter, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-ds-neutral-100);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }

  .conversation-timestamp {
    font-family: Inter, sans-serif;
    font-size: 10px;
    color: var(--text-ds-neutral-500);
    line-height: 1;
  }

  .delete-btn {
    background: none;
    border: none;
    padding: 2px;
    border-radius: 3px;
    cursor: pointer;
    opacity: 0;
    transition:
      opacity 0.15s ease,
      background-color 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 6px;
    right: 8px;
  }

  .conversation-item:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background-color: var(--bg-ds-surface-600);
  }
</style> -->

<!-- ************************************************ -->
<script lang="ts">
  import { DismissRegular } from "@sparrow/library/icons";

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
  export let onSelect: (id: string) => void;
  export let onDelete: (id: string) => void;

  const handleSelect = () => {
    onSelect(conversation.id);
  };

  const handleDelete = (e: Event) => {
    e.stopPropagation();
    onDelete(conversation.id);
  };

  // setTimeout(() => {
  //   if (conversation) {
  //     // console.log(`Conversation Item:`, conversation.title);
  //   }
  // }, 5000);
</script>

<div
  class="conversation-item position-relative w-100 d-flex align-items-start justify-content-between p-2 rounded-2 cursor-pointer"
  class:active={conversation.isActive}
  on:click={handleSelect}
  on:keydown={(e) => e.key === "Enter" && handleSelect()}
  role="button"
  tabindex="0"
>
  <div class="conversation-content flex-fill pe-2">
    <!-- Title -->
    <div class="conversation-title text-truncate mb-1">
      {conversation.title}
    </div>

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

  <!-- Delete button -->
  <button
    class="delete-btn position-absolute btn p-1 rounded-1 d-flex align-items-center justify-content-center"
    on:click={handleDelete}
    title="Delete conversation"
  >
    <DismissRegular size="12px" color="var(--icon-ds-neutral-400)" />
  </button>
</div>

<style>
  .conversation-item {
    transition: background-color 0.15s ease;
    cursor: pointer;
    /* margin: 0 4px 2px 0px; */
    background-color: var(--bg-ds-surface-500) !important;
  }

  .conversation-item:hover {
    background-color: var(--bg-ds-surface-800) !important;
  }

  .conversation-item.active {
    /* background-color: var(--bg-ds-surface-500) !important; */
    /* border-color: var(--border-ds-primary-300) !important; */
  }

  .conversation-title {
    font-family: Inter, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-ds-neutral-100);
    line-height: 1.2;
  }

  .token-count {
    font-family: Inter, sans-serif;
    font-size: 9px;
    font-weight: 500;
    line-height: 1;
    padding: 2px 4px;
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
</style>
