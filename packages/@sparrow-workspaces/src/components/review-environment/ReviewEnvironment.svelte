<script lang="ts">
  import { Button, notifications } from "@sparrow/library/ui";
  import { copyToClipBoard } from "@sparrow/common/utils";
  import { CopyIcon, CopyRegular, DotIcon } from "@sparrow/library/icons";
  import { onDestroy, onMount } from "svelte";

  /**
   * environment dialog box position
   */
  export let environmentAxisX;
  export let environmentAxisY;
  /**
   * review environment
   */
  export let localEnvKey;
  /**
   * handles environment dialog box
   */
  export let handleEnvironmentBox;
  /**
   * unique environment dialog box id
   */
  export let id;
  /**
   * environment data
   */
  export let environmentVariables;
  let count = 0;
  function handleSelectClicked(event: MouseEvent) {
    const selectElement = document.getElementById(`env-review-${id}`);
    if (count) {
      if (selectElement && !selectElement.contains(event.target as Node)) {
        handleEnvironmentBox("", "");
      }
    }
    count = count + 1;
  }

  onDestroy(() => {
    window.removeEventListener("click", handleSelectClicked);
  });

  onMount(() => {
    window.addEventListener("click", handleSelectClicked);
  });
  let reviewEnv;
  $: {
    if (environmentVariables) {
      for (let i = 0; i < environmentVariables.filtered.length; i++) {
        const element = environmentVariables.filtered[i];
        if (element.key === localEnvKey) {
          reviewEnv = element;
          break;
        }
      }
    }
  }
</script>

<div
  id={`env-review-${id}`}
  class="select-environment-popup d-flex rounded"
  style="
      top:{environmentAxisY}px;
      left:{environmentAxisX}px;
      background-color: var(--bg-ds-surface-600);
      padding: 12px;
      "
>
  <div class="content-panel w-100">
    <div
      style="margin-bottom: 12px;"
      class={reviewEnv?.type === "G"
        ? "global-base text-fs-10"
        : "local-base text-fs-10"}
    >
      <DotIcon
        color={reviewEnv?.type === "G" ? "#3670f7" : "#69d696"}
        height={"6px"}
        width={"6px"}
      /> baseURL
    </div>

    <div class="d-flex justify-content-between">
      <div>
        <div class="d-flex">
          <span
            class="text-secondary-200 text-fs-11"
            style="width:55px; font-size: 12px; line-height: 18px; color:var(--text-ds-neutral-300);"
            >SCOPE</span
          >
          <span
            style="font-weight: 400; font-size: 12px; line-height: 18px; color:var(--text-ds-neutral-50);"
            >{reviewEnv?.type === "G" ? "Global" : "Environment"}</span
          >
        </div>
        <div class="d-flex">
          <span
            class="text-secondary-200 text-fs-11"
            style="width:55px;font-size: 12px; line-height: 18px; color:var(--text-ds-neutral-300);"
            >VALUE</span
          >
          <div class="d-flex" style="width: calc(100% - 55px);">
            <div
              style="width: calc(100% - 20px); font-weight: 400; font-size: 12px; line-height: 18px; color:var(--text-ds-neutral-50); max-width:105px;whitespace:nowrap; overflow:hidden; text-overflow:ellipsis;"
            >
              {reviewEnv?.value}
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex align-items-center">
        <div
          role="button"
          class="copyIcon prevent-default"
          on:click={async (e) => {
            e.preventDefault();
            await copyToClipBoard(reviewEnv?.value);
            notifications.success("Copied to Clipboard");
          }}
        >
          <Button
            startIcon={CopyRegular}
            type="teritiary-regular"
            size="small"
          />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .select-environment-popup {
    width: 203px;
    height: auto;
    position: fixed;
    z-index: 900;
    flex-wrap: wrap;
    overflow-y: auto;
  }

  .local-base {
    color: #69d696;
  }
  .global-base {
    color: #3670f7;
  }
  .env-value {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 3; /* Number of lines to show */
    text-overflow: ellipsis;
    white-space: normal; /* Use 'normal' instead of 'nowrap' */
  }
  .copyIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
  }
  .copyIcon:hover {
    background: var(--bg-tertiary-300);
  }
</style>
