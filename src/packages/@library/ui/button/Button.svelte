<script lang="ts">
  import Spinner from "../spinner/Spinner.svelte";

  export let title = "Submit";
  export let onClick: (e) => void;
  export let loaderSize = 16;
  export let disable = false;
  export let loader = false;
  export let buttonStyleProp = "";
  export let buttonClassProp = "";
  export let textClassProp = "";
  export let textStyleProp = "";
  export let buttonStartIcon: string | undefined = undefined;
  export let buttonStartIconStyle = "";
  export let allowChild = false;
  export let type:
    | "primary"
    | "dark"
    | "danger"
    | "violet"
    | "transparent"
    | "teritiary"
    | "other"
    | "icon" = "other";
  export let id = "";
  enum BtnType {
    PRIMARY = "primary",
    DARK = "dark",
    DANGER = "danger",
    VIOLET = "violet",
    TRANSPARENT = "transparent",
    OTHER = "other",
    ICON = "icon",
    TERITIARY = "teritiary",
  }

  // define button variants
  let btnClass = "";
  switch (type) {
    case BtnType.PRIMARY:
      btnClass = "custom-btn-primary";
      break;
    case BtnType.DARK:
      btnClass = "custom-btn-dark";
      break;
    case BtnType.DANGER:
      btnClass = "custom-btn-danger";
      break;
    case BtnType.VIOLET:
      btnClass = "custom-btn-violet";
      break;
    case BtnType.TRANSPARENT:
      btnClass = "custom-btn-transparent";
      break;
    case BtnType.ICON:
      btnClass = "sparrow-icon-btn";
      break;
    case BtnType.TERITIARY:
      btnClass = "custom-btn-teritiary";
      break;
    default:
      btnClass = "";
      break;
  }
</script>

<button
  {id}
  disabled={disable}
  style={`${buttonStyleProp} ${
    type !== "other" && type !== "icon"
      ? "border-radius: 4px; padding: 6px 12px; white-space: nowrap;"
      : ""
  } `}
  class={`${buttonClassProp} ${
    type !== "other" && type !== "icon"
      ? "py-1 px-3 border-0 d-flex align-items-center"
      : ""
  } ${btnClass}`}
  on:click={(e) => {
    onClick(e);
  }}
>
  {#if buttonStartIcon !== undefined}
    <img
      src={buttonStartIcon}
      class="me-2"
      style={`${buttonStartIconStyle} height: 20px; width:20px;`}
      alt="icon"
    />
  {/if}
  {#if loader && !allowChild}
    <span class="mx-2 d-flex justify-content-center">
      <Spinner size={`${loaderSize}px`} />
    </span>
  {:else if !loader && !allowChild && title !== ""}
    <span class={textClassProp} style={textStyleProp}>
      {title}
    </span>
  {:else if allowChild}
    <slot />
  {/if}
</button>

<style lang="scss">
  .sparrow-icon-btn {
    background-color: transparent;
    border: 0px;
  }
  .sparrow-icon-btn:hover {
    background-color: var(--blackColor);
  }
  .custom-btn-primary {
    background-color: var(--bg-primary-300);
    color: var(--white-color);
  }
  .custom-btn-dark {
    background-color: var(--bg-tertiary-300);
    color: var(--white-color);
  }
  .custom-btn-violet {
    background-color: var(--bg-tertiary-300);
    color: var(--white-color);
  }
  .custom-btn-primary:hover {
    background-color: var(--bg-primary-250);
    color: var(--white-color);
  }
  .custom-btn-primary:active {
    background-color: var(--bg-primary-600);
    color: var(--white-color);
  }
  .custom-btn-dark:hover {
    background-color: var(--bg-tertiary-100);
  }
  .custom-btn-danger {
    background-color: var(--dangerColor);
    color: var(--blackColor);
  }
  .custom-btn-danger:hover {
    background-color: var(--delete-hover);
  }
  .custom-btn-transparent {
    background-color: transparent;
    color: var(--white-color);
  }
  .custom-btn-transparent:hover {
  }
  .custom-btn-teritiary {
    color: var(--text-primary-300);
    border: 1px solid var(--border-primary-200) !important;
  }
  .custom-btn-teritiary:hover {
    color: var(--white-color);
    background-color: var(--bg-primary-300);
    border: 1px solid var(--border-primary-200) !important;
  }
</style>
