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
  export let onGenerateAiResponse;

  let isResponseGenerating = false;
  const sendPrompt = async (text: string) => {
    if (text) {
      isResponseGenerating = true;
      onUpdateAiConversation([
        ...$tab?.property?.request?.ai?.conversations,
        {
          message: text,
          messageId: "",
          type: "SENDER",
          isLiked: false,
          isDisliked: false,
        },
      ]);
      const response = await onGenerateAiResponse(text, "", "");
      isResponseGenerating = false;
    }
  };
</script>

{#if $tab?.property?.request?.state?.isChatbotActive}
  <div
    style="position: fixed;
  top:200px;
   bottom: 80px;
   right:18px;
   z-index: 200;
   width: 320px;
   "
  >
    <AIChatInterface
      conversations={$tab?.property?.request?.ai?.conversations}
      prompt={$tab?.property?.request?.ai?.prompt}
      {onUpdateAiPrompt}
      {sendPrompt}
      {isResponseGenerating}
    />
  </div>
{/if}
{#if !$tab?.property?.request?.state?.isChatbotActive}
  <div
    style="position: fixed;
   bottom: 80px;
   right:18px;
   z-index: 200;
   width: 200px;
   "
  >
    <AISuggestionBox
      onClick={(text = "") => {
        if (!isResponseGenerating) {
          sendPrompt(text);
          onUpdateRequestState({
            isChatbotActive: true,
          });
        }
      }}
      title="Generate Curl"
    />
    <AISuggestionBox
      onClick={(text = "") => {
        if (!isResponseGenerating) {
          sendPrompt(text);
          onUpdateRequestState({
            isChatbotActive: true,
          });
        }
      }}
      title="Generate Documentation"
    />
    <AISuggestionBox
      onClick={(text = "") => {
        if (!isResponseGenerating) {
          sendPrompt(text);
          onUpdateRequestState({
            isChatbotActive: true,
          });
        }
      }}
      title="Generate Mock Parameter Data"
    />
  </div>
{/if}
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
