<script lang="ts">
  import { SelectIcon } from "./icons";

  export let selected: boolean = false;
  export let id: string = "";
  export let name: string = "";
  export let value: string = "";
  export let group: string;
  export let labelText: string = "";
  export let handleChange: (event?: {
    target?: { value: string };
  }) => void = () => {};
  export let buttonSize: "small" | "medium" = "medium";
  export let disabled: boolean = false;
  export let singleSelect: boolean = false;
  export let variant: "primary" = "primary";

  let hover = false;
  let pressed = false;

  const variants = {
    primary: {
      unselectedColors: {
        default: "var(--icon-ds-neutral-200)",
        hover: "var(--icon-ds-neutral-50)",
        pressed: "var(--icon-ds-primary-300)",
        disabled: "var(--icon-ds-neutral-500)",
      },
      selectedColors: {
        default: "var(--icon-ds-primary-400)",
        hover: "var(--icon-ds-primary-300)",
        pressed: "var(--icon-ds-primary-300)",
        disabled: "var(--icon-ds-primary-700)",
      },
      bgColors: {
        default: "transparent",
        hover: "var(--bg-ds-surface-300)",
        pressed: "var(--bg-ds-surface-400)",
      },
    },
  };

  let currentVariant = variants[variant];

  $: selected = group === value;

  $: unSelectedColor = disabled
    ? currentVariant.unselectedColors.disabled
    : pressed
      ? currentVariant.unselectedColors.pressed
      : hover
        ? currentVariant.unselectedColors.hover
        : currentVariant.unselectedColors.default;

  $: selectedColor = disabled
    ? currentVariant.selectedColors.disabled
    : pressed
      ? currentVariant.selectedColors.pressed
      : hover
        ? currentVariant.selectedColors.hover
        : currentVariant.selectedColors.default;

  $: bgCircleColor = disabled
    ? currentVariant.bgColors.default
    : pressed
      ? currentVariant.bgColors.pressed
      : hover
        ? currentVariant.bgColors.hover
        : currentVariant.bgColors.default;

  function handleClick(): void {
    if (disabled) return;
    if (!singleSelect) {
      group = value;
      handleChange?.({ target: { value } });
    } else {
      handleChange?.();
    }
    // Move focus to the div when input is clicked
    document.getElementById(id + "-div")?.focus();
  }
</script>

<div class="d-flex justify-content-center">
  <input
    type="radio"
    bind:group
    {id}
    {name}
    {value}
    on:change={handleClick}
    {disabled}
    class="hidden"
  />
  <label for={id}>
    <div
      id={id + "-div"}
      class="focus-visible-button"
      tabindex="0"
      style={`border:none; ${labelText === "" ? `height:${buttonSize !== "medium" ? "24px" : "28px"}; width:${buttonSize !== "medium" ? "24px" : "28px"}; background-color:${bgCircleColor}; border-radius:50%;` : buttonSize === "medium" ? `width:auto; max-width:264px; border-radius:4px; padding:4px 8px 4px 4px; height:36px;` : `width:auto; max-width:218px; border-radius:4px; padding:2px 8px 2px 4px; height:28px;`}`}
      on:mouseenter={() => (hover = true)}
      on:mouseleave={() => (hover = false)}
      on:mousedown={() => (pressed = true)}
      on:mouseup={() => {
        pressed = false;
      }}
      on:mouseleave={() => {
        pressed = false;
      }}
    >
      <div class="d-flex align-items-center gap-1">
        <span
          class="circle-internal d-flex align-items-center justify-content-center mx-auto"
          style={`background-color:${labelText ? bgCircleColor : "transparent"}; border-radius: 50%; height: ${buttonSize === "medium" ? "28px" : "24px"}; width: ${buttonSize === "medium" ? "28px" : "24px"};`}
        >
          <SelectIcon
            {selected}
            height={buttonSize === "medium" ? 16 : 12}
            width={buttonSize === "medium" ? 16 : 12}
            {unSelectedColor}
            {selectedColor}
          />
        </span>
        {#if labelText}
          <span class={`label-text-${buttonSize} ${pressed ? "pressed" : ""}`}
            >{labelText}</span
          >
        {/if}
      </div>
    </div>
  </label>
</div>

<style>
  .hidden {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .focus-visible-button:disabled {
    opacity: 0.8;
  }

  .focus-visible-button:focus {
    outline: none;
  }

  .focus-visible-button:focus-visible {
    outline: 2px solid var(--border-ds-primary-300);
  }
  .focus-visible-button:focus-visible .label-text-medium,
  .focus-visible-button:focus-visible .label-text-small {
    color: var(--text-ds-neutral-50) !important;
  }

  .label-text-small {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    max-width: 180px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .label-text-small:hover {
    color: var(--text-ds-neutral-50);
  }

  .label-text-medium {
    font-family: "Inter", sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 220px;
    text-overflow: ellipsis;
    overflow: hidden;
    color: var(--text-ds-neutral-200);
    white-space: nowrap;
  }

  .label-text-medium:hover {
    color: var(--text-ds-neutral-50);
  }

  .label-text-medium.pressed {
    color: var(--text-ds-neutral-50);
  }
</style>
