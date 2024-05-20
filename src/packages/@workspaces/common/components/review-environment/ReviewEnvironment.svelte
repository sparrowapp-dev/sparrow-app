<script lang="ts">
  import { notifications } from "@library/ui/toast/Toast";
  import copyToClipBoard from "$lib/utils/copyToClipboard";
  import { CopyIcon, DotIcon } from "@library/icons";
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
      environmentVariables.filtered.forEach((element) => {
        if (element.key === localEnvKey) {
          reviewEnv = element;
        }
      });
    }
  }
</script>

<div
  id={`env-review-${id}`}
  class="select-environment-popup bg-tertiary-400 d-flex p-3 rounded"
  style="
      top:{environmentAxisY}px;
      left:{environmentAxisX}px;
      "
>
  <div class="content-panel w-100">
    <p
      class={reviewEnv?.type === "G"
        ? "global-base text-fs-10"
        : "local-base text-fs-10"}
    >
      <DotIcon color={reviewEnv?.type === "G" ? "#3670f7" : "#69d696"} /> baseURL
    </p>
    <div class="d-flex">
      <span class="text-secondary-200 text-fs-11" style="width:55px;"
        >SCOPE</span
      >
      <span class="text-fs-9"
        >{reviewEnv?.type === "G" ? "Global" : "Environment"}</span
      >
    </div>
    <div class="d-flex">
      <span class="text-secondary-200 text-fs-11" style="width:55px;"
        >VALUE</span
      >
      <div class="d-flex" style="width: calc(100% - 55px);">
        <div class="text-fs-9 env-value" style="width: calc(100% - 20px);">
          {reviewEnv?.value}
        </div>
        <div style="width: 20px;" class="ps-2 d-flex align-items-end">
          <div
            role="button"
            class="prevent-default"
            on:click={async (e) => {
              e.preventDefault();
              await copyToClipBoard(reviewEnv?.value);
              notifications.success("Copied to Clipboard");
            }}
          >
            <CopyIcon />
          </div>
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
</style>
