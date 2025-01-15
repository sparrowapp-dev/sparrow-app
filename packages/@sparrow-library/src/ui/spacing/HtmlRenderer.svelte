<script lang="ts">
  import { marked } from "marked";

  export let data: string = ""; // Markdown data to render
  export let padding: string = "16px"; // Default padding
  export let margin: string = "0"; // Default margin
</script>

<div>{@html data}</div>
