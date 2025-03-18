<script lang="ts">
  import { FolderIcon } from "@sparrow/library/icons";

  export let onClick = () => {};
  export let icon = FolderIcon;
  export let iconProps = {
    color: "var(--text-ds-neutral-200)",
    width: "16px",
    height: "16px",
  };
  export let data: {
    name?: string;
    path?: string;
    url?: string;
    isTitleHighLightEnable?: boolean;
    charsToBeHightlighted?: string;
  } = {};

  /**
   * Highlights a specific substring within a string by wrapping it in a highlight span
   * @param title - The full string to process
   * @param substring - The substring to highlight
   * @returns Array of segments with or without highlighting
   */
  function highlightSubstring(title: string, substring: string) {
    if (!title || !substring || substring.length === 0) {
      return [{ text: title || "", highlight: false }];
    }

    // Performs case-insensitive substring matching
    const lowerTitle = title.toLowerCase();
    const lowerSubstring = substring.toLowerCase();
    const index = lowerTitle.indexOf(lowerSubstring);

    if (index === -1) {
      return [{ text: title, highlight: false }];
    }

    // Breaks the title into segments (before match, match, after match)
    const result = [];

    // Add text before match
    if (index > 0) {
      result.push({ text: title.substring(0, index), highlight: false });
    }

    // Add highlighted text
    result.push({
      text: title.substring(index, index + substring.length),
      highlight: true,
    });

    // Add text after match
    if (index + substring.length < title.length) {
      result.push({
        text: title.substring(index + substring.length),
        highlight: false,
      });
    }

    return result;
  }
</script>

<div class="request-item" on:click={() => onClick()}>
  <div class="request-method">
    <svelte:component this={icon} {...iconProps} />
  </div>
  <div class="request-details">
    <div class="request-header">
      <span class="request-title">
        {#if data?.isTitleHighLightEnable && data?.charsToBeHightlighted && data?.name}
          <!-- Highlight specific substring -->
          {#each highlightSubstring(data.name, data.charsToBeHightlighted) as segment}
            {#if segment.highlight}
              <span class="highlight">{segment.text}</span>
            {:else}
              {segment.text}
            {/if}
          {/each}
        {:else}
          {data?.name}
        {/if}
      </span>
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
  .request-title .highlight {
    color: var(
      --text-ds-neutral-50
    ); /* White color for highlighted characters */
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
