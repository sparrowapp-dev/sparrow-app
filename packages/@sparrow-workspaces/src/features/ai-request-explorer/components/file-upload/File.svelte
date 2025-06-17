<script lang="ts">
  import {
    DismissCircleFilled,
    DocumentTextRegular,
  } from "@sparrow/library/icons";

  export let file: {
    id: string;
    name: string;
    type: string;
    size?: number;
  };
  export let onRemove: (fileId: string) => void;
</script>

<div class="file-chip">
  <div class="file-content">
    <div class="file-icon">
      <DocumentTextRegular size="16px" />
    </div>
    <div class="file-info">
      <span
        class="file-name text-ds-font-size-14 text-ds-font-weight-semi-bold text-ds-line-height-143 text-truncate"
        title={`file-${file.name}`}>{`${file.name}.pdf`}</span
      >
      {#if file.size}
        <span
          class="file-size text-ds-font-size-12 text-ds-font-weight-medium text-ds-line-height-150"
          >{`${file.size}MB`}</span
        >
      {/if}
    </div>
  </div>

  <button class="remove-btn" on:click|stopPropagation={() => onRemove(file.id)}>
    <DismissCircleFilled size="14px" />
  </button>
</div>

<style>
  .file-chip {
    position: relative;
    display: flex;
    align-items: center;
    background: linear-gradient(
      135deg,
      rgba(65, 72, 88, 0.12) 0%,
      rgba(65, 72, 88, 0.06) 100%
    );
    border: 1px solid var(--border-ds-surface-50);
    border-radius: 4px;
    padding: 8px;
    width: 200px;
    font-family: "Inter", sans-serif;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .file-chip:hover {
    /* border-color: var(--border-ds-surface-100); */
    box-shadow: 0 2px 8px var(--border-ds-surface-200);
  }

  .file-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    overflow: hidden;
  }

  .file-icon {
    background-color: var(--bg-ds-accent-400);
    border-radius: 6px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .file-name {
    font-family: Inter, sans-serif;
    color: var(--text-ds-primary);
    white-space: nowrap;
    overflow: hidden;
  }

  .file-size {
    color: var(--text-ds-neutral-200);
  }

  .remove-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    background: transparent;
    border: none;
    padding: 2px;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .remove-btn:hover {
    transform: scale(1.1);
  }

  .remove-btn:active {
    /* transform: scale(0.95); */
  }
</style>
