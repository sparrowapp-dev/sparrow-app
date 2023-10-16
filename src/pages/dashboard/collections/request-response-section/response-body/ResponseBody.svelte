<script>
  import { JSONEditor } from "svelte-jsoneditor";

  let content = {
    text: undefined, // can be used to pass a stringified JSON document instead
    json: {
      array: [1, 2, 3],
      boolean: true,
      color: "#82b92c",
      null: null,
      number: 123,
      object: { a: "b", c: "d" },
      string: "Hello World",
    },
  };

  $: console.log("contents changed:", content);
</script>

<div class="editor ps-3 rounded">
  <JSONEditor bind:content />
</div>

<style>
  .editor {
    width: 100%;
    max-width: 600px;
    height: 400px;
    /* background: #000000; */
  }
</style>
