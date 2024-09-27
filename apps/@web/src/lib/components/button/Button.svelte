<script lang="ts">
    import Spinner from "../transition/Spinner.svelte";
  
    export let title = "Submit";
    export let onClick: (e) => void = ()=>{};
    export let loaderSize = 22;
    export let disable = false;
    export let loader = false;
    export let buttonStyleProp = "";
    export let buttonClassProp = "";
    export let textClassProp = "";
    export let textStyleProp = "";
    export let allowChild = false;
    export let type:
      | "primary"
      | "dark"
      | "danger"
      | "primary-gradient"
      | "transparent"
      | "other"
      | "icon" = "other";
    enum BtnType {
      PRIMARY = "primary",
      DARK = "dark",
      DANGER = "danger",
      TRANSPARENT = "transparent",
      PRIMARY_GRADIENT = "primary-gradient",
      OTHER = "other",
      ICON = "icon",
    }
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
      case BtnType.TRANSPARENT:
        btnClass = "custom-btn-transparent";
        break;
      case BtnType.ICON:
        btnClass = "sparrow-icon-btn";
        break;
      case BtnType.PRIMARY_GRADIENT:
        btnClass = "custom-btn-primary-gradient"
        break;
      default:
        btnClass = "";
        break;
    }
  </script>
  
  <button
    disabled={disable}
    style={`${buttonStyleProp} ${
      type !== "other" && type !== "icon"
        ? "border-radius: 4px; padding: 6px 12px;"
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
    {#if loader && !allowChild}
      <span class="mx-2 d-flex justify-content-center">
        <Spinner size={`${loaderSize}px`} />
      </span>
    {:else if !loader && !allowChild}
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
      background: var(--primary-btn-color);
      color: var(--white-color);
    }
    .custom-btn-primary-gradient{
        // background: linear-gradient(270deg, #6147ff -1.72%, #1193f0 100%);
        background: var(--primary-color);
        color: white;
    }
    .custom-btn-primary-gradient:hover{
         background: var( --primary-btn-color-hover)
    }
    .custom-btn-primary-gradient:active{
      background: var(--button-pressed);
    }
    .custom-btn-dark {
      background-color: var(--border-color);
      color: var(--white-color);
    }
    .custom-btn-dark:hover {
      background-color: var(--sparrow-button-background);
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
  </style>
  