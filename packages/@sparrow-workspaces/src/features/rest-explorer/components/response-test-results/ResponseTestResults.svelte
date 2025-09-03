<!-- btoa stands for "binary to ASCII," and it's a JavaScript function for converting binary data into a base64-encoded ASCII string. The btoa function is commonly used to encode binary data, such as images or other file formats, into a format that can be safely included in text-based data formats like JSON or HTML. -->
<script lang="ts">
  export let responseTestResults = [];
  $: {
    console.log("responseTestResults", responseTestResults);
  }
</script>

<div
  class="d-flex flex-column align-items-center pt-0 w-100 h-100 response-header"
>
  {#each responseTestResults as testCases}
    <div
      class="d-flex align-items-center justify-content-center ps-0 gap-1 mb-1 w-100"
      style="min-width: 28px;"
    >
      {testCases?.testName} | {testCases?.testMessage} | {testCases?.testStatus
        ? "Passed"
        : "Failed"}
    </div>
  {/each}
</div>

<style>
  input::placeholder {
    color: var(--white-color);
  }
</style>
