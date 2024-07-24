<script lang="ts">
  import type { Observable } from "rxjs";
  import {
    AIChatInterface,
    AiChatToggler,
    AISuggestionBox,
  } from "../components";
  import type { RequestTab } from "@common/types/workspace";
  let isChatBoxOpen = false;

  export let tab: Observable<RequestTab>;
  export let onUpdateAiPrompt;
  export let onUpdateAiConversation;
  export let onUpdateRequestState;
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
  {#if $tab?.property?.request?.state?.isChatbotActive}
    <AIChatInterface
      conversations={$tab?.property?.request?.ai?.conversations}
      prompt={$tab?.property?.request?.ai?.prompt}
      {onUpdateAiPrompt}
      {onUpdateAiConversation}
    />
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
  {#if !$tab?.property?.request?.state?.isChatbotActive}
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
    on:click={() => {
      onUpdateRequestState({
        isChatbotActive: !$tab?.property?.request?.state?.isChatbotActive,
      });
    }}
  >
    <AiChatToggler
      height="42px"
      width="42px"
      isChatBoxOpen={$tab?.property?.request?.state?.isChatbotActive}
    />
  </div>
</div>

<style>
</style>
