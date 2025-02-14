<script lang="ts">
  import { plusWhiteIcon } from "../../assets";
  import Spinner from "../spinner/Spinner.svelte";
  import { onMount, onDestroy } from "svelte";

  export let title = "";
  export let onClick: (e) => void;
  export let loaderSize = 16;
  export let disable = false;
  export let loader = false;
  export let buttonStyleProp = "font-size: var(--base-text)";
  export let buttonClassProp = "";
  export let textClassProp = "";
  export let textStyleProp = "";

  export let buttonStartIconStyle = "";
  export let buttonstartIcon;
  export let buttonEndIcon;
  export let buttonEndIconStyle = "";
  export let allowChild = false;
  export let iconSize = 16;
  export let frontIconSize = 20;
  export let endIconSize = 20;
  export let buttonIcon;
  export let size: "small" | "medium" | "large" | "other" = "medium";
  let buttonSize = 28;
  if (size === "small") {
    buttonSize = 28;
  } else if (size === "medium") {
    buttonSize = 36;
  } else if (size === "large") {
    buttonSize = 40;
  } else {
    buttonSize = 36;
  }
  let color = "white";
  export let type:
    | "primary"
    | "secondary"
    | "dark"
    | "danger"
    | "violet"
    | "transparent"
    | "outline"
    | "teritiary-regular"
    | "teritiary-danger"
    | "underline"
    | "outline-primary"
    | "outline-secondary"
    | "outline-danger"
    | "other"
    | "icon-primary"
    | "icon-secondary"
    | "icon-danger"
    | "outline-icon-primary"
    | "outline-icon-secondary"
    | "outline-icon-danger"
    | "teritiary-icon-regular"
    | "teritiary-icon-danger"
    | "link-primary"
    | "link-secondary"
    | "other";
  export let id = "";
  enum BtnType {
    PRIMARY = "primary",
    OutlinePrimary = "outline-primary",
    Secondary = "secondary",
    OutlineSecondary = "outline-secondary",
    DARK = "dark",
    DANGER = "danger",
    OutlineDanger = "outline-danger",
    Outline = "outline",
    VIOLET = "violet",
    TRANSPARENT = "transparent",
    OTHER = "other",
    IconPrimary = "icon-primary",
    IconSecondary = "icon-secondary",
    IconDanger = "icon-danger",
    OutlineIconPrimary = "outline-icon-primary",
    OutlineIconSecondary = "outline-icon-secondary",
    OutlineIconDanger = "outline-icon-danger",
    Disable = "disable",
    TeritiaryRegular = "teritiary-regular",
    TeritiaryDanger = "teritiary-danger",
    TeritiaryIconRegular = "teritiary-icon-regular",
    TeritiaryIconDanger = "teritiary-icon-danger",
    LinkPrimary = "link-primary",
    LinkSecondary = "link-secondary",
    Underline = "underline",
  }

  // define button variants

  let btnClass = "";
  $: {
    if (size === "small") {
      buttonSize = 24;
      frontIconSize = 12;
      endIconSize = 12;
      iconSize = 12;
    } else if (size === "medium") {
      buttonSize = 36;
      frontIconSize = 16;
      endIconSize = 16;
      iconSize = 16;
    } else if (size === "large") {
      buttonSize = 40;
      frontIconSize = 20;
      endIconSize = 20;
      iconSize = 20;
    } else {
      buttonSize = 24;
      frontIconSize = 24;
      endIconSize = 24;
      iconSize = 24;
    }

    if (!disable) {
      switch (type) {
        case BtnType.PRIMARY:
          btnClass = "custom-btn-primary";
          break;
        case BtnType.OutlinePrimary:
          btnClass = "custom-btn-outline-primary";
          break;
        case BtnType.Secondary:
          btnClass = "custom-btn-secondary";
          break;
        case BtnType.OutlineSecondary:
          btnClass = "custom-btn-outline-secondary";
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
        case BtnType.OutlineDanger:
          btnClass = "custom-btn-outline-danger";
          break;
        case BtnType.VIOLET:
          btnClass = "custom-btn-violet";
          break;
        case BtnType.TRANSPARENT:
          btnClass = "custom-btn-transparent";
          break;
        case BtnType.IconPrimary:
          btnClass = "sparrow-icon-primary-btn";
          break;
        case BtnType.IconSecondary:
          btnClass = "sparrow-icon-secondary-btn";
          break;
        case BtnType.IconDanger:
          btnClass = "sparrow-icon-danger-btn";
          break;
        case BtnType.OutlineIconPrimary:
          btnClass = "sparrow-outline-icon-primary";
          break;
        case BtnType.OutlineIconSecondary:
          btnClass = "sparrow-outline-icon-secondary";
          break;
        case BtnType.OutlineIconDanger:
          btnClass = "sparrow-outline-icon-danger";
          break;
        case BtnType.TeritiaryRegular:
          btnClass = "custom-btn-teritiary-regular";
          break;
        case BtnType.TeritiaryDanger:
          btnClass = "custom-btn-teritiary-danger";
          break;
        case BtnType.TeritiaryIconRegular:
          btnClass = "custom-btn-teritiary-icon-regular";
          break;
        case BtnType.TeritiaryIconDanger:
          btnClass = "custom-btn-teritiary-icon-danger";
          break;
        case BtnType.LinkPrimary:
          btnClass = "custom-btn-link-primary";
          break;
        case BtnType.LinkSecondary:
          btnClass = "custom-btn-link-secondary";
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
        case BtnType.OutlinePrimary:
          btnClass = "custom-btn-outline-primary-disable";
          break;
        case BtnType.Secondary:
          btnClass = "custom-btn-secondary-disable";
          break;
        case BtnType.OutlineSecondary:
          btnClass = "custom-btn-outline-secondary-disable";
          break;
        case BtnType.DANGER:
          btnClass = "custom-btn-danger-disable";
          break;
        case BtnType.TeritiaryRegular: {
          btnClass = "custom-btn-teritiary-regular-disable";
          break;
        }
        case BtnType.TeritiaryDanger: {
          btnClass = "custom-btn-teritiary-danger-disable";
          break;
        }
        case BtnType.TeritiaryIconRegular:
          btnClass = "custom-btn-teritiary-icon-regular-disable";
          break;
        case BtnType.TeritiaryIconDanger:
          btnClass = "custom-btn-teritiary-icon-danger-disable";
          break;
        case BtnType.OutlineDanger:
          btnClass = "custom-btn-outline-danger-disable";
          break;
        case BtnType.IconPrimary:
          btnClass = "sparrow-icon-primary-btn-disable";
          break;
        case BtnType.IconSecondary:
          btnClass = "sparrow-icon-secondary-btn-disable";
          break;
        case BtnType.IconDanger:
          btnClass = "sparrow-icon-danger-btn-disable";
          break;
        case BtnType.OutlineIconPrimary:
          btnClass = "sparrow-outline-icon-primary-disable";
          break;
        case BtnType.OutlineIconSecondary:
          btnClass = "sparrow-outline-icon-secondary-disable";
          break;
        case BtnType.OutlineIconDanger:
          btnClass = "sparrow-outline-icon-danger-disable";
          break;
        case BtnType.Secondary:
          btnClass = "custom-btn-secondary-disable";
        case BtnType.LinkPrimary:
          btnClass = "custom-btn-link-primary-disable";
          break;
        case BtnType.LinkSecondary:
          btnClass = "custom-btn-link-secondary-disable";
          break;
        default:
          btnClass = "";
          break;
      }
    }
  }
