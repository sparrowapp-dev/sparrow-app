<script lang="ts">
  import {FolderIcon} from "@sparrow/library/icons";

  export let onClick = () => {};
  export let icon = FolderIcon;
  export let iconProps = { color: "var(--text-ds-neutral-200)" , width: "16px" , height: "16px" };
  export let data = {};

</script>

<div class="request-item" on:click={() => onClick(data)}>
  <div class="request-method">
    <svelte:component this={icon} {...iconProps} />
  </div>
  <div class="request-details">
    <div class="request-header">
      <span class="request-title">{data?.name}</span>
      <span class="request-path">{data?.path}</span>
    </div>
    <span class="request-url">{data.url || ""}</span>
  </div>
</div>

<style>
  .request-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    margin-bottom: 2px;
    cursor: pointer;
  }

  .request-method {
    border-radius: 2px;
    background-color: var(--bg-ds-surface-500);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    padding: 4px;
    min-height: 24px;
    gap: 8px;
  }
  .icon {
    width: 16px;
    height: 16px;
  }

  .request-details {
    display: flex;
    flex-direction: column;
    min-width: 240px;
    flex: 1;
    gap: 3px;
  }

  .request-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .request-title {
    color: var(--text-ds-neutral-300);
    font:
      400 12px Inter,
      sans-serif;
    flex: 1 1 0;
    max-width: fit-content;
  }

  .request-path {
    color: var(--text-ds-neutral-500);
    font:
      400 12px Inter,
      sans-serif;
    flex: 2 1 0;
  }

  .request-url {
    color: var(--text-ds-primary-300);
    font:
      400 12px Inter,
      sans-serif;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: 100%;
  }
  .request-header span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 1;
  }

  .request-item:hover {
    background-color: var(--bg-ds-surface-400);
  }

  .request-item:hover .request-title {
    color: var(--text-ds-neutral-50);
  }

  .request-item:hover .request-path {
    color: var(--text-ds-neutral-300);
  }

  .request-item:hover .request-url {
    color: var(--text-ds-primary-300);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
