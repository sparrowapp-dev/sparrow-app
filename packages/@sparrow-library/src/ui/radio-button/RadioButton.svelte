<script lang="ts">
  import { SelectIcon } from "./icons";
  export let selected: boolean = false;
  export let id: string = "";
  export let name: string = "";
  export let value: string = "";
  export let group: string | undefined;
  export let labelText: string = "";
  export let handleChange:
    | ((event?: { target: { value: string } }) => void)
    | (() => void);
  export let buttonSize: "small" | "medium" = "medium";
  export let disabled: boolean = false;
  export let singleSelect: boolean = false;
  export let variant: "primary" = "primary";
  let componentClass = "";
  export { componentClass as class };

  let hover: boolean = false;
  let pressed: boolean = false;

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

  const currentVariant = variants[variant];

  $: if (!singleSelect) {
    selected = group === value;
  }

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
  }
</script>

<div class="d-flex justify-content-center {componentClass}">
  <input
    bind:group
    type="radio"
    {id}
    {name}
    {value}
    on:change={handleChange}
    class="hidden"
    {disabled}
  />
  <button
    on:click={handleClick}
    {disabled}
    type="button"
    class="focus-visible-button"
    style={`border:none; ${labelText === "" ? `height:${buttonSize !== "medium" ? "24px" : "28px"}; width: ${buttonSize !== "medium" ? "24px" : "28px"}; background-color:${bgCircleColor}; border-radius:50%;` : buttonSize === "medium" ? `width:auto; max-width: 264px; border-radius: 4px; padding: 4px 8px 4px 4px; height:36px;` : `width:auto; max-width: 218px; border-radius: 4px; padding: 2px 8px 2px 4px; height:28px;`}`}
    on:mouseenter={() => (hover = true)}
    on:mouseleave={() => (hover = false)}
    on:mousedown={() => (pressed = true)}
    on:mouseup={() => (pressed = false)}
  >
    <div class="d-flex align-items-center justify-content-center gap-1">
      <span
        class="circle-internal d-flex align-items-center justify-content-center"
        style={`background-color: ${labelText !== "" ? bgCircleColor : "transparent"}; 
         border-radius: ${labelText !== "" ? "50%" : ""}; 
         height: ${labelText !== "" ? (buttonSize === "medium" ? "28px" : "24px") : ""}; 
         width: ${labelText !== "" ? (buttonSize === "medium" ? "28px" : "24px") : ""};`}
      >
        <SelectIcon
          {selected}
          height={buttonSize === "medium" ? 16 : 12}
          width={buttonSize === "medium" ? 16 : 12}
          {unSelectedColor}
          {selectedColor}
        />
      </span>
      {#if labelText !== ""}
        <label for={id} class={`label-text-${buttonSize}`}>{labelText}</label>
      {/if}
    </div>
  </button>
</div>

<style>
  .hidden {
    display: none;
  }

  button {
    background-color: transparent;
  }

  button:disabled {
    opacity: 0.8;
  }

  button:focus {
    outline: none;
  }

  button:focus-visible {
    outline: 2px solid var(--border-ds-primary-300);
  }

  .label-text-small {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    max-width: 180px;
  }

  .label-text-medium {
    font-family: "Inter", sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    max-width: 180px;
  }
</style>
