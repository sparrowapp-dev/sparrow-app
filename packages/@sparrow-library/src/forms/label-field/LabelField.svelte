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
  export let currentTextLength: number = 0;
  export let maxTextLength: number = 300;
  export let type: "input" | "textarea" = "input";

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
    <div
      class="help-wrapper d-flex justify-content-between"
      style={helpIcon !== ""
        ? "margin-left: 2px;"
        : "gap: 4px; margin-left: 2px;"}
    >
      <div>
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
        {:else if supportLabelText}
          <p class="support-label-text-{variant} text-ds-font-size-12">
            {supportLabelText}
          </p>
        {/if}
      </div>

      {#if type === "textarea"}
        <div>
          <p
            style="margin: 0; font-size: 12px; font-family: 'Inter', sans-serif; color:{isError
              ? 'var(--icon-ds-danger-300)'
              : 'var(--icon-ds-neutral-400)'}"
          >
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
  }
</style>
