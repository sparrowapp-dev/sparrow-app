<script>
  import { SelectIcon } from "./icons";

  export let selected = false;
  export let inputText = "";
  export let id = "";
  export let name = "";
  export let value = "";
  export let group;
  export let labelText = "";
  export let handleChange;
  export let buttonSize = "medium";
  export let disabled = false;

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

  // Use group value for selection state
  $: selected = group === value;

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
      : hover
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

  function handleClick() {
    if (!disabled) {
      group = value;
      if (handleChange) {
        handleChange({ target: { value } }); // Ensure correct event structure
      }
    }
  }
</script>

<div class="mx-1">
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
    on:focus={() => (focused = true)}
    on:blur={() => (focused = false)}
    on:mouseenter={() => (hover = true)}
    on:mouseleave={() => (hover = false)}
    on:mousedown={() => (pressed = true)}
    on:mouseup={() => (pressed = false)}
    style="background-color:transparent; border:none;"
  >
    <div
      class="d-flex align-items-center justify-content-center"
      style={`gap:4px; border: ${borderColor}; ${
        labelText
          ? buttonSize === "medium"
            ? `width:auto; max-width: 264px; border-radius: 4px; padding: 4px 8px 4px 4px; height:36px;`
            : `width:auto; max-width: 218px; border-radius: 4px; padding: 2px 8px 2px 4px; height:28px;`
          : `border-radius: 50%; padding: 0; height:${buttonSize !== "medium" ? "24px" : "28px"}; width: ${buttonSize !== "medium" ? "24px" : "28px"}; background-color: ${bgCircleColor};`
      }`}
    >
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
      {#if inputText !== ""}
        <span class={`label-text-${buttonSize}`}>{inputText}</span>
      {/if}

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
    font-family: "Inter", sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    max-width: 180px;
  }
</style>
