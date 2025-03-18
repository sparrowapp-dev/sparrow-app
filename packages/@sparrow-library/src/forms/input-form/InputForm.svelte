<script lang="ts">
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

  let fontSize = size === "small" ? "12px" : "14px";
</script>

<div class="input-container">
  <!-- Label & Support Text -->
  <div class="label-section">
    <div class="label-wrapper" style="width: {width};">
      <label
        for={inputLabelId}
        class="label-header-text-{variant}"
        style="font-size: {fontSize};"
      >
        {headerLabelText}
      </label>
      {#if inputValueRequired}
        <span class="required-mark-{variant}">*</span>
      {/if}
    </div>
    {#if supportLabelText}
      <p class="support-label-text-{variant}" style="font-size: 12px;">
        {supportLabelText}
      </p>
    {/if}
  </div>

  <!-- Input Field -->
  <div class="input-wrapper">
    <slot />
  </div>

  <!-- Help Label -->
  {#if helpLabel}
    <div
      class="help-wrapper"
      style={helpIcon !== ""
        ? "margin-left: 2px;"
        : "gap: 4px; margin-left: 2px;"}
    >
      {#if helpIcon}
        <svelte:component
          this={helpIcon}
          size="16px"
          useParentColor={true}
          color={isError
            ? "var(--icon-ds-danger-300)"
            : "var(--icon-ds-neutral-400)"}
        />
      {/if}
      {#if isError}
        <p class="help-label-error" style="font-size: 12px;">
          {errorMessage}
        </p>
      {:else if helpLabelValue}
        <p class="help-label-text-{variant}" style="font-size: 12px;">
          {helpLabelText}
        </p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .required-mark-primary {
    color: var(--text-ds-danger-400);
  }

  .support-label-text-primary {
    margin: 0;
    color: var(--text-ds-neutral-400);
  }
  .label-header-text-primary {
    font-family: "Inter", sans-serif;
    font-weight: 400;
    color: var(--text-ds-neutral-200);
  }

  .help-label-text-primary {
    margin: 0;
    color: var(--text-ds-neutral-400);
  }

  .help-label-error {
    margin: 0;
    color: var(--text-ds-danger-300);
  }
  .input-container {
    display: flex;
    flex-direction: column;
    max-width: 540px;
    min-width: 240px;
    gap: 8px;
  }

  .label-section {
    display: flex;
    flex-direction: column;
  }

  .label-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-bottom: 2px;
  }

  .help-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
  }
</style>
