<script lang="ts">
  import { ChevronDownRegular, ChevronUpRegular } from "../../icons";
  import { Button } from "../button";
  import { fade } from "svelte/transition";
  import { cubicIn, cubicOut } from "svelte/easing";

  export let position: "left" | "right" = "left";
  export let labelText: string = "Accordion";
  export let isOpen: boolean = false;
  export let varient: "primary" | "secondary" = "primary";
  export let disabled: boolean = false;

  $: iconComponent = isOpen ? ChevronUpRegular : ChevronDownRegular;
</script>

<div>
  <!-- Accordion Header -->
  <div
    tabindex={0}
    class={`accordion-header d-flex align-items-center justify-content-normal gap-2 p-1 accordion-field-${varient} ${disabled ? "disabled" : ""}`}
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
  <div
    class={`p-3 accordion-content ${isOpen ? "open" : ""}`}
    style={`${isOpen ? "border-bottom-right-radius: 6px; border-bottom-left-radius: 6px;" : ""}`}
    transition:fade={{
      duration: isOpen ? 300 : 250,
      easing: isOpen ? cubicOut : cubicIn,
    }}
  >
    <div class="accordion-inner">
      <slot name="accordion-content" />
    </div>
  </div>
</div>

<style>
  /* Accordion Container Styles */
  .accordion-header {
    max-width: 840px;
    min-width: 240px;
    min-height: 36px;
  }

  .accordion-field-primary {
    background-color: var(--bg-ds-surface-500);
    border: 1px solid var(--border-ds-surface-400);
    cursor: pointer;
    outline: none;
    transition:
      background-color 0.3s ease,
      border 0.3s ease;
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

  .disabled .label-text {
    color: var(--text-ds-neutral-500) !important;
  }

  /* Accordion Content - Smooth Transition */
  .accordion-content {
    background-color: var(--bg-ds-surface-700);
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-5px);
    transition:
      max-height 0.3s ease-in-out,
      opacity 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }

  .accordion-content.open {
    max-height: 500px;
    opacity: 1;
    transform: translateY(0);
  }

  .accordion-inner {
    background-color: var(--bg-ds-surface-500);
  }

  /* Label text Styles */
  .label-text {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 14px;
    color: var(--text-ds-neutral-50);
  }
</style>
