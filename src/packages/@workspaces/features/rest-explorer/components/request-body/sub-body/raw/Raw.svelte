<script lang="ts">
  import CodeMirror from "$lib/components/editor/CodeMirror.svelte";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let onUpdateRequestBody: (data: string) => void = () => {};
  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestBody({ raw: e.detail });
  };
</script>

<div class="request-body position-relative">
  <CodeMirror
    bind:lang
    bind:value
    on:change={handleCodeMirrorChange}
    isEditable={true}
  />
</div>

<style>
  .request-body {
    max-height: calc(100% - 150px);
    overflow-y: scroll;
    overflow-x: hidden;
  }
</style>
