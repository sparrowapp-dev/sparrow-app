<script lang="ts">
  import { onMount } from "svelte";
  export let variant: "primary" = "primary";
  export let size: "small" | "medium" = "medium";
  export let inputValueRequired: boolean = false;
  export let width: string = "100%";
  export let inputLabelId: string = "";
  export let headerLabelText: string = "";
  export let supportLabelText: string = "";
  export let helpLabel: boolean = false;
  export let helpIcon: any = "";
  export let isError: boolean = false;
  export let errorMessage: string = "";
  export let helpLabelText: string = "";
  export let helpLabelValue: boolean = false;
  export let currentTextLength: number = 0;
  export let maxTextLength: number = 300;
  export let type: "input" | "textarea" = "input";
  export let maxLines: number = 4;
  let textElement: any;
  let isOverflowing: boolean = false;

  onMount(() => {
    if (textElement) {
      const lineHeight = parseInt(getComputedStyle(textElement).lineHeight);
      const maxHeight = lineHeight * maxLines;
      isOverflowing = textElement.scrollHeight > maxHeight;
    }
  });

  let fontSize =
    size === "small" ? "text-ds-font-size-12" : "text-ds-font-size-14";
</script>

<div class="input-container d-flex flex-column">
  <!-- Label & Support Text -->
  <div class="label-section d-flex flex-column">
    <div class="label-wrapper d-flex gap-1" style="width: {width};">
      <label
        for={inputLabelId}
        class="label-header-text-{variant} {fontSize} text-ds-font-weight-regular text-ds-line-height-143"
      >
        {headerLabelText}
      </label>
      {#if inputValueRequired}
        <span class="required-mark-{variant}">*</span>
      {/if}
    </div>
  </div>

  <!-- Input Field -->
  <div class="input-wrapper">
    <slot />
  </div>

  <!-- Help Label -->
  {#if helpLabel}
    <div class="help-wrapper d-flex justify-content-between">
      <div class="help-text-container">
        {#if helpIcon}
          <div class="icon-wrapper">
            <svelte:component
              this={helpIcon}
              size="16px"
              useParentColor={true}
              color={isError
                ? "var(--icon-ds-danger-300)"
                : "var(--icon-ds-neutral-400)"}
            />
          </div>
        {/if}

        <div class="text-content">
          {#if isError}
            <p
              bind:this={textElement}
              class="help-label-error text-clamp"
              style="--max-lines: {maxLines}"
              data-full-text={errorMessage}
            >
              {errorMessage}
            </p>
          {:else if helpLabelValue}
            <p
              bind:this={textElement}
              class="help-label-text-{variant} text-clamp"
              style="--max-lines: {maxLines}"
              data-full-text={helpLabelText}
            >
              {helpLabelText}
            </p>
          {:else if supportLabelText}
            <p
              bind:this={textElement}
              class="support-label-text-{variant} text-ds-font-size-12 text-clamp"
              style="--max-lines: {maxLines}"
              data-full-text={supportLabelText}
            >
              {supportLabelText}
            </p>
          {/if}
        </div>
      </div>

      {#if type === "textarea"}
        <div class="character-count">
          <p class="count-text" class:error={isError}>
            {maxTextLength - currentTextLength < 0
              ? 0
              : currentTextLength}/{maxTextLength}
          </p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .required-mark-primary {
    color: var(--text-ds-danger-400);
    font-family: "Inter", sans-serif;
  }

  .support-label-text-primary {
    margin: 0;
    color: var(--text-ds-neutral-400);
    font-family: "Inter", sans-serif;
  }
  .label-header-text-primary {
    font-family: "Inter", sans-serif;
    color: var(--text-ds-neutral-200);
  }

  .help-label-text-primary {
    margin: 0;
    color: var(--text-ds-neutral-400);
    font-family: "Inter", sans-serif;
  }

  .help-label-error {
    margin: 0;
    color: var(--text-ds-danger-300);
    font-family: "Inter", sans-serif;
  }
  .input-container {
    gap: 2px;
  }

  .label-wrapper {
    padding-bottom: 2px;
  }

  .help-wrapper {
    gap: 4px;
    margin-left: 2px;
    align-items: flex-start;
  }

  /* New styles for help label improvements */
  .help-text-container{
    display: flex;
    align-items: flex-start;
    gap: 6px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
  .icon-wrapper{
    flex-shrink: 0;
    margin-top: 1px;
  }
  .text-content{
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
  .text-clamp{
    font-size: 12px;
    margin: 0;
    line-height: 1.4;
    word-break: break-word;
    overflow-wrap: anywhere;
    hyphens: auto;
    display: -webkit-box;
    -webkit-line-clamp: var(--max-lines);
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-height: calc(var(--max-lines) * 1.4em);
  }
  .text-clamp.expanded {
    -webkit-line-clamp: none;
    max-height: none;
    overflow: visible;
  }
  .read-more-btn {
    background: none;
    border: none;
    color: var(--text-ds-primary-500, #0066cc);
    cursor: pointer;
    font-size: 11px;
    margin-top: 4px;
    padding: 0;
    text-decoration: underline;
    transition: color 0.2s ease;
    font-family: "Inter", sans-serif;
  }
  .read-more-btn:hover {
    color: var(--text-ds-primary-600, #0052a3);
  }
  .read-more-btn:focus {
    outline: 2px solid var(--border-ds-focus, #0066cc);
    outline-offset: 2px;
    border-radius: 2px;
  }
  .character-count {
    flex-shrink: 0;
    margin-left: 8px;
  }
  .count-text{
    margin: 0;
    font-size: 12px;
    font-family: "Inter", sans-serif;
    color: var(--icon-ds-neutral-400);
  }
  .count-text.error{
    color: var(--icon-ds-danger-300);
  }
</style>
