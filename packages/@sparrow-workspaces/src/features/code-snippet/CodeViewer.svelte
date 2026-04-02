<script lang="ts">
  import hljs from "highlight.js";
  import "highlight.js/styles/github-dark.css";

  export let code = "";

  let formatted = "";

  $: formatted = hljs.highlightAuto(code).value;
</script>

<pre class="code">
  <code>{@html formatted}</code>
</pre>

<style>
  .code {
    background: #0d1117;
    padding: 12px;
    border-radius: 6px;
    font-size: 12px;
    overflow: auto;
  }
</style>
