<script>
  import {
    AIChatInterface,
    AiChatToggler,
    AISuggestionBox,
  } from "../components";
  let isChatBoxOpen = false;
</script>

<div
  style="position: fixed;
  top:200px;
   bottom: 80px;
   right:18px;
   z-index: 200;
   width: 320px;
   "
>
  {#if isChatBoxOpen}
    <AIChatInterface />
  {/if}
</div>
<div
  style="position: fixed;
   bottom: 80px;
   right:18px;
   z-index: 200;
   width: 200px;
   "
>
  {#if !isChatBoxOpen}
    <AISuggestionBox title="Generate Curl" />
    <AISuggestionBox title="Generate Documentation" />
    <AISuggestionBox title="Generate Mock data" />
  {/if}
</div>
<div
  style="position: fixed;
   bottom: 22px;
   right:18px;
   z-index: 200;"
>
  <div
    class="sparrow-ai-icon"
    role="button"
    on:click={() => (isChatBoxOpen = !isChatBoxOpen)}
  >
    <AiChatToggler height="42px" width="42px" {isChatBoxOpen} />
  </div>
</div>

<style>
</style>
