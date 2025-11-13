<script lang="ts">
  import { NoCode } from "./sub-components";

  export let tests;
  export let onTestsChange;
  export let tabSplitDirection = "horizontal";
  export let testResults;
  export let responseBody;
  export let responseHeader;
</script>

<div
  class="d-flex flex-column w-100 h-100"
  style="position: relative;"
  id="request-tab-test"
>
  <div style="flex:1; overflow:auto;">
    <NoCode
      {tabSplitDirection}
      {tests}
      {onTestsChange}
      {testResults}
      {responseBody}
      {responseHeader}
    />
  </div>
</div>
