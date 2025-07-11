<script lang="ts">
  import { DismissRegular, ErrorCircleFilled } from "../../icons";
  import CheckmarkCircleFilled from "../../icons/CheckmarkCircleFilled.svelte";
  import WarningFilled from "../../icons/WarningFilled.svelte";
  import { Button } from "../button";
  import { SparrowLogo } from "@sparrow/common/images";

  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  export let description = "Could not Send Request";
  export let heading = "";
  export let icon;
  export let ctaTitle = "Try Again";
  export let ctaShow = false;
  export let onClick = () => {};
  export let varient: "error" | "success" | "warning" | "info" = "error";
  export let containerWidth = "543px";
  export let closeIconRequired = false;
  export let onClickClose = () => {};

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

  const handleAlert_try_response = ({ event_name }: { event_name: string }) => {
    captureEvent("try_response", {
      component: "Alert",
      button_text: event_name,
      destination: event_name,
    });
  };
</script>

<div>
  <div
    class={`${componentClass} ${containerWidth ? "" : "w-100"}`}
    style="max-width: {containerWidth}; min-height:56px; background-color:var(--bg-ds-surface-500); margin-bottom:10px; overflow:hidden;"
  >
    <div
      class="d-flex align-items-start flex-row"
      style="gap:16px; padding:16px;"
    >
      <div
        style="height: 100%; width: 32px; display:flex; align-items:center; justify-content:center;"
      >
        <div
          class="absolute inset-0 opacity-40 rounded-full"
          style="background-color:var(--bg-ds-surface-100); border-radius:50%; height:32px; width:32px; display:flex; align-items:center; justify-content:center;"
        >
          {#if varient === "error"}
            <span class="icon-backdrop-error" />
            <ErrorCircleFilled color={"var(--bg-ds-danger-400)"} />
          {:else if varient === "success"}
            <span class="icon-backdrop-success" />
            <CheckmarkCircleFilled color={"var(--icon-ds-success-400)"} />
          {:else if varient === "warning"}
            <span class="icon-backdrop-warning" />
            <WarningFilled color={"var(--icon-ds-warning-400)"} />
          {:else if varient === "info"}
            <span class="icon-backdrop-info" />
            <ErrorCircleFilled color={"var(--icon-ds-primary-300)"} />
          {/if}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; min-width: 322px;">
        {#if heading}
          <p
            class="text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
            style="text-align: left; margin:0;  color:var(--text-ds-neutral-50);"
          >
            {heading}
          </p>
        {/if}

        <div class="d-flex flex-column">
          <slot name="body-slot" />
          <p
            class="mb-0 pe-3 text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-regular"
            style=" color:var(--text-ds-neutral-50);"
          >
            {description}
          </p>
        </div>
      </div>
      {#if ctaShow}
        <div>
          <Button
            type="outline-secondary"
            size="small"
            title={ctaTitle}
            onClick={() => {
              handleAlert_try_response({
                event_name: ctaTitle + "Clicked!",
              });
              onClick();
            }}
          />
        </div>
      {/if}
      {#if closeIconRequired}
        <div style="margin-left: auto;">
          <Button
            size="small"
            type="teritiary-regular"
            startIcon={DismissRegular}
            onClick={() => {
              onClickClose();
            }}
          />
        </div>
      {/if}
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
    position: relative;
    border-radius: 6px;
    border: 2px solid var(--bg-ds-success-400);
    border-right-width: 0;
    border-top-width: 0;
    border-bottom-width: 0;
  }
  .warningClass {
    position: relative;
    border-radius: 6px;
    border: 2px solid var(--bg-ds-warning-400);
    border-right-width: 0;
    border-top-width: 0;
    border-bottom-width: 0;
  }
  .infoClass {
    position: relative;
    border-radius: 6px;
    border: 2px solid var(--bg-ds-primary-300);
    border-right-width: 0;
    border-top-width: 0;
    border-bottom-width: 0;
  }

  .icon-backdrop-error {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    z-index: 1;
    top: 50%;
    left: 6%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(235, 86, 81, 0.25) 0%,
      rgba(235, 86, 81, 0.1) 60%,
      rgba(29, 33, 43, 0) 100%
    );
  }
  .icon-backdrop-success {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    z-index: 1;
    top: 50%;
    left: 7%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(25, 160, 80, 0.25) 0%,
      rgba(29, 33, 43, 0) 100%
    );
  }
  .icon-backdrop-info {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    z-index: 1;
    top: 50%;
    left: 7%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(79, 172, 254, 0.25) 0%,
      rgba(29, 33, 43, 0) 100%
    );
  }
  .icon-backdrop-warning {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    z-index: 1;
    top: 50%;
    left: 7%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(236, 197, 81, 0.25) 0%,
      rgba(29, 33, 43, 0) 100%
    );
  }
</style>
