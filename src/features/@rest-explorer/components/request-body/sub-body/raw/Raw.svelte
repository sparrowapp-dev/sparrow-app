<script lang="ts">
  import CodeMirror from "$lib/components/editor/CodeMirror.svelte";
  export let lang: "HTML" | "JSON" | "XML" | "JavaScript" | "Text" = "Text";
  export let value = "";
  export let onUpdateRequestBody: (data: string) => void = () => {};
  const handleCodeMirrorChange = (e: CustomEvent<string>) => {
    onUpdateRequestBody({ raw: e.detail });
  };
</script>

<div class="request-body h-100 position-relative">
  <CodeMirror
    bind:lang
    bind:value
    on:change={handleCodeMirrorChange}
    codeMirrorStyle={"basic"}
    isEditable={true}
  />
</div>

<style>
  .request-body {
    overflow-y: scroll;
    overflow-x: hidden;
  }
</style>
