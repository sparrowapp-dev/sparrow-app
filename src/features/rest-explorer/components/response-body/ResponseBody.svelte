<script lang="ts">
  import CodeMirrorResponse from "$lib/components/editor/CodeMirrorResponse.svelte";
  export let response;
  export let apiState;
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between w-100 h-100 response-body"
>
  <div class="w-100 mt-3 backgroundColor position-relative">
    <CodeMirrorResponse
      formatter={apiState.responseFormatter}
      rawTab={apiState.responseRaw}
      rawValue={response.body}
    />
  </div>
</div>

<style>
  .response-body {
    overflow-y: scroll;
    overflow-x: hidden;
  }
</style>
