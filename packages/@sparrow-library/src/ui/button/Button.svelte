<script lang="ts">
  import { plusWhiteIcon } from "../../assets";
  import Spinner from "../spinner/Spinner.svelte";
  import { onMount, onDestroy } from "svelte";

  export let title = "";
  export let onClick: (e) => void;

  export let disable = false;
  export let loader = false;

  export let buttonClassProp = "";

  export let startIcon;
  export let endIcon;

  export let tabindex = "0";

  export let iconSize = 16;

  export let customWidth = "auto";

  // export let buttonIcon;
  export let size: "small" | "medium" | "large" | "extra-small" = "medium";
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
  let fontSize = 12;
  let borderRadius = 4;
  $: {
    if (size === "extra-small") {
      iconSize = 12;
      buttonSize = 24;
      borderRadius = 4;
    } else if (size === "small") {
      fontSize = 12;
      buttonSize = 28;
      borderRadius = 4;
      iconSize = 12;
    } else if (size === "medium") {
      fontSize = 14;
      buttonSize = 36;
      borderRadius = 6;
      iconSize = 16;
    } else if (size === "large") {
      fontSize = 16;
      buttonSize = 40;
      borderRadius = 4;
      iconSize = 20;
    } else {
      fontSize = 12;
      buttonSize = 28;
      borderRadius = 6;
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

        case BtnType.TeritiaryRegular:
          btnClass = "custom-btn-teritiary-regular";
          break;
        case BtnType.TeritiaryDanger:
          btnClass = "custom-btn-teritiary-danger";
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
  {tabindex}
  {id}
  disabled={disable}
<<<<<<< HEAD
  style={`  ${`flex:none; transition:all 0.3s ease-in-out; margin-right:7px; min-width:${buttonSize}px; white-space:nowrap; height: ${buttonSize}px; width: ${customWidth}; border-radius: ${borderRadius}px;`} `}
=======
  style={` ${`flex:none; min-width:${buttonSize}px; white-space:nowrap; height: ${buttonSize}px; width: ${customWidth}; border-radius: ${borderRadius}px;`}  `}
>>>>>>> b362302354c8c8c39d740c18cc4c308d7568ae29
  class={`${buttonClassProp}  
 py-1 px-${title.length > 0 ? 3 : 2} gap-2 d-flex align-items-center justify-content-center
  ${btnClass}`}
  on:click={(e) => {
    onClick(e);
  }}
>
  {#if startIcon}
    <svelte:component
      this={startIcon}
      height={`${iconSize}px`}
      width={`${iconSize}px`}
      size={`${iconSize}px`}
      useParentColor={true}
      {color}
    />
  {/if}

  {#if loader}
    <span class="d-flex justify-content-center">
      <Spinner size={`${iconSize}px`} />
    </span>
  {:else if title}
    <span style={` font-size:${fontSize}px; font-weight:500; `}>
      {title}
    </span>
  {/if}

  {#if endIcon}
    <svelte:component
      this={endIcon}
      height={`${iconSize}px`}
      width={`${iconSize}px`}
      useParentColor={true}
    />
  {/if}
</button>

<style lang="scss">
  .button-wrapper {
    position: relative;
    display: inline-block;
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
