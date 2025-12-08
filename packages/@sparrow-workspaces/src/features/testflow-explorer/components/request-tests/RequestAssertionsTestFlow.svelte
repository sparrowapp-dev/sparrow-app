<script lang="ts">
  import { NoCode } from "./sub-components";

  export let tests;
  export let onTestsChange;
  export let tabSplitDirection = "horizontal";
  export let testResults;
  export let responseBody;
  export let responseHeader;

  let noCodeComponent: any;

  // Expose method to reset unsaved changes
  export const resetUnsavedChanges = () => {
    if (noCodeComponent?.resetUnsavedChanges) {
      noCodeComponent.resetUnsavedChanges();
    }
  };
</script>

<div
  class="d-flex flex-column w-100 h-100"
  style="position: relative;"
  id="request-tab-test"
>
  <div style="flex:1; overflow:auto;">
    {#if tests}
      <NoCode
        bind:this={noCodeComponent}
        {tabSplitDirection}
        {tests}
        {onTestsChange}
        {testResults}
        {responseBody}
        {responseHeader}
      />
    {/if}
  </div>
</div>
