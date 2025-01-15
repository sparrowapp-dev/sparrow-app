<script lang="ts">
  import { ArrowIcon, RunIcon } from "@sparrow/library/icons";
  import { Spinner } from "@sparrow/library/ui";

  export let title = "Submit";
  export let onClick: (e) => void;
  export let loaderSize = 16;
  export let disable = false;
  export let loader = false;
  export let textClassProp = "";
  export let textStyleProp = "";
  export let type: "default" | "dark" = "default";
  export let iconRequired = false;
  export let icon = RunIcon;
  export let iconColor = "";
  export let iconHeight = "14px";
  export let iconWidth = "14px";

  let componentStyle = "";
  export { componentStyle as style };

  enum BtnType {
    DEFAULT = "default",
    DARK = "dark",
  }

  // define button variants
  let btnClass = "";
  switch (type) {
    case BtnType.DEFAULT:
      btnClass = "custom-btn-default";
      break;
    case BtnType.DARK:
      btnClass = "custom-btn-dark";
      break;
    default:
      btnClass = "";
      break;
  }
  const Icon = icon;
</script>

<button
  disabled={disable}
  class={`border-0`}
  style="background-color: transparent; {componentStyle}"
>
  <div
    class="d-flex justify-content-center h-100 border-radius-2 overflow-hidden"
  >
    <button
      class="main-body py-1 px-3 h-100 border-0 {btnClass}"
      on:click={(e) => {
        if (!disable) {
          onClick(e);
        }
      }}
    >
      {#if loader}
        <span class="mx-2 d-flex justify-content-center">
          <Spinner size={`${loaderSize}px`} />
        </span>
      {:else if !loader}
        {#if iconRequired}
          <span
            ><Icon
              height={iconHeight}
              width={iconWidth}
              color={iconColor}
            /></span
          >
        {/if}
        <span class={textClassProp} style={textStyleProp}>
          {title}
        </span>
      {/if}
    </button>
    <!-- <div class="main-body py-1 px-2 h-100 {btnClass} position-relative">
        <div
          class="position-absolute start-0"
          style="width: 1px; height: 64%; top: 17%; background-color: var(--save-button-line);"
        />
        <span class={textClassProp} style={textStyleProp}> <ArrowIcon /> </span>
      </div> -->
  </div>
</button>

<style lang="scss">
  .sparrow-icon-btn {
    background-color: transparent;
    border: 0px;
  }
  .main-body.custom-btn-default {
    background-color: var(--bg-primary-300);
    color: var(--white-color);
  }
  .main-body.custom-btn-default:hover {
    background-color: var(--bg-primary-250);
  }
  .main-body.custom-btn-default:active {
    background-color: var(--bg-primary-500);
  }
  .main-body.custom-btn-dark {
    background-color: var(--bg-secondary-400);
    color: var(--white-color);
  }
  .main-body.custom-btn-dark:hover {
    background-color: var(--bg-secondary-300);
  }
  .main-body.custom-btn-dark:active {
    background-color: var(--bg-secondary-300);
  }
</style>
