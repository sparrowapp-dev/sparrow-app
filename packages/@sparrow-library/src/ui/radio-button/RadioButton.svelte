<script>
  import { SelectIcon } from "./icons";

  export let buttonSize = "medium";
  export let selected = false;
  export let disabled = false;
  export let handleClick = () => {};
  export let labelText = "";

  let hover = false;
  let pressed = false;
  let focused = false;

  let defaultUnselectedColor = "var(--icon-ds-neutral-200)";
  let defaultSelectedColor = "var(--icon-ds-primary-400)";
  let hoverUnselectedColor = "var(--icon-ds-neutral-50)";
  let hoverSelectedColor = "var(--icon-ds-primary-300)";
  let pressedUnselectedColor = "var(--icon-ds-primary-300)";
  let pressedSelectedColor = "var(--icon-ds-primary-300)";
  let disabledUnselectedColor = "var(--icon-ds-neutral-500)";
  let disabledSelectedColor = "var(--icon-ds-primary-700)";
  let pressedCircleColor = "var(--bg-ds-surface-400)";
  let hoverCircleColor = "var(--bg-ds-surface-300)";
  let disabledCircleColor = "transparent";
  let focusedBorderCircleColor = "2px solid var(--border-ds-primary-300)";
  let disabledBorderCircleColor = "2px solid var(--border-ds-neutral-400)";

  // Computed colors
  $: unSelectedColor = disabled
    ? disabledUnselectedColor
    : pressed || focused
      ? pressedUnselectedColor
      : hover
        ? hoverUnselectedColor
        : defaultUnselectedColor;

  $: selectedColor = disabled
    ? disabledSelectedColor
    : pressed || focused
      ? pressedSelectedColor
      : selected
        ? hoverSelectedColor
        : defaultSelectedColor;

  $: bgCircleColor = disabled
    ? disabledCircleColor
    : pressed || focused || selected
      ? pressedCircleColor
      : hover
        ? hoverCircleColor
        : "transparent";

  $: borderColor = disabled
    ? disabledBorderCircleColor
    : focused
      ? focusedBorderCircleColor
      : "none";
</script>

<div class="d-flex justify-content-center align-items-center mx-1">
  <button
    class="border-0 bg-transparent"
    {disabled}
    on:click|stopPropagation={handleClick}
    on:mouseenter={() => (hover = true)}
    on:mouseleave={() => (hover = false)}
    on:mousedown={() => (pressed = true)}
    on:mouseup={() => (pressed = false)}
    on:focus={() => (focused = true)}
    on:blur={() => (focused = false)}
  >
    <div
      class="d-flex align-items-center justify-content-center bg-circle bg-circle-{buttonSize}"
      style={`gap:4px; border: ${borderColor}; ${
        labelText
          ? buttonSize === "medium"
            ? `width:auto; max-width: 264px; border-radius: 4px; padding: 4px 8px 4px 4px; height:${buttonSize !== "medium" ? "28px" : "36px"}`
            : `width:auto; max-width: 218px; border-radius: 4px; padding: 2px 8px 2px 4px; height:${buttonSize !== "medium" ? "28px" : "36px"}`
          : `border-radius: 50%; padding: 0; height:${buttonSize !== "medium" ? "24px" : "28px"} width: auto; background-color: ${bgCircleColor};`
      }`}
    >
      <span
        class="circle-internal d-flex align-items-center justify-content-center"
        style={`background-color: ${labelText !== "" ? bgCircleColor : "transparent"}; border-radius: ${labelText !== "" ? "50%" : ""}; height: ${labelText !== "" ? (buttonSize === "medium" ? "28px" : buttonSize === "small" ? "24px" : "") : ""}; width: ${labelText !== "" ? (buttonSize === "medium" ? "28px" : buttonSize === "small" ? "24px" : "") : ""};`}
      >
        <SelectIcon
          height={buttonSize === "medium" ? 16 : 12}
          width={buttonSize === "medium" ? 16 : 12}
          {selected}
          {unSelectedColor}
          {selectedColor}
        />
      </span>
      {#if labelText}
        <div class="label-container-{buttonSize}">
          <span
            class="label-text-{buttonSize}"
            style="color: var(--border-ds-neutral-50);">{labelText}</span
          >
        </div>
      {/if}
    </div>
  </button>
</div>

<style>
  .bg-circle {
    border-radius: 100px;
    padding: 4px;
    transition:
      background-color 0.2s ease-in-out,
      border 0.2s ease-in-out;
  }

  .bg-circle-small {
    width: 24px;
    height: 24px;
  }

  .bg-circle-medium {
    width: 28px;
    height: 28px;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .label-text-small {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    max-width: 180px;
  }

  .label-text-medium {
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    max-width: 180px;
  }
</style>
