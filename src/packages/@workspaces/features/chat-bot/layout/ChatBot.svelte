<script>
  import { SparrowChatBotIcon } from "@library/icons";
  import { AIChatInterface, AISuggestionBox } from "../components";
  let isChatBoxOpen = false;
</script>

<div
  style="position: fixed;
   bottom: 0;
   right: 0;
   margin-bottom:31px;
   margin-right:27px;"
>
  {#if !isChatBoxOpen}
    <AISuggestionBox title="Generate Curl" />
    <AISuggestionBox title="Generate Documentation" />
    <AISuggestionBox title="Generate Mock data" />
  {:else}
    <AIChatInterface />
  {/if}
  <div
    class="sparrow-ai-icon"
    on:click={() => (isChatBoxOpen = !isChatBoxOpen)}
  >
    <SparrowChatBotIcon height="42px" width="42px" />
  </div>
</div>

<style>
  .sparrow-ai-icon {
    cursor: pointer;
    align-self: flex-end;
    text-align: right;
  }
</style>
