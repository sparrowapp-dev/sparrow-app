<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  //   export let filterData = [];
  export let environmentAxisX;
  export let environmentAxisY;
  export let localEnvKey;
  export let handleEnvironmentBox;
  export let id;
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
  class="select-environment-popup bg-tertiary-700 d-flex p-3 rounded"
  style="
      top:{environmentAxisY}px;
      left:{environmentAxisX}px;
      "
>
  <div class="left-panel pe-2 w-100">
    <p class={reviewEnv?.type === "G" ? "global-base" : "local-base"}>
      baseUrl
    </p>
    <div class="d-flex">
      <span class="pe-3">SCOPE</span>
      <span>{reviewEnv?.type === "G" ? "Global" : "Environment"}</span>
    </div>
    <div class="d-flex">
      <span class="pe-3">VALUE</span>
      <span>{reviewEnv?.value}</span>
    </div>
  </div>
</div>

<style>
  .select-environment-popup {
    width: 400px;
    height: 250px;
    position: fixed;
    z-index: 900;
    flex-wrap: wrap;
  }
  .select-environment-popup .left-panel {
    height: 220px;
    overflow-y: auto;
  }

  .local-base {
    color: #3670f7;
  }
  .global-base {
    color: #69d696;
  }
</style>
