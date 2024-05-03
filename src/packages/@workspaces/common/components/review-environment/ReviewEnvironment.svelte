<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  //   export let filterData = [];
  export let environmentAxisX;
  export let environmentAxisY;
  export let localEnvKey;
  export let handleEnvironmentBox;
  export let id;
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
</script>

<div
  id={`env-review-${id}`}
  class="select-environment-popup bg-tertiary-700 d-flex p-3 rounded"
  style="
      top:{environmentAxisY}px;
      left:{environmentAxisX}px;
      "
>
  <div class="left-panel pe-2 w-100">
    {localEnvKey}
  </div>
</div>

<style>
  .select-environment-popup {
    width: 400px;
    height: 250px;
    position: fixed;
    z-index: 2000;
    flex-wrap: wrap;
  }
  .select-environment-popup .left-panel {
    height: 220px;
    overflow-y: auto;
  }
  .select-environment-popup .right-panel {
    height: 190px;
  }
  .variable-title {
    font-size: 12px;
    font-weight: 400;
    color: white;
  }
  .global-environment {
    background-color: #3670f7;
  }
  .local-environment {
    background-color: #69d696;
  }
  .select-env-info {
    font-size: 12px;
    color: #999999;
    margin-top: 10px;
  }
  .env-title {
    color: #999999;
    font-size: 12px;
  }
  .env-value {
    font-size: 12px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 3; /* Number of lines to show */
    text-overflow: ellipsis;
    white-space: normal; /* Use 'normal' instead of 'nowrap' */
    color: white;
  }
  .default-environment {
    font-size: 10px;
    text-align: center;
    color: #999999;
  }
  .env-item:hover {
    background-color: var(--bg-tertiary-400);
  }
</style>
