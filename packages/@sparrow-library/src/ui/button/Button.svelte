<script lang="ts">
  import Spinner from "../spinner/Spinner.svelte";

  export let title = "";
  export let onClick: (e) => void;
  export let loaderSize = 16;
  export let disable = false;
  export let loader = false;
  export let buttonStyleProp = "font-size: var(--base-text)";
  export let buttonClassProp = "";
  export let textClassProp = "";
  export let textStyleProp = "";
  export let buttonStartIcon: string | undefined = undefined;
  export let buttonStartIconStyle = "";
  export let buttonEndIcon: string | undefined = undefined;
  export let buttonEndIconStyle = "";
  export let allowChild = false;
  export let iconSize = 16;
  export let frontIconSize = 20;
  export let endIconSize = 20;
  export let buttonIcon: string | undefined = undefined;
  export let size: "small" | "medium" | "large" | "other" = "medium";
  let buttonSize = 24;
  if (size === "small") {
    buttonSize = 24;
  } else if (size === "medium") {
    buttonSize = 36;
  } else if (size === "large") {
    buttonSize = 40;
  } else {
    buttonSize = 24;
  }
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
    Underline = "underline",
  }

  // define button variants

  let btnClass = "";
  $: {
    if (size === "small") {
      buttonSize = 24;
    } else if (size === "medium") {
      buttonSize = 36;
    } else if (size === "large") {
      buttonSize = 40;
    } else {
      buttonSize = 24;
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
  style={`${buttonStyleProp} ${`display: flex; flex-direction: row; justify-content: center; align-items: center; height: ${buttonSize}px; width:auto; border-radius: 4px;`}`}
  class={`${buttonClassProp}  ${
    type !== "other" ? "py-1 px-3 d-flex align-items-center " : ""
  } ${btnClass}`}
  on:click={(e) => {
    onClick(e);
  }}
>
  {#if type === "icon-primary" || type === "icon-secondary" || type === "icon-danger" || type === "outline-icon-danger" || type === "outline-icon-primary" || type === "outline-icon-secondary" || type === "teritiary-icon-regular" || type === "teritiary-icon-danger"}
    <img
      src={buttonIcon}
      style={`height: ${iconSize}px; width: ${iconSize}px; border-radius: 50%; `}
      alt="icon"
    />
  {/if}
  {#if buttonStartIcon}
    <img
      src={buttonStartIcon}
      class="me-2"
      style={`${buttonStartIconStyle} height: ${frontIconSize}px; width: ${frontIconSize}px; border-radius: 50%; `}
      alt="icon"
    />
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
    <img
      src={buttonEndIcon}
      class="ms-2"
      style={`${buttonEndIconStyle} height: ${endIconSize}px; width: ${endIconSize}px; border-radius: 50%; `}
      alt="icon"
    />
  {/if}
</button>

<style lang="scss">
  .button-wrapper {
    position: relative;
    display: inline-block;
  }
  .sparrow-icon-primary-btn {
    background-color: var(--bg-primary-400);
    border-width: 0px;
  }
  .sparrow-icon-primary-btn:hover {
    background-color: var(--bg-ds-primary-300);
    border-width: 0px;
  }
  .sparrow-icon-primary-btn:active {
    background-color: var(--bg-primary-600);
    border-width: 0px;
  }
  .sparrow-icon-primary-btn-disable {
    background-color: transparent;
    color: var(--text-ds-primary-600);
    border-width: 1px;
    border-color: var(--border-ds-surface-400);
  }
  .sparrow-icon-secondary-btn {
    background-color: var(--bg-ds-surface-300);
    border-width: 0px;
  }
  .sparrow-icon-secondary-btn:hover {
    background-color: var(--bg-ds-surface-300);
    border-width: 0px;
  }
  .sparrow-icon-secondary-btn:active {
    background-color: var(--bg-primary-600); //
    border-width: 0px;
  }
  .sparrow-icon-secondary-btn-disable {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-500);
    border-width: 1px;
    border-color: var(--bg-ds-surface-400);
  }
  .sparrow-icon-danger-btn {
    background-color: var(--bg-ds-danger-400);
    border-width: 0px;
  }
  .sparrow-icon-danger-btn:hover {
    background-color: var(--bg-ds-danger-500);
    border-width: 0px;
  }
  .sparrow-icon-danger-btn:active {
    background-color: var(--bg-ds-danger-600);
    border-width: 0px;
  }
  .sparrow-icon-danger-btn-disable {
    background-color: var(--bg-ds-danger-700);
    border-width: 0px;
  }
  .sparrow-outline-icon-primary {
    background-color: transparent;
    border-width: 1px;
    border-color: var(--border-ds-surface-500);
  }
  .sparrow-outline-icon-primary:hover {
    background-color: var(--bg-primary-400);
    border-width: 0px;
  }
  .sparrow-outline-icon-primary:active {
    background-color: var(--bg-ds-primary-600);
    color: var(--white-color);
    border-width: 0px;
  }
  .sparrow-outline-icon-primary-disable {
    background-color: transparent;
    border-width: 1px;
    border-color: var(--border-ds-surface-500);
  }
  .sparrow-outline-icon-secondary {
    background-color: transparent;
    border-color: var(--border-ds-surface-50);
    border-width: 1px;
  }
  .sparrow-outline-icon-secondary:hover {
    background-color: var(--bg-ds-surface-300);
    border-width: 0px;
  }
  .sparrow-outline-icon-secondary:active {
    background-color: var(--bg-ds-surface-400);
    border-width: 0px;
  }
  .sparrow-outline-icon-secondary-disable {
    background-color: transparent;
    border-color: var(--border-ds-surface-50);
    border-width: 1px;
  }
  .sparrow-outline-icon-danger {
    background-color: transparent;
    color: var(--text-ds-danger-300);
    border-width: 1px;
    border-color: var(--border-ds-surface-50);
  }
  .sparrow-outline-icon-danger:hover {
    background-color: var(--bg-ds-danger-500);
    color: var(--white-color);
    border-width: 0px;
  }
  .sparrow-outline-icon-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--white-color);
    border-width: 0px;
  }
  .sparrow-outline-icon-danger-disable {
    background-color: transparent;
    color: var(--text-ds-danger-700);
    border-width: 1px;
    border-color: var(--bg-ds-surface-400);
  }
  .custom-btn-teritiary-icon-regular {
    background-color: transparent;
    color: var(--white-color);
    border: 0px;
  }
  .custom-btn-teritiary-icon-regular:hover {
    color: var(--white-color);
    background-color: var(--bg-ds-surface-300);
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
    color: var(--white-color);
    border: 0px;
  }
  .custom-btn-teritiary-icon-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--white-color);
    border: 0px;
  }
  .custom-btn-teritiary-icon-danger-disable {
    background-color: transparent;
    color: var(--text-ds-danger-700);
    border-width: 0px;
  }
  .custom-btn-primary {
    background-color: var(--bg-primary-400);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-primary:hover {
    background-color: var(--bg-ds-primary-300);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-primary:focus {
    border: 2px solid var(--border-ds-primary-100);
    outline: none;
  }
  .custom-btn-primary:active {
    background-color: var(--bg-ds-primary-600);
    color: var(--white-color);
  }
  .custom-btn-primary-disable {
    background-color: var(--bg-ds-primary-700);
    color: var(--text-ds-neutral-400);
    border-width: 0px;
  }

  .custom-btn-outline-primary {
    background-color: transparent;
    color: var(--bg-ds-primary-300);
    border-width: 1px;
    border-color: var(--border-ds-surface-500);
  }
  .custom-btn-outline-primary:hover {
    background-color: var(--bg-ds-primary-400);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-outline-primary:active {
    background-color: var(--bg-ds-primary-600);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-outline-primary-disable {
    background-color: transparent;
    color: var(--text-ds-primary-600);
    border-width: 1px;
    border-color: var(--border-ds-surface-400);
  }
  .custom-btn-secondary {
    background-color: var(--bg-ds-surface-300);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-secondary:hover {
    background-color: var(--bg-ds-surface-100);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-secondary:active {
    background-color: var(--bg-ds-surface-400);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-secondary:focus {
    border: 2px solid var(--border-ds-primary-100);
    outline: none;
  }
  .custom-btn-secondary-disable {
    background-color: var(--bg-ds-surface-700);
    color: var(--text-ds-neutral-400);
    border-width: 0px;
  }
  .custom-btn-outline-secondary {
    background-color: transparent;
    border-color: var(--border-ds-surface-50);
    border-width: 1px;
    color: var(--white-color);
  }
  .custom-btn-outline-secondary:hover {
    background-color: var(--bg-ds-surface-300);
    border-width: 0px;
    color: var(--white-color);
  }
  .custom-btn-outline-secondary:active {
    background-color: var(--bg-ds-surface-400);
    border-width: 0px;
    color: var(--white-color);
  }
  .custom-btn-outline-secondary-disable {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-500);
    border-width: 1px;
    border-color: var(--bg-ds-surface-400);
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

  .custom-btn-dark:hover {
    background-color: var(--bg-tertiary-100);
  }
  .custom-btn-danger {
    background-color: var(--bg-ds-danger-500);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-danger:hover {
    background-color: var(--bg-ds-danger-400);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--white-color);
  }
  .custom-btn-danger-disable {
    background-color: var(--bg-ds-danger-700);
    border-width: 0px;
    color: var(--text-ds-neutral-400);
  }
  .custom-btn-outline-danger {
    background-color: transparent;
    color: var(--text-ds-danger-300);
    border-width: 1px;
    border-color: var(--border-ds-surface-50);
  }
  .custom-btn-outline-danger:hover {
    background-color: var(--bg-ds-danger-500);
    color: var(--white-color);
    border-width: 0px;
  }
  .custom-btn-outline-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--white-color);
    border-width: 0px;
  }

  .custom-btn-transparent {
    background-color: transparent;
    color: var(--white-color);
  }
  .custom-btn-teritiary-regular {
    background-color: transparent;
    color: var(--white-color);
    border: 0px;
  }

  .custom-btn-teritiary-regular:hover {
    color: var(--white-color);
    background-color: var(--bg-ds-surface-300);
    border: 0px;
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
    color: var(--white-color);
    border: 0px;
  }
  .custom-btn-teritiary-danger:active {
    background-color: var(--bg-ds-danger-600);
    color: var(--white-color);
    border: 0px;
  }
  .custom-btn-teritiary-danger-disable {
    background-color: transparent;
    color: var(--text-ds-danger-700);
    border-width: 0px;
  }

  .custom-btn-outline-danger-disable {
    background-color: transparent;
    color: var(--text-ds-danger-700);
    border-width: 1px;
    border-color: var(--bg-ds-surface-400);
  }
  .custom-btn-teritiary-regular-disable {
    background-color: transparent;
    color: var(--text-ds-neutral-500);
    border-width: 0px;
  }
</style>
