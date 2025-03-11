<script lang="ts">
  import { DismissRegular, ErrorCircleFilled } from "../../icons";
  import CheckmarkCircleFilled from "../../icons/CheckmarkCircleFilled.svelte";
  import WarningFilled from "../../icons/WarningFilled.svelte";
  import { Button } from "../button";
  import { SparrowLogo } from "@sparrow/common/images";

  export let description: "Could not Send Request";
  export let heading: "Error";
  export let icon;
  export let varient: "error" | "success" | "warning" | "info" = "error";

  let componentClass;
  switch (varient) {
    case "error":
      componentClass = "errorClass";
      break;
    case "success":
      componentClass = "successClass";
      break;
    case "warning":
      componentClass = "warningClass";
      break;
    case "info":
      componentClass = "infoClass";
      break;
    default:
      componentClass = "errorClass";
  }
</script>

<div>
  <div
    class={componentClass}
    style="width: 543px; min-height:56px; background-color:var(--bg-ds-surface-500); margin-bottom:10px;"
  >
    <div
      class="d-flex align-items-start flex-row"
      style=" gap:16px; padding:16px;  "
    >
      <div
        style="height: 100%; width: 32px; display:flex; align-items:center; justify-content:center; "
      >
        <div
          class="absolute inset-0 opacity-40 rounded-full"
          style="background-color:var(--bg-ds-surface-100); border-radius:50%; height:32px; width:32px; display:flex; align-items:center; justify-content:center;"
        >
          {#if varient === "error"}
            <span class="icon-backdrop-error" />
            <ErrorCircleFilled color={"var(--bg-ds-danger-400)"} />
          {:else if varient === "success"}
            <CheckmarkCircleFilled color={"var(--icon-ds-success-400)"} />
          {:else if varient === "warning"}
            <WarningFilled color={"var(--icon-ds-warning-400)"} />
          {:else if varient === "info"}
            <ErrorCircleFilled color={"var(--icon-ds-primary-300)"} />
          {/if}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; min-width: 322px; ">
        <p
          class="text-secondary-200 text-fs-14 fw-bold"
          style="text-align: left; margin:0; font-size:12px; font-weight:500; color:var(--text-ds-neutral-50);"
        >
          {heading}
        </p>

        <div class="d-flex flex-column">
          <p
            class="mb-0 text-fs-12 pe-3"
            style="font-size:12px; font-weight:400; color:var(--text-ds-neutral-50);"
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .errorClass {
    position: relative;
    border-radius: 6px;
    border: 2px solid var(--bg-ds-danger-400);
    border-right-width: 0;
    border-top-width: 0;
    border-bottom-width: 0;
    box-shadow: 0px 16px 32px rgba(0, 0, 0, 0.3);
  }
  .successClass {
    border-radius: 6px;
    border: 2px solid var(--bg-ds-success-400);
    border-right-width: 0;
    border-top-width: 0;
    border-bottom-width: 0;
  }
  .warningClass {
    border-radius: 6px;
    border: 2px solid var(--bg-ds-warning-400);
    border-right-width: 0;
    border-top-width: 0;
    border-bottom-width: 0;
  }
  .infoClass {
    border-radius: 6px;
    border: 2px solid var(--bg-ds-primary-300);
    border-right-width: 0;
    border-top-width: 0;
    border-bottom-width: 0;
  }

  .icon-backdrop-error {
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    z-index: 1;
    top: 50%;
    left: 7%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(235, 86, 81, 0.25) 0%,
      /* Increased opacity from 0.13 to 0.25 */ rgba(235, 86, 81, 0.1) 60%,
      /* Added middle stop with some opacity */ rgba(29, 33, 43, 0) 100%
    );
  }
  .icon-backdrop-success {
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    z-index: 1;
    top: 50%;
    left: 7%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(51, 204, 122, 0.12) 0%,
      rgba(29, 33, 43, 0) 100%
    );
  }
  .icon-backdrop-info {
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    z-index: 1;
    top: 50%;
    left: 7%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(51, 204, 122, 0.12) 0%,
      rgba(29, 33, 43, 0) 100%
    );
  }
  .icon-backdrop-warning {
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    z-index: 1;
    top: 50%;
    left: 7%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(236, 197, 81, 0.13) 0%,
      rgba(29, 33, 43, 0) 100%
    );
  }
</style>