</script>

<button
  {id}
  disabled={disable}
  style={` ${`display: flex; flex-direction: row; justify-content: center; align-items: center; height: ${buttonSize}px; width:auto; border-radius: 4px;`} ${buttonStyleProp}`}
  class={`${buttonClassProp}  ${
    type !== "other" ? "py-1 px-3 d-flex align-items-center " : ""
  } ${btnClass}`}
  on:click={(e) => {
    onClick(e);
  }}
>
  {#if type === "icon-primary" || type === "icon-secondary" || type === "icon-danger" || type === "outline-icon-danger" || type === "outline-icon-primary" || type === "outline-icon-secondary" || type === "teritiary-icon-regular" || type === "teritiary-icon-danger"}
    {#if buttonIcon}
      <span>
        <svelte:component
          this={buttonIcon}
          style={buttonStyleProp}
          useParentColor={true}
        />
      </span>
    {/if}
  {/if}

  {#if buttonstartIcon}
    <span class="me-2">
      <svelte:component
        this={buttonstartIcon}
        style={`${buttonStartIconStyle} border-radius: 50%;`}
        height={`${frontIconSize}px`}
        width={`${frontIconSize}px`}
        useParentColor={true}
        {color}
      />
    </span>
  {/if}

  {#if loader}
    <span class="mx-2 d-flex justify-content-center">
      <Spinner size={`${loaderSize}px`} />
    </span>
  {:else if !loader && title !== ""}
    <span class={textClassProp} style={textStyleProp}>
      {title}
    </span>
  {/if}

  {#if buttonEndIcon}
    <span class="ms-2">
      <svelte:component
        this={buttonEndIcon}
        style={`${buttonEndIconStyle}  border-radius: 50%;`}
        height={`${endIconSize}px`}
        width={`${endIconSize}px`}
        useParentColor={true}
      />
    </span>
  {/if}
</button>

<style lang="scss">
  .button-wrapper {
    position: relative;
    display: inline-block;
  }
  .sparrow-icon-primary-btn {
    background-color: var(--bg-ds-primary-400);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-primary-btn:hover {
    background-color: var(--bg-ds-primary-300);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-primary-btn:active {
    background-color: var(--bg-ds-primary-600);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-primary-btn:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    outline: none;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-primary-btn-disable {
    background-color: var(--bg-ds-primary-700);
    color: var(--text-ds-neutral-400);
    border: 0px;
  }
  .sparrow-icon-secondary-btn {
    background-color: var(--bg-ds-surface-300);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-secondary-btn:hover {
    background-color: var(--bg-ds-surface-100);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-secondary-btn:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    outline: none;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-secondary-btn:active {
    background-color: var(--bg-ds-surface-400);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-secondary-btn-disable {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-400);
    border: 0px;
  }
  .sparrow-icon-danger-btn {
    background-color: var(--bg-ds-danger-500);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-danger-btn:hover {
    background-color: var(--bg-ds-danger-400);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-danger-btn:focus-visible {
    border: 2px solid var(--border-ds-danger-200);
    outline: none;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-danger-btn:active {
    background-color: var(--bg-ds-danger-600);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-icon-danger-btn-disable {
    background-color: var(--bg-ds-danger-700);
    border-width: 0px;
    color: var(--text-ds-neutral-400);
  }
  .sparrow-outline-icon-primary {
    background-color: transparent;
    border: 1px solid var(--border-ds-surface-50);
    color: var(--text-ds-primary-300);
  }
  .sparrow-outline-icon-primary:hover {
    background-color: var(--bg-ds-primary-400);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-outline-icon-primary:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    outline: none;
    color: var(--text-ds-primary-300);
  }
  .sparrow-outline-icon-primary:active {
    background-color: var(--bg-ds-primary-600);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .sparrow-outline-icon-primary-disable {
    background-color: transparent;
    border: 1px solid var(--border-ds-surface-50);
    color: var(--text-ds-primary-600);
  }
  .sparrow-outline-icon-secondary {
    background-color: transparent;
    border: 1px solid var(--border-ds-surface-50);
    color: var(--text-ds-neutral-100);
  }
  .sparrow-outline-icon-secondary:hover {
    background-color: var(--bg-ds-surface-300);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-outline-icon-secondary:active {
    background-color: var(--bg-ds-surface-400);
    border-width: 0px;
    color: var(--text-ds-neutral-50);
  }
  .sparrow-outline-icon-secondary:focus-visible {
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
  .sparrow-outline-icon-secondary-disable {
    background-color: transparent;
    border: 1px solid var(--border-ds-surface-50);
    color: var(--text-ds-neutral-500);
  }
  .sparrow-outline-icon-danger {
    background-color: transparent;
    color: var(--text-ds-danger-300);
    border: 1px solid var(--border-ds-surface-50);
  }
  .sparrow-outline-icon-danger:hover {
    background-color: var(--bg-ds-danger-500);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .sparrow-outline-icon-danger:focus-visible {
    border: 2px solid var(--border-ds-danger-200);
    outline: none;
    color: var(--text-ds-danger-300);
  }
  .sparrow-outline-icon-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .sparrow-outline-icon-danger-disable {
    background-color: transparent;
    color: var(--text-ds-danger-600);
    border: 1px solid var(--border-ds-surface-400);
  }
  .custom-btn-teritiary-icon-regular {
    background-color: transparent;
    color: var(--text-ds-neutral-100);
    border: 0px;
  }
  .custom-btn-teritiary-icon-regular:hover {
    color: var(--text-ds-neutral-50);
    background-color: var(--bg-ds-surface-300);
    border: 0px;
  }
  .custom-btn-teritiary-icon-regular:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    outline: none;
    color: var(--text-ds-neutral-100);
  }
  .custom-btn-teritiary-icon-regular:active {
    color: var(--text-ds-primary-300);
    background-color: var(--bg-ds-surface-400);
    border: 0px;
  }
  .custom-btn-teritiary-icon-regular-disable {
    background-color: transparent;
    color: var(--text-ds-neutral-500);
    border-width: 0px;
  }
  .custom-btn-teritiary-icon-danger {
    background-color: transparent;
    color: var(--text-ds-danger-300);
    border: 0px;
  }
  .custom-btn-teritiary-icon-danger:hover {
    background-color: var(--bg-ds-danger-500);
    color: var(--text-ds-neutral-50);
    border: 0px;
  }
  .custom-btn-teritiary-icon-danger:focus-visible {
    outline: none;
    border: 2px solid var(--border-ds-danger-200);
    color: var(--text-ds-danger-300);
  }
  .custom-btn-teritiary-icon-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--text-ds-neutral-50);
    border: 0px;
  }
  .custom-btn-teritiary-icon-danger-disable {
    background-color: transparent;
    color: var(--text-ds-danger-600);
    border: 0px;
  }
  .custom-btn-primary {
    background-color: var(--bg-ds-primary-400);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .custom-btn-primary:hover {
    background-color: var(--bg-ds-primary-300);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .custom-btn-primary:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    color: var(--text-ds-neutral-50);
    outline: none;
  }
  .custom-btn-primary:active {
    background-color: var(--bg-ds-primary-600);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .custom-btn-primary-disable {
    background-color: var(--bg-ds-primary-700);
    color: var(--text-ds-neutral-400);
    border-width: 0px;
  }
  .custom-btn-outline-primary {
    background-color: transparent;
    color: var(--bg-ds-primary-300);
    border: 1px solid var(--border-ds-surface-50);
  }
  .custom-btn-outline-primary:hover {
    background-color: var(--bg-ds-primary-400);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .custom-btn-outline-primary:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    color: var(--text-ds-primary-300);
    outline: none;
  }
  .custom-btn-outline-primary:active {
    background-color: var(--bg-ds-primary-600);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .custom-btn-outline-primary-disable {
    background-color: transparent;
    color: var(--text-ds-primary-600);
    border: 1px solid var(--border-ds-surface-400);
  }
  .custom-btn-secondary {
    background-color: var(--bg-ds-surface-300);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .custom-btn-secondary:hover {
    background-color: var(--bg-ds-surface-100);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .custom-btn-secondary:active {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    border-width: 0px;
  }
  .custom-btn-secondary:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    outline: none;
  }
  .custom-btn-secondary-disable {
    background-color: var(--bg-ds-surface-700);
    color: var(--text-ds-neutral-400);
    border: 0px;
  }
  .custom-btn-outline-secondary {
    background-color: transparent;
    border: 1px solid var(--border-ds-surface-50);
    color: var(--text-ds-neutral-100);
  }
  .custom-btn-outline-secondary:hover {
    background-color: var(--bg-ds-surface-300);
    border: 0px;
    color: var(--text-ds-neutral-50);
  }
  .custom-btn-outline-secondary:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    color: var(--text-ds-neutral-50);
    outline: none;
  }
  .custom-btn-outline-secondary:active {
    background-color: var(--bg-ds-surface-400);
    border: 0px;
    color: var(--text-ds-neutral-50);
  }
  .custom-btn-outline-secondary-disable {
    color: var(--text-ds-neutral-500);
    background-color: transparent;
    border: 1px solid var(--border-ds-surface-400);
  }
  .custom-btn-link-primary {
    background-color: transparent;
    color: var(--text-ds-primary-300);
    border: 0px;
  }
  .custom-btn-link-primary:hover {
    background-color: transparent;
    color: var(--text-ds-primary-300);
    border: 0px;
    text-decoration: underline;
    text-underline-offset: 5px;
  }
  .custom-btn-link-primary:focus-visible {
    background-color: transparent;
    color: var(--text-ds-primary-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
  .custom-btn-link-primary:active {
    background-color: transparent;
    color: var(--bg-ds-primary-400);
    border: 0px;
    text-decoration: underline;
    text-underline-offset: 5px;
  }

  .custom-btn-link-primary-disable {
    background-color: transparent;
    color: var(--text-ds-primary-600);
    border-width: 0px;
  }
  .custom-btn-link-secondary {
    background-color: transparent;
    color: var(--text-ds-neutral-200);
    border: 0px;
    text-decoration: underline;
    text-underline-offset: 5px;
  }
  .custom-btn-link-secondary:hover {
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    border: 0px;
    text-decoration: underline;
    text-underline-offset: 5px;
  }
  .custom-btn-link-secondary:focus-visible {
    background-color: transparent;
    color: var(--text-ds-primary-300);
    border: 2px solid var(--bg-ds-primary-300);
    text-decoration: none;
  }
  .custom-btn-link-secondary:active {
    background-color: transparent;
    color: var(--text-ds-primary-300);
    border: 0px;
    text-decoration: underline;
    text-underline-offset: 5px;
  }

  .custom-btn-link-secondary-disable {
    background-color: transparent;
    color: var(--text-ds-neutral-500);
    text-decoration: underline;
    text-underline-offset: 5px;
    border: 0px;
  }
  .custom-btn-danger {
    background-color: var(--bg-ds-danger-500);
    color: var(--text-ds-neutral-50);
    border: 0px;
  }
  .custom-btn-danger:hover {
    background-color: var(--bg-ds-danger-400);
    color: var(--text-ds-neutral-50);
    border: 0px;
  }
  .custom-btn-danger:focus-visible {
    border: 2px solid var(--border-ds-danger-200);
    color: var(--text-ds-neutral-50);
    outline: none;
  }
  .custom-btn-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--text-ds-neutral-50);
    border: 0px;
  }
  .custom-btn-danger-disable {
    background-color: var(--bg-ds-danger-700);
    border: 0px;
    color: var(--text-ds-neutral-400);
  }
  .custom-btn-outline-danger {
    background-color: transparent;
    color: var(--text-ds-danger-300);
    border: 1px solid var(--border-ds-surface-50);
  }
  .custom-btn-outline-danger:hover {
    background-color: var(--bg-ds-danger-500);
    color: var(--text-ds-neutral-50);
    border: 0px;
  }
  .custom-btn-outline-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--text-ds-neutral-50);
    border: 0px;
  }
  .custom-btn-outline-danger:focus-visible {
    background-color: transparent;
    color: var(--text-ds-danger-300);
    outline: none;
    border: 2px solid var(--border-ds-danger-200);
  }
  .custom-btn-teritiary-regular {
    background-color: transparent;
    color: var(--text-ds-neutral-100);
    border: 0px;
  }
  .custom-btn-teritiary-regular:hover {
    color: var(--text-ds-neutral-50);
    background-color: var(--bg-ds-surface-300);
    border: 0px;
  }
  .custom-btn-teritiary-regular:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    color: var(--text-ds-neutral-100);
    outline: none;
  }
  .custom-btn-teritiary-regular:active {
    color: var(--text-ds-primary-300);
    background-color: var(--bg-ds-surface-400);
    border: 0px;
  }
  .custom-btn-teritiary-danger {
    background-color: transparent;
    color: var(--text-ds-danger-300);
    border: 0px;
  }
  .custom-btn-teritiary-danger:hover {
    background-color: var(--bg-ds-danger-500);
    color: var(--text-ds-neutral-50);
    border: 0px;
  }
  .custom-btn-teritiary-danger:focus-visible {
    border: 2px solid var(--border-ds-danger-200);
    color: var(--text-ds-danger-300);
    outline: none;
  }
  .custom-btn-teritiary-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--text-ds-neutral-50);
    border: 0px;
  }
  .custom-btn-teritiary-danger-disable {
    background-color: transparent;
    color: var(--text-ds-danger-700);
    border: 0px;
  }

  .custom-btn-outline-danger-disable {
    background-color: transparent;
    color: var(--text-ds-danger-700);
    border: 1px solid var(--border-ds-surface-400);
  }
  .custom-btn-teritiary-regular-disable {
    background-color: transparent;
    color: var(--text-ds-neutral-500);
    border: 0px;
  }
</style>
