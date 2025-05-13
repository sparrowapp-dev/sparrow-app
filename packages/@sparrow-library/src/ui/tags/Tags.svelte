<script lang="ts">
  export let type:
    | "cyan"
    | "purple"
    | "yellow"
    | "green"
    | "orange"
    | "grey"
    | "pink" = "grey";
  export let text: string = "Tag";
  export let iconSize = 16;
  export let endIcon;

  const convertCasing = (sentence: string) => {
    let sen =
      sentence?.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    let total_words = sen.split(" ");
    if (total_words.length > 5) sen = total_words.slice(0, 5).join(" ") + "...";
    return sen;
  };

  const colorPalette = {
    cyan: {
      text: "var(--text-ds-info-300)",
      bg: "var(--bg-ds-info-900)",
      border: "var(--border-ds-info-700)",
    },
    purple: {
      text: "var(--text-ds-secondary-200)",
      border: "var(---ds-secondary-700)",
      bg: "var(--border-ds-secondary-900)",
    },
    yellow: {
      bg: "var(--bg-ds-warning-900)",
      text: "var(--text-ds-warning-300)",
      border: "var(--border-ds-warning-700)",
    },
    green: {
      bg: "var(--bg-ds-success-900)",
      text: "var( --text-ds-success-300)",
      border: "var(--border-ds-success-700)",
    },
    orange: {
      bg: "var(--bg-ds-tertiary-900)",
      text: "var(--text-ds-tertiary-300)",
      border: "var(--border-ds-tertiary-700)",
    },
    grey: {
      bg: "var(--bg-ds-neutral-700)",
      text: "var(--text-ds-neutral-200)",
      border: "var(--border-ds-neutral-500)",
    },
    pink: {
      bg: "var(--bg-ds-accent-900)",
      text: "var(--text-ds-accent-300)",
      border: "var(--border-ds-accent-700)",
    },
  };
</script>

<button
  style="
    background-color: {colorPalette[type]?.bg};
    color: {colorPalette[type]?.text};
    border: 1px solid {colorPalette[type]?.border};
    border-radius: 2px;
    padding: 0px 4px;
    height: 18px;
    text-align: center;
    font-family: Inter, sans-serif;
    width: fit-content;
    max-width: 188px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;"
  class="text-ds-font-weight-medium text-ds-line-height-150 text-ds-font-size-12 d-flex align-items-center"
>
  <span class={endIcon ? "text-content" : ""}>{convertCasing(text)}</span>
  {#if endIcon}
    <svelte:component
      this={endIcon}
      height={`${iconSize}px`}
      width={`${iconSize}px`}
      size={`${iconSize}px`}
      useParentColor={true}
      class="end-icon"
    />
  {/if}
</button>

<style>
  .text-content {
    margin-right: 4px; /* Add space between text and icon */
  }

  .end-icon {
    flex-shrink: 0; /* Prevent the icon from shrinking */
  }
</style>
