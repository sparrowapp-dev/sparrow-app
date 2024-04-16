<script lang="ts">
  import CodeMirror from "$lib/components/editor/CodeMirror.svelte";
  export let response;
  export let apiState;

  let language = apiState.responseRaw;
  $: {
    if (apiState) {
      if (apiState.responseFormatter === "Raw") {
        language = "Text";
      } else {
        language = apiState.responseRaw;
      }
    }
  }
</script>

<div
  class="d-flex flex-column align-items-start justify-content-between w-100 h-100 response-body"
>
  <div class="w-100 backgroundColor position-relative">
    <CodeMirror
      bind:lang={language}
      bind:value={response.body}
      on:change={() => {}}
      codeMirrorStyle={"basic"}
      isEditable={false}
      isPretty={true}
    />
  </div>
</div>

<style>
  .response-body {
    overflow-y: scroll;
    overflow-x: hidden;
  }
</style>
