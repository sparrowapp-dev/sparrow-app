<script>
  import { SelectIcon } from "./icons";

  export let buttonSize = "medium";
  export let selected = false;
  export let disabled = false;
  let hover = false;
  export let handleClick;

  let defaultUnselectedColor = "var(--icon-ds-neutral-200)";
  let defaultSelectedColor = "var(--icon-ds-primary-400)";
  let hoverUnselectedColor = "var(--icon-ds-neutral-50)";
  let hoverSelectedColor = "var(--icon-ds-primary-300)";
  let pressedUnselectedColor = "var(--icon-ds-primary-300)";
  let pressedSelectedColor = "var(--icon-ds-primary-300)";
  let disabledUnselectedColor = "var(--icon-ds-neutral-500)";
  let disabledSelectedColor = "var(--icon-ds-primary-700)";

  let pressedCircleColor = "var(--icon-ds-surface-400)";
  let focusedCircleColor = "var(--icon-ds-surface-400)";
  let disabledCircleColor = "transparent";

  // Reactive hover-based color update
  $: unSelectedColor = disabled
    ? disabledUnselectedColor
    : hover
      ? hoverUnselectedColor
      : selected
        ? hoverSelectedColor
        : defaultUnselectedColor;

  $: selectedColor = disabled
    ? disabledSelectedColor
    : hover
      ? pressedSelectedColor
      : selected
        ? pressedSelectedColor
        : defaultSelectedColor;
</script>

<div>
  <button
    class="p-0 m-0 ms-1 ps-4 me-2 border-0 bg-transparent"
    {disabled}
    on:click|stopPropagation={handleClick}
    on:mouseenter={() => (hover = true)}
    on:mouseleave={() => (hover = false)}
  >
    <div
      class={`bg-circle bg-circle-${buttonSize} d-flex align-items-center justify-content-center`}
    >
      <span
        class="circle-internal d-flex align-items-center justify-content-center"
      >
        <SelectIcon
          height={buttonSize === "medium" ? 16 : 12}
          width={buttonSize === "medium" ? 16 : 12}
          {selected}
          {unSelectedColor}
          {selectedColor}
        />
      </span>
    </div>
  </button>
</div>

<style>
  .circle-internal-small {
    padding: 2px;
  }

  .bg-circle {
    border-radius: 100px;
    padding: 4px;
  }

  .bg-circle-small {
    width: 24px;
    height: 24px;
  }

  .bg-circle-medium {
    width: 28px;
    height: 28px;
  }

  .bg-circle:hover {
    background-color: var(--bg-ds-surface-300);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
