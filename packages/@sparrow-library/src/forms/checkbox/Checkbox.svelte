<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let checked = false;
  export let disabled = false;
  export let type: "button-checkbox" | "button-checkbox-text" =
    "button-checkbox";
  export let size: "small" | "large" = "small";
  export let text = "";

  const dispatch = createEventDispatcher();

  const handleChange = (event: Event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    checked = !checked;
    dispatch("change", { checked });
  };

  if (checked) {
    console.log("checked");
  }

  $: containerClass = `custom-checkbox ${disabled ? "disabled" : ""} ${checked ? "checked" : ""} ${size} ${type}`;
</script>

<label class={containerClass} tabindex="0">
  <input
    type="checkbox"
    {checked}
    on:change={handleChange}
    on:click={(e) => {}}
    {disabled}
    aria-disabled={disabled}
  />
  <span
    class={`checkmark ${size} ${disabled ? "disabled" : ""} ${checked ? "checked" : ""}`}
  ></span>
  {#if type === "button-checkbox-text"}
    <span class="checkbox-text">{text}</span>
  {/if}
</label>

<style>
  .custom-checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    background-color: transparent;
  }

  /* Base disabled state */
  .custom-checkbox.disabled {
    cursor: not-allowed;
    pointer-events: none;
  }

  .custom-checkbox.disabled:not(.checked) {
    opacity: 0.5;
  }

  /* Checked and disabled state */
  .custom-checkbox.disabled.checked .checkmark {
    background-color: var(--bg-ds-primary-700);
    border: 0px;
  }

  .custom-checkbox.disabled.checked .checkmark::after {
    border-color: var(--border-ds-neutral-500, #888);
  }

  .custom-checkbox.disabled input {
    cursor: not-allowed;
  }

  /* Size variations */
  .custom-checkbox.small {
    width: 24px;
    height: 24px;
  }

  .custom-checkbox.large {
    width: 28px;
    height: 28px;
  }

  /* Button with text style */
  .custom-checkbox.button-checkbox-text {
    padding: 8px;
    border-radius: 4px;
    gap: 8px;
    width: auto;
  }

  .custom-checkbox:not(.disabled):hover {
    background-color: var(--bg-ds-surface-300);
    border-radius: 4px;
  }

  .custom-checkbox:not(.disabled):focus-visible {
    outline: none;
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--border-ds-primary-300);
    border-radius: 4px;
  }

  .custom-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: inherit;
  }

  .checkmark {
    display: inline-block;
    border-radius: 2px;
    background-color: transparent;
    position: relative;
    border: 2px solid var(--border-ds-neutral-200);
    transition: all 0.2s ease;
  }

  .checkmark.small {
    width: 12px;
    height: 12px;
  }

  .checkmark.large {
    width: 14px;
    height: 14px;
  }

  /* Normal checked state */
  .custom-checkbox input:checked + .checkmark {
    background-color: #4a7aff;
    border: none;
  }

  .custom-checkbox input:checked + .checkmark::after {
    content: "";
    position: absolute;
    border: solid #161616;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    border-radius: 1px;
  }

  /* Disabled unchecked state */
  .checkmark.disabled:not(.checked) {
    border-color: var(--border-ds-neutral-500);
    background-color: var(--bg-ds-surface-200);
  }

  /* Disabled checked state */
  .checkmark.disabled.checked {
    background-color: yellow;
    border: none;
  }

  .checkmark.disabled.checked::after {
    border-color: var(--border-ds-neutral-500, #888);
  }

  /* Size-specific checkmark adjustments */
  .custom-checkbox input:checked + .checkmark.small::after {
    left: 4px;
    top: 1.5px;
    width: 4px;
    height: 8px;
  }

  .custom-checkbox input:checked + .checkmark.large::after {
    left: 6px;
    top: 2px;
    width: 5px;
    height: 10px;
  }

  .checkbox-text {
    color: var(--text-ds-neutral-900);
    margin-left: 8px;
  }

  .disabled .checkbox-text {
    color: var(--text-ds-neutral-500);
  }

  /* Hover states */
  .custom-checkbox:not(.disabled) .checkmark:hover {
    border-color: var(--white-color);
  }
</style>
