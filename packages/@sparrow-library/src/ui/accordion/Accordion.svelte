<script lang="ts">
  import { ChevronDownRegular, ChevronUpRegular } from "../../icons";
  import { Button } from "../button";

  export let position: "left" | "right" = "left";
  export let labelText: string = "Accordion";
  export let isOpen: boolean = false;
  export let varient: "primary" | "secondary" = "primary";
  export let disabled: boolean = false;

  $: iconComponent = isOpen ? ChevronUpRegular : ChevronDownRegular;
</script>

<div style="max-width: 540px;">
  <!-- Accordion Header -->
  <div
    tabindex={0}
    class={`d-flex align-items-center justify-content-normal gap-2 p-1 accordion-field-${varient} ${disabled ? "disabled" : ""}`}
    style={isOpen
      ? "border-top-left-radius: 6px; border-top-right-radius: 6px;"
      : "border-radius: 6px;"}
    on:click={() => !disabled && (isOpen = !isOpen)}
    aria-disabled={disabled}
  >
    {#if position === "left"}
      <Button
        type="teritiary-regular"
        size="small"
        iconSize={16}
        startIcon={iconComponent}
        disable={disabled}
      />
    {/if}

    <div
      class="d-flex justify-content-between align-items-center w-100"
      style={position === "right" ? "margin-left: 6px;" : "margin-right:6px"}
    >
      <p class="label-text m-0">{labelText}</p>
      <slot name="accordion-field" />
    </div>

    {#if position === "right"}
      <Button
        type="teritiary-regular"
        size="small"
        startIcon={iconComponent}
        iconSize={16}
        disable={disabled}
      />
    {/if}
  </div>

  <!-- Accordion Content -->
  {#if isOpen}
    <div
      class="p-3 text-white accordion-content"
      style={`background-color: var(--bg-ds-surface-700); ${isOpen ? "border-bottom-right-radius: 6px; border-bottom-left-radius: 6px;" : ""}`}
    >
      <div style="background-color: var(--bg-ds-surface-500);">
        <slot name="accordion-content" />
      </div>
    </div>
  {/if}
</div>

<style>
  /* accordion container Styles */
  .accordion-field-primary {
    background-color: var(--bg-ds-surface-500);
    border: 1px solid var(--border-ds-surface-400);
    cursor: pointer;
    outline: none;
  }
  .accordion-field-primary:hover {
    background-color: var(--bg-ds-surface-400);
    border: 1px solid var(--border-ds-surface-50);
  }
  .accordion-field-primary:focus-visible {
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
    border-radius: 6px;
  }

  /* Disabled Styles */
  .disabled {
    background-color: var(--bg-ds-surface-700) !important;
    border: 1px solid var(--border-ds-surface-500) !important;
    cursor: not-allowed;
    pointer-events: none;
  }
  .disabled:focus-visible {
    background-color: var(--bg-ds-surface-400) !important;
    border: 2px solid var(--border-ds-primary-300) !important;
  }
  .disabled .label-text {
    color: var(--text-ds-neutral-500) !important;
  }

  /*Label text Styles */
  .label-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 14px;
    color: var(--text-ds-neutral-50);
  }
  .label-text:disabled {
    color: var(--text-ds-neutral-500);
  }
</style>
