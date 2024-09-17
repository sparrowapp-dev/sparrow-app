<script lang="ts">
  import { ArrowIcon } from "@library/icons";
  import {Spinner} from "@library/ui";

  export let title = "Submit";
  export let onClick: (e) => void;
  export let loaderSize = 16;
  export let disable = false;
  export let loader = false;
  export let textClassProp = "";
  export let textStyleProp = "";
  export let type: "default" = "default";
  enum BtnType {
    DEFAULT = "default",
  }

  // define button variants
  let btnClass = "";
  switch (type) {
    case BtnType.DEFAULT:
      btnClass = "custom-btn-default";
      break;
    default:
      btnClass = "";
      break;
  }
</script>

<button
  disabled={disable}
  class={`border-0`}
  style="background-color: transparent;"
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
</style>
