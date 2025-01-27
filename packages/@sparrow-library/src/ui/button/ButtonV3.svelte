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

  // Generate the sizeStyleProp based on length and breadth props

  export let type:
    | "primary"
    | "secondary"
    | "dark"
    | "danger"
    | "violet"
    | "transparent"
    | "outline"
    | "teritiary"
    | "underline"
    | "other"
    | "icon" = "other";
  export let id = "";
  enum BtnType {
    PRIMARY = "primary",
    Secondary = "secondary",
    DARK = "dark",
    DANGER = "danger",
    Outline = "outline",
    VIOLET = "violet",
    TRANSPARENT = "transparent",
    OTHER = "other",
    ICON = "icon",
    Disable = "disable",
    TERITIARY = "teritiary",
    Underline = "underline",
  }

  // define button variants

  let btnClass = "";
  if (!disable) {
    switch (type) {
      case BtnType.PRIMARY:
        btnClass = "custom-btn-primary";
        break;
      case BtnType.Secondary:
        btnClass = "custom-btn-secondary";
        break;
      case BtnType.Outline:
        btnClass = "custom-btn-outline";
        break;
      case BtnType.Underline:
        btnClass = "custom-btn-underline";
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
  } else {
    switch (type) {
      case BtnType.PRIMARY:
        btnClass = "custom-btn-primary-disable";
        break;
      case BtnType.Secondary:
        btnClass = "custom-btn-secondary-disable";
        break;
      case BtnType.DANGER:
        btnClass = "custom-btn-danger-disable";
        break;
      case BtnType.Secondary:
        btnClass = "custom-btn-secondary-disable";
      default:
        btnClass = "";
        break;
    }
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
  class={`${buttonClassProp}  ${
    type !== "other" && type !== "icon"
      ? "py-1 px-3 d-flex align-items-center"
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
      style={`${buttonStartIconStyle} height: 20px; width: 20px;`}
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
  .button-wrapper {
    position: relative;
    display: inline-block;
  }
  .sparrow-icon-btn {
    background-color: transparent;
    border: 0px;
  }
  .sparrow-icon-btn:hover {
    background-color: var(--blackColor);
  }
  .custom-btn-primary {
    background-color: var(--bg-primary-400);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-secondary {
    background-color: var(--bg-ds-surface-300);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-dark {
    background-color: var(--bg-tertiary-300);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-violet {
    background-color: var(--bg-tertiary-300);
    color: var(--white-color);
    border-width: 0px;
  }

  .custom-btn-primary:hover {
    background-color: var(--bg-ds-primary-300);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-outline {
    background-color: transparent;
    border-width: 1px;
  }
  .custom-btn-underline {
    background-color: transparent;
    border-width: 0px;
    text-decoration: underline;
    text-underline-offset: 5px;
  }
  .custom-btn-primary:active {
    background-color: var(--bg-primary-600);
    color: var(--white-color);
  }
  .custom-btn-dark:hover {
    background-color: var(--bg-tertiary-100);
  }
  .custom-btn-danger {
    background-color: var(--bg-ds-danger-400);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-danger:hover {
    background-color: var(--delete-hover);
  }
  .custom-btn-danger:active {
    background-color: var(--bg-ds-danger-600);
  }
  .custom-btn-transparent {
    background-color: transparent;
    color: var(--white-color);
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
  .custom-btn-danger-disable {
    background-color: var(--bg-ds-danger-700);
    border-width: 0px;
  }
  .custom-btn-primary-disable {
    background-color: var(--bg-ds-primary-700);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-secondary-disable {
    background-color: var(--bg-ds-surface-400);
    color: var(--white-color);
    border-width: 0px;
  }
</style>
